
'use server';

/**
 * @fileOverview Allows administrators to add new questions to the question bank.
 * 
 * - addQuestion - A function that handles adding a new question.
 * - AddQuestionInput - The input type for the addQuestion function.
 * - AddQuestionOutput - The return type for the addQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';

const AddQuestionInputSchema = z.object({
  questionText: z.string().describe('The full text of the question.'),
  options: z.array(z.string()).min(2, "At least two options are required.").describe('An array of possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  department: z.string().describe('The department the question belongs to (e.g., Flying School).'),
  subject: z.string().describe('The subject or topic the question belongs to (e.g., Air Law, Meteorology).'),
});
type AddQuestionInput = z.infer<typeof AddQuestionInputSchema>;

const AddQuestionOutputSchema = z.object({
  success: z.boolean().describe('Whether the question was added successfully.'),
  message: z.string().describe('A message indicating the result.'),
  questionId: z.string().optional().describe('The ID of the newly created question.'),
});
type AddQuestionOutput = z.infer<typeof AddQuestionOutputSchema>;

export async function addQuestion(input: AddQuestionInput): Promise<AddQuestionOutput> {
  return addQuestionFlow(input);
}

const addQuestionFlow = ai.defineFlow(
  {
    name: 'addQuestionFlow',
    inputSchema: AddQuestionInputSchema,
    outputSchema: AddQuestionOutputSchema,
    auth: {
      policy: async (auth, input) => {
        if (!auth) {
          throw new Error("Authentication required.");
        }
        if (!auth.custom?.isAdmin) {
          throw new Error("You must be an admin to perform this action.");
        }
      },
    },
  },
  async (input) => {
    try {
        const questionRef = adminDb.collection('questions').doc();
        await questionRef.set({
            ...input,
            createdAt: new Date().toISOString(),
        });

        return {
            success: true,
            message: `New question has been added to the ${input.subject} question bank.`,
            questionId: questionRef.id,
        };
    } catch (error: any) {
        console.error("Error adding question to Firestore:", error);
        return {
            success: false,
            message: "Failed to add question to the database.",
        };
    }
  }
);
