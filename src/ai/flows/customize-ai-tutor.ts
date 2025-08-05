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
  customPrompt: z.string().optional().describe('The custom prompt to use for the AI tutor.'),
  knowledgeBaseUpdate: z.string().optional().describe('Updates to the AI tutor knowledge base.'),
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

const customizeAITutorFlow = ai.defineFlow(
  {
    name: 'customizeAITutorFlow',
    inputSchema: CustomizeAITutorInputSchema,
    outputSchema: CustomizeAITutorOutputSchema,
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
    // In a real application, you would save this customization to a database (e.g., Firestore).
    // The key would likely be the department name.
    console.log(`Customizing AI Tutor for ${input.department}`);
    console.log(`Custom Prompt: ${input.customPrompt}`);
    console.log(`Knowledge Base Update: ${input.knowledgeBaseUpdate}`);
    
    // For now, we just simulate success.
    return {
      success: true,
      message: `AI Tutor for ${input.department} has been updated successfully.`,
    };
  }
);
