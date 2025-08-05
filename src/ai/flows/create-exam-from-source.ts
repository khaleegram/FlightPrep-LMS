
'use server';

/**
 * @fileOverview An advanced AI agent for creating exams from various sources.
 * 
 * - createExamFromSource: Handles creating an exam from a text-based source document or a prompt.
 * - CreateExamFromSourceInput: The input schema for the flow.
 * - CreateExamFromSourceOutput: The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';

// Define the schema for a single generated question
const GeneratedQuestionSchema = z.object({
  questionText: z.string().describe('The full text of the question. If the question refers to a diagram, mention it (e.g., "Based on the diagram...").'),
  options: z.array(z.string()).min(4).max(4).describe('An array of exactly 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  department: z.string().describe('The department the question belongs to (e.g., Flying School, Cabin Crew). This must be inferred from the source material.'),
  subject: z.string().describe('The subject or topic the question belongs to (e.g., Air Law, Meteorology). This must be inferred from the source material.'),
});

// Define the schema for the AI's output, which is a list of generated questions
const ExamGenerationSchema = z.object({
    generatedQuestions: z.array(GeneratedQuestionSchema).describe('An array of questions generated from the provided context.')
});

// Define the main input schema for the flow
const CreateExamFromSourceInputSchema = z.object({
  title: z.string().describe('The title of the exam.'),
  description: z.string().describe('A brief description of the exam.'),
  duration: z.number().int().positive().describe('The duration of the exam in minutes.'),
  prompt: z.string().describe('A natural language prompt describing the desired exam content and instructions for the AI.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The desired difficulty level for the questions.'),
  sourceDataUri: z.string().optional().describe("A document (e.g., PDF) encoded as a data URI containing source material for question generation. The AI will not store this document; it will only use it to extract information and create the exam."),
});

// Define the output schema for the flow
const CreateExamFromSourceOutputSchema = z.object({
  success: z.boolean().describe('Whether the exam was created successfully.'),
  message: z.string().describe('A message indicating the result.'),
  examId: z.string().optional().describe('The ID of the newly created exam.'),
  questionsCreated: z.number().optional().describe('The number of new questions added to the bank.'),
});


const examGeneratorPrompt = ai.definePrompt({
    name: 'examGeneratorPrompt',
    input: { schema: CreateExamFromSourceInputSchema },
    output: { schema: ExamGenerationSchema },
    prompt: `You are an AI Exam Creation Agent for an advanced aviation training platform. Your task is to generate a set of high-quality multiple-choice questions based on the provided instructions and source material.

Key Instructions:
1.  **Analyze the Source**: You will be given source material as a data URI. This material can include text, diagrams, charts, and other images. Analyze ALL content to create relevant questions.
2.  **Determine Department & Subject**: Based on the content of the source material, you MUST determine and assign the most appropriate 'department' (e.g., "Flying School", "Aircraft Maintenance Engineering") and 'subject' (e.g., "Aerodynamics", "Air Law") for EACH question.
3.  **Follow the Prompt**: Adhere strictly to the user's prompt regarding the number of questions, topics, and focus.
4.  **Set Difficulty**: Generate questions that match the specified difficulty level: {{{difficulty}}}.
5.  **Format Correctly**: Each question must have exactly four options and one clearly identified correct answer.
6.  **Parse or Generate**:
    - If the source material appears to be a list of existing questions, your primary task is to parse and format them correctly, assigning department and subject.
    - If the source material is a study guide or handout, your task is to generate new, original questions based on ALL the information within that handout, including text and diagrams.
7.  **Return JSON**: Your final output must be a valid JSON object matching the required schema, containing an array of generated questions.

Admin's Prompt: {{{prompt}}}
Difficulty Level: {{{difficulty}}}

Source Material:
{{#if sourceDataUri}}
{{media url=sourceDataUri}}
{{else}}
No source material provided. Generate questions based on general aviation knowledge related to the prompt.
{{/if}}
`,
});

export async function createExamFromSource(input: z.infer<typeof CreateExamFromSourceInputSchema>) {
  return createExamFromSourceFlow(input);
}

const createExamFromSourceFlow = ai.defineFlow(
  {
    name: 'createExamFromSourceFlow',
    inputSchema: CreateExamFromSourceInputSchema,
    outputSchema: CreateExamFromSourceOutputSchema,
  },
  async (input) => {
    try {
        // 1. Use AI to generate/parse questions from the source material
        console.log("Generating questions with AI...");
        const { output } = await examGeneratorPrompt(input);
        
        if (!output || !output.generatedQuestions || output.generatedQuestions.length === 0) {
            throw new Error("The AI agent could not generate any questions from the provided source and prompt. Please try again with a more detailed prompt or a different source file.");
        }
        
        const newQuestions = output.generatedQuestions;
        console.log(`AI generated ${newQuestions.length} questions.`);

        // 2. Save the newly generated questions to the 'questions' collection in Firestore
        const questionBatch = adminDb.batch();
        const questionIds: string[] = [];
        newQuestions.forEach(q => {
            const docRef = adminDb.collection('questions').doc();
            // Use the department and subject generated by the AI
            questionBatch.set(docRef, { ...q, createdAt: new Date().toISOString() });
            questionIds.push(docRef.id);
        });
        await questionBatch.commit();
        console.log(`${questionIds.length} new questions have been saved to the question bank.`);

        // 3. Save the new exam to the 'exams' collection
        const examRef = adminDb.collection('exams').doc();
        await examRef.set({
            title: input.title,
            description: input.description,
            duration: input.duration,
            questionIds: questionIds,
            questionCount: questionIds.length,
            createdAt: new Date().toISOString(),
        });
        console.log(`New exam "${input.title}" created with ID: ${examRef.id}`);

        return {
            success: true,
            message: `Exam "${input.title}" created successfully with ${questionIds.length} new questions.`,
            examId: examRef.id,
            questionsCreated: questionIds.length,
        };

    } catch (error: any) {
        console.error("Error creating exam from source:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred while creating the exam.",
        };
    }
  }
);
