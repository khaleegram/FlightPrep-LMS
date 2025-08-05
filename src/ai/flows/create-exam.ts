
'use server';

/**
 * @fileOverview Allows administrators to create new exams.
 * 
 * - createExam - A function that handles creating a new exam.
 * - CreateExamInput - The input type for the createExam function.
 * - CreateExamOutput - The return type for the createExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateExamInputSchema = z.object({
  title: z.string().describe('The title of the exam.'),
  description: z.string().describe('A brief description of the exam.'),
  duration: z.number().int().positive().describe('The duration of the exam in minutes.'),
  questionIds: z.array(z.string()).min(1, "At least one question is required.").describe('An array of question IDs to include in the exam.'),
});
export type CreateExamInput = z.infer<typeof CreateExamInputSchema>;

const CreateExamOutputSchema = z.object({
  success: z.boolean().describe('Whether the exam was created successfully.'),
  message: z.string().describe('A message indicating the result.'),
  examId: z.string().optional().describe('The ID of the newly created exam.'),
});
export type CreateExamOutput = z.infer<typeof CreateExamOutputSchema>;

export async function createExam(input: CreateExamInput): Promise<CreateExamOutput> {
  return createExamFlow(input);
}

const createExamFlow = ai.defineFlow(
  {
    name: 'createExamFlow',
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
    // In a real application, you would save this new exam to a database (e.g., Firestore).
    console.log(`Creating new exam: ${input.title}`);
    console.log(`With ${input.questionIds.length} questions.`);
    
    const newExamId = `exam-${Date.now()}`;

    // For now, we just simulate success.
    return {
      success: true,
      message: `Exam "${input.title}" has been created successfully.`,
      examId: newExamId,
    };
  }
);
