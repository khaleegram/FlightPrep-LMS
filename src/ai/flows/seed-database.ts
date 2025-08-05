
'use server';
/**
 * @fileOverview A flow to seed the Firestore database with realistic data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const SeedOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    usersCreated: z.number(),
    questionsCreated: z.number(),
});

export async function seedDatabase(): Promise<z.infer<typeof SeedOutputSchema>> {
  return seedDatabaseFlow();
}

const QuestionSchema = z.object({
  questionText: z.string().describe('The full text of the question.'),
  options: z.array(z.string()).min(4).max(4).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  subject: z.string().describe('The subject or topic the question belongs to (e.g., Air Law, Meteorology).'),
});

const QuestionsToGenerateSchema = z.object({
    questions: z.array(QuestionSchema).length(15),
});

const generateQuestionsPrompt = ai.definePrompt({
    name: 'generateQuestionsPrompt',
    output: { schema: QuestionsToGenerateSchema },
    prompt: `Generate 15 realistic and distinct multiple-choice questions for an aviation training platform. Cover a range of subjects including Air Law, Meteorology, Navigation, Aircraft Systems, and Principles of Flight. Ensure each question has exactly four options and one of them is the correct answer. The questions should be suitable for a Private Pilot License (PPL) or Commercial Pilot License (CPL) level.`,
});


const UserSchema = z.object({
    displayName: z.string().describe('The full name of the user, often a famous aviator.'),
    email: z.string().email().describe('The user\'s email address, formatted as "firstname.lastname@example.com".'),
    department: z.enum(['Flying School', 'Aircraft Maintenance Engineering', 'Air Traffic Control', 'Cabin Crew', 'Prospective Students']).describe('The department the user belongs to.'),
    leaderboardScore: z.number().int().min(3000).max(6000).describe('A realistic leaderboard score for the user.'),
});

const UsersToGenerateSchema = z.object({
    users: z.array(UserSchema).length(10),
});

const generateUsersPrompt = ai.definePrompt({
    name: 'generateUsersPrompt',
    output: { schema: UsersToGenerateSchema },
    prompt: `Generate a list of 10 realistic sample users for an aviation training platform. Include famous aviators and pilots. Ensure the data matches the required schema, including a unique email, department, and a plausible leaderboard score for each.`
});


const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    inputSchema: z.void(),
    outputSchema: SeedOutputSchema,
    auth: {
      policy: async (auth, input) => {
        if (!auth) throw new Error("Authentication required.");
        if (!auth.custom?.isAdmin) throw new Error("You must be an admin to perform this action.");
      },
    },
  },
  async () => {
    try {
      // 1. Seed Questions
      console.log('Generating questions...');
      const { output: questionsOutput } = await generateQuestionsPrompt();
      if (!questionsOutput) {
        throw new Error("Failed to generate questions from AI.");
      }
      const questions = questionsOutput.questions;
      const questionBatch = adminDb.batch();
      questions.forEach(q => {
        const docRef = adminDb.collection('questions').doc();
        questionBatch.set(docRef, { ...q, createdAt: new Date().toISOString() });
      });
      await questionBatch.commit();
      console.log(`${questions.length} questions have been added to Firestore.`);

      // 2. Seed Users
      console.log('Generating users...');
      const { output: usersOutput } = await generateUsersPrompt();
      if (!usersOutput) {
          throw new Error("Failed to generate users from AI.");
      }
      const usersToCreate = usersOutput.users;
      
      const userCreationPromises = usersToCreate.map(async (u) => {
        try {
            const userRecord = await adminAuth.createUser({
              email: u.email,
              password: 'password123',
              displayName: u.displayName,
            });
            await adminAuth.setCustomUserClaims(userRecord.uid, { isStudent: true });
            await adminDb.collection('users').doc(userRecord.uid).set({
              displayName: u.displayName,
              email: u.email,
              role: 'Student',
              department: u.department,
              leaderboardScore: u.leaderboardScore,
              createdAt: new Date().toISOString(),
            });
            return { email: u.email, status: 'success' };
        } catch(error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`User ${u.email} already exists. Skipping.`);
                return { email: u.email, status: 'exists' };
            }
            // Re-throwing other errors to be caught by the main catch block
            throw error;
        }
      });

      const results = await Promise.all(userCreationPromises);
      const successfulUsers = results.filter(r => r.status === 'success').length;
      console.log(`${successfulUsers} users have been created and added to Firestore.`);

      return {
        success: true,
        message: 'Database seeded successfully with AI-generated data.',
        usersCreated: successfulUsers,
        questionsCreated: questions.length,
      };
    } catch (error: any) {
      console.error('Error seeding database:', error);
      return {
        success: false,
        message: error.message || 'An unknown error occurred during seeding.',
        usersCreated: 0,
        questionsCreated: 0,
      };
    }
  }
);
