
'use server';

/**
 * @fileOverview An AI tool to analyze a document and extract key information.
 * 
 * - analyzeDocument - Extracts a title, description, and summary from a document.
 * - AnalyzeDocumentInput - The input schema for the flow.
 * - AnalyzeDocumentOutput - The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentInputSchema = z.object({
  sourceDataUri: z.string().describe("The document (e.g., PDF) encoded as a data URI."),
});

const AnalyzeDocumentOutputSchema = z.object({
  title: z.string().describe('A suitable title for an exam based on the document.'),
  description: z.string().describe('A short, one-sentence description for the exam.'),
  summary: z.string().describe('A brief summary of the document content.'),
});

export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;

const documentAnalyzerPrompt = ai.definePrompt({
    name: 'documentAnalyzerPrompt',
    input: { schema: AnalyzeDocumentInputSchema },
    output: { schema: AnalyzeDocumentOutputSchema },
    prompt: `You are an AI assistant that analyzes educational documents to prepare them for exam creation. Analyze the provided document and return a concise title for a potential exam, a one-sentence description, and a short summary of the content.

Source Material:
{{media url=sourceDataUri}}
`,
});


export async function analyzeDocument(input: z.infer<typeof AnalyzeDocumentInputSchema>): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await documentAnalyzerPrompt(input);
        if (!output) {
            throw new Error('AI failed to analyze the document.');
        }
        return output;
    } catch (error: any) {
         console.error("Error in analyzeDocumentFlow: ", error);
         // Re-throw the error with a more specific message if possible
         throw new Error(`Failed to process document analysis: ${error.message}`);
    }
  }
);
