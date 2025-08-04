// src/ai/flows/customize-ai-tutor.ts
'use server';

/**
 * @fileOverview Allows administrators to customize the AI tutor's prompts and knowledge base.
 *
 * - customizeAITutor - A function that handles the customization of the AI tutor.
 * - CustomizeAITutorInput - The input type for the customizeAITutor function.
 * - CustomizeAITutorOutput - The return type for the customizeAITutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeAITutorInputSchema = z.object({
  department: z.enum(['Flying School', 'Aircraft Maintenance Engineering', 'Air Traffic Control', 'Cabin Crew', 'Prospective Students']).describe('The department to customize the AI tutor for.'),
  customPrompt: z.string().describe('The custom prompt to use for the AI tutor.'),
  knowledgeBaseUpdate: z.string().describe('Updates to the AI tutor knowledge base.'),
});
export type CustomizeAITutorInput = z.infer<typeof CustomizeAITutorInputSchema>;

const CustomizeAITutorOutputSchema = z.object({
  success: z.boolean().describe('Whether the customization was successful.'),
  message: z.string().describe('A message indicating the result of the customization.'),
});
export type CustomizeAITutorOutput = z.infer<typeof CustomizeAITutorOutputSchema>;

export async function customizeAITutor(input: CustomizeAITutorInput): Promise<CustomizeAITutorOutput> {
  return customizeAITutorFlow(input);
}

const customizeAITutorPrompt = ai.definePrompt({
  name: 'customizeAITutorPrompt',
  input: {schema: CustomizeAITutorInputSchema},
  output: {schema: CustomizeAITutorOutputSchema},
  prompt: `You are an AI assistant that helps customize AI tutors for different departments in an aviation college.

  The admin wants to customize the AI tutor for the following department: {{{department}}}.
  They want to use the following custom prompt: {{{customPrompt}}}.
  They also want to update the knowledge base with the following information: {{{knowledgeBaseUpdate}}}.

  Confirm that customization was successful and return a success boolean with a message.`,
});

const customizeAITutorFlow = ai.defineFlow(
  {
    name: 'customizeAITutorFlow',
    inputSchema: CustomizeAITutorInputSchema,
    outputSchema: CustomizeAITutorOutputSchema,
  },
  async input => {
    const {output} = await customizeAITutorPrompt(input);
    return output!;
  }
);
