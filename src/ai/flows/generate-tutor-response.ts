'use server';

/**
 * @fileOverview A flow to generate responses from the AI tutor.
 *
 * - generateTutorResponse - A function that handles generating a response from the AI tutor.
 * - GenerateTutorResponseInput - The input type for the generateTutorResponse function.
 * - GenerateTutorResponseOutput - The return type for the generateTutorResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTutorResponseInputSchema = z.object({
  question: z.string().describe('The student\'s question for the AI tutor.'),
  history: z.array(z.object({text: z.string(), role: z.enum(['user', 'model'])})).optional().describe('The history of the conversation.'),
});
export type GenerateTutorResponseInput = z.infer<typeof GenerateTutorResponseInputSchema>;

const GenerateTutorResponseOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s response to the student\'s question.'),
});
export type GenerateTutorResponseOutput = z.infer<typeof GenerateTutorResponseOutputSchema>;

export async function generateTutorResponse(input: GenerateTutorResponseInput): Promise<GenerateTutorResponseOutput> {
  return generateTutorResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTutorResponsePrompt',
  input: {schema: z.any()},
  output: {schema: GenerateTutorResponseOutputSchema},
  prompt: `You are an expert AI tutor for an aviation college named FlightPrep LMS™. Your primary role is to help students understand complex aviation topics in a clear, concise, and encouraging manner.

{{#if history}}
This is the conversation history so far:
{{#each history}}
  {{#if user}}Student: {{user}}{{/if}}
  {{#if model}}AI Tutor: {{model}}{{/if}}
{{/each}}
{{/if}}

A student has asked the following question:
"{{{question}}}"

Please provide a helpful and accurate response based on the question and the conversation history. If the question is outside the scope of aviation, politely decline to answer and steer the conversation back to aviation topics.
`,
});

const generateTutorResponseFlow = ai.defineFlow(
  {
    name: 'generateTutorResponseFlow',
    inputSchema: GenerateTutorResponseInputSchema,
    outputSchema: GenerateTutorResponseOutputSchema,
  },
  async input => {
    const history = input.history?.map(item => {
        if(item.role === 'user') {
            return { user: item.text };
        }
        return { model: item.text };
    });

    const {output} = await prompt({...input, history});
    return output!;
  }
);
