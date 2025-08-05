
'use server';

/**
 * @fileOverview Allows administrators to create new exams by manually selecting questions from the existing bank.
 * 
 * - createExam - A function that handles creating a new exam.
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
  questionIds: z.array(z.string()).min(1, 'At least one question must be selected.').describe('An array of question IDs to include in the exam.'),
});

const CreateExamOutputSchema = z.object({
  success: z.boolean().describe('Whether the exam was created successfully.'),
  message: z.string().describe('A message indicating the result.'),
  examId: z.string().optional().describe('The ID of the newly created exam.'),
});

export async function createExam(input: z.infer<typeof CreateExamInputSchema>) {
  return createExamFlow(input);
}

const createExamFlow = ai.defineFlow(
  {
    name: 'createExamFlow',
    inputSchema: CreateExamInputSchema,
    outputSchema: CreateExamOutputSchema,
  },
  async (input) => {
    try {
        const examRef = adminDb.collection('exams').doc();
        await examRef.set({
            title: input.title,
            description: input.description,
            duration: input.duration,
            questionIds: input.questionIds,
            questionCount: input.questionIds.length,
            createdAt: new Date().toISOString(),
        });
        
        return {
            success: true,
            message: `Exam "${input.title}" has been created successfully with ${input.questionIds.length} questions.`,
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
