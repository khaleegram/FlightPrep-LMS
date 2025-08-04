'use server';

/**
 * @fileOverview An AI agent that evaluates Air Traffic Control phraseology.
 *
 * - evaluateATCPhraseology - A function that handles the phraseology evaluation process.
 * - EvaluateATCPhraseologyInput - The input type for the evaluateATCPhraseology function.
 * - EvaluateATCPhraseologyOutput - The return type for the evaluateATCPhraseology function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateATCPhraseologyInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'An audio recording of the ATC command, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type EvaluateATCPhraseologyInput = z.infer<typeof EvaluateATCPhraseologyInputSchema>;

const EvaluateATCPhraseologyOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio.'),
  evaluation: z.string().describe('The AI evaluation of the ATC phraseology.'),
});
export type EvaluateATCPhraseologyOutput = z.infer<typeof EvaluateATCPhraseologyOutputSchema>;

export async function evaluateATCPhraseology(input: EvaluateATCPhraseologyInput): Promise<EvaluateATCPhraseologyOutput> {
  return evaluateATCPhraseologyFlow(input);
}

const evaluateATCPhraseologyPrompt = ai.definePrompt({
  name: 'evaluateATCPhraseologyPrompt',
  input: {schema: EvaluateATCPhraseologyInputSchema},
  output: {schema: EvaluateATCPhraseologyOutputSchema},
  prompt: `You are an expert Air Traffic Control instructor. You will evaluate the correctness, clarity, and completeness of the ATC phraseology in the provided audio transcription.

Transcription: {{{transcription}}}

Provide detailed feedback on the phraseology used, including any errors or omissions.
`,
});

const evaluateATCPhraseologyFlow = ai.defineFlow(
  {
    name: 'evaluateATCPhraseologyFlow',
    inputSchema: EvaluateATCPhraseologyInputSchema,
    outputSchema: EvaluateATCPhraseologyOutputSchema,
  },
  async input => {
    // TODO: Implement Google Speech-to-Text API call to transcribe the audio
    // For now, let's mock the transcription
    const transcription = "Zaria Tower, 5-November-Bravo-Charlie-Alpha, request taxi instructions.";

    const {output} = await evaluateATCPhraseologyPrompt({
      ...input,
      transcription,
    });
    return output!;
  }
);
