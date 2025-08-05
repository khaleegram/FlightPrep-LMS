
'use server';

/**
 * @fileOverview Allows administrators to create new exams by selecting questions from the existing question bank using an AI agent.
 * 
 * - createExam - A function that handles creating a new exam from the question bank.
 * - CreateExamInput - The input type for the createExam function.
 * - CreateExamOutput - The return type for the createExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';

const CreateExamInputSchema = z.object({
  title: z.string().describe('The title of the exam.'),
  description: z.string().describe('A brief description of the exam.'),
  duration: z.number().int().positive().describe('The duration of the exam in minutes.'),
  prompt: z.string().describe('A natural language prompt describing the desired exam content.'),
  questionCount: z.number().int().positive().describe('The number of questions to include in the exam.'),
});
export type CreateExamInput = z.infer<typeof CreateExamInputSchema>;

const CreateExamOutputSchema = z.object({
  success: z.boolean().describe('Whether the exam was created successfully.'),
  message: z.string().describe('A message indicating the result.'),
  examId: z.string().optional().describe('The ID of the newly created exam.'),
});
export type CreateExamOutput = z.infer<typeof CreateExamOutputSchema>;

// Define the schema for the AI's output, which is a list of selected question IDs
const ExamQuestionSelectionSchema = z.object({
    selectedQuestionIds: z.array(z.string()).describe('An array of question IDs that best match the user\'s prompt.')
});

const examBuilderPrompt = ai.definePrompt({
    name: 'examBuilderPrompt',
    input: { schema: z.any() },
    output: { schema: ExamQuestionSelectionSchema },
    prompt: `You are an AI agent that builds exams for an aviation training platform. You will be given a prompt describing the exam, a desired number of questions, and a list of all available questions from the database.

Your task is to select the most relevant question IDs from the list to create the exam based on the user's prompt. You must select exactly the number of questions requested.

Exam Prompt: {{{prompt}}}
Number of Questions to Select: {{{questionCount}}}

Available Questions (with their IDs and text):
----------------
{{#each questions}}
- ID: {{this.id}}, Text: {{this.questionText}}, Subject: {{this.subject}}
{{/each}}
----------------

Analyze the prompt and select the best question IDs. Return ONLY the JSON object with the selected IDs.
`,
});

export async function createExam(input: CreateExamInput): Promise<CreateExamOutput> {
  return createExamFlow(input);
}

const createExamFlow = ai.defineFlow(
  {
    name: 'createExamFromBankFlow',
    inputSchema: CreateExamInputSchema,
    outputSchema: CreateExamOutputSchema,
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
        // 1. Fetch all questions from Firestore
        const questionsSnapshot = await adminDb.collection('questions').get();
        const allQuestions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (allQuestions.length < input.questionCount) {
            return {
                success: false,
                message: `Cannot create exam. Requested ${input.questionCount} questions, but only ${allQuestions.length} are available in the bank.`
            }
        }

        // 2. Use AI to select the relevant questions
        const { output } = await examBuilderPrompt({
            prompt: input.prompt,
            questionCount: input.questionCount,
            questions: allQuestions.map(q => ({id: q.id, questionText: q.questionText, subject: q.subject})),
        });

        if (!output || !output.selectedQuestionIds || output.selectedQuestionIds.length !== input.questionCount) {
            throw new Error(`AI failed to select the required number of questions. Please try a different prompt.`);
        }
        
        // 3. Save the new exam to the 'exams' collection in Firestore
        const examRef = adminDb.collection('exams').doc();
        await examRef.set({
            title: input.title,
            description: input.description,
            duration: input.duration,
            questionIds: output.selectedQuestionIds,
            questionCount: input.questionCount,
            createdAt: new Date().toISOString(),
        });
        
        return {
            success: true,
            message: `Exam "${input.title}" has been created successfully with ${output.selectedQuestionIds.length} questions.`,
            examId: examRef.id,
        };

    } catch (error: any) {
        console.error("Error creating exam:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred while creating the exam.",
        };
    }
  }
);
