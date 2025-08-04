// src/ai/flows/generate-exam-explanation.ts
'use server';

/**
 * @fileOverview A flow to generate AI-powered explanations for exam questions.
 *
 * - generateExamExplanation - A function that handles the generation of explanations for exam questions.
 * - GenerateExamExplanationInput - The input type for the generateExamExplanation function.
 * - GenerateExamExplanationOutput - The return type for the generateExamExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamExplanationInputSchema = z.object({
  question: z.string().describe('The question to explain.'),
  studentAnswer: z.string().describe("The student's answer to the question."),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  topic: z.string().describe('The topic of the question.'),
});
export type GenerateExamExplanationInput = z.infer<typeof GenerateExamExplanationInputSchema>;

const GenerateExamExplanationOutputSchema = z.object({
  explanation: z.string().describe("The AI-powered explanation for the question, comparing the student's answer to the correct answer."),
});
export type GenerateExamExplanationOutput = z.infer<typeof GenerateExamExplanationOutputSchema>;

export async function generateExamExplanation(input: GenerateExamExplanationInput): Promise<GenerateExamExplanationOutput> {
  return generateExamExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamExplanationPrompt',
  input: {schema: GenerateExamExplanationInputSchema},
  output: {schema: GenerateExamExplanationOutputSchema},
  prompt: `You are an expert tutor in aviation. A student has just completed a mock exam and is requesting an explanation for a question they answered. Your task is to provide a clear and concise explanation of the correct answer, comparing it to the student's answer, and explaining why the correct answer is the best choice. Focus on the key concepts and principles involved.

Topic: {{{topic}}}
Question: {{{question}}}
Student's Answer: {{{studentAnswer}}}
Correct Answer: {{{correctAnswer}}}

Provide a helpful explanation that clarifies the concept for the student. If the student's answer was incorrect, explain their mistake. If they didn't answer, just explain the correct answer.
`,
});

const generateExamExplanationFlow = ai.defineFlow(
  {
    name: 'generateExamExplanationFlow',
    inputSchema: GenerateExamExplanationInputSchema,
    outputSchema: GenerateExamExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
