
'use server';

/**
 * @fileOverview A set of flows for managing subjects within departments.
 *
 * - addSubject: Creates a new subject linked to a department.
 * - listSubjects: Retrieves all subjects, optionally filtered by department.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/firebase-admin';
import type admin from 'firebase-admin';

// Common auth policy for all subject management flows
const isAdminPolicy = {
    policy: async (auth: any, input: any) => {
      if (!auth) {
        throw new Error("Authentication required.");
      }
      if (!auth.custom?.isAdmin) {
        throw new Error("You must be an admin to perform this action.");
      }
    },
};

// Add Subject Flow
const AddSubjectInputSchema = z.object({
  name: z.string().min(3, 'Subject name must be at least 3 characters long.'),
  department: z.string({ required_error: 'Department is required.' }),
});
type AddSubjectInput = z.infer<typeof AddSubjectInputSchema>;

const AddSubjectOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  subjectId: z.string().optional(),
});
type AddSubjectOutput = z.infer<typeof AddSubjectOutputSchema>;

export async function addSubject(input: AddSubjectInput): Promise<AddSubjectOutput> {
  return addSubjectFlow(input);
}

const addSubjectFlow = ai.defineFlow(
  {
    name: 'addSubjectFlow',
    inputSchema: AddSubjectInputSchema,
    outputSchema: AddSubjectOutputSchema,
    auth: isAdminPolicy,
  },
  async (input) => {
    try {
      const subjectRef = adminDb.collection('subjects').doc();
      await subjectRef.set({
        ...input,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Subject "${input.name}" has been added to the ${department} department.`,
        subjectId: subjectRef.id,
      };
    } catch (error: any) {
      console.error('Error adding subject:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while adding the subject.',
      };
    }
  }
);

// List Subjects Flow
const ListSubjectsInputSchema = z.object({
    department: z.string().optional(),
});
type ListSubjectsInput = z.infer<typeof ListSubjectsInputSchema>;


const SubjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    department: z.string(),
});
type Subject = z.infer<typeof SubjectSchema>;

const ListSubjectsOutputSchema = z.array(SubjectSchema);
type ListSubjectsOutput = z.infer<typeof ListSubjectsOutputSchema>;


export async function listSubjects(input?: ListSubjectsInput): Promise<ListSubjectsOutput> {
  return listSubjectsFlow(input || {});
}

const listSubjectsFlow = ai.defineFlow(
  {
    name: 'listSubjectsFlow',
    inputSchema: ListSubjectsInputSchema,
    outputSchema: ListSubjectsOutputSchema,
    auth: isAdminPolicy,
  },
  async (input) => {
    try {
      let query: admin.firestore.Query = adminDb.collection('subjects');
      
      if (input.department) {
        query = query.where('department', '==', input.department);
      }
      
      const snapshot = await query.orderBy('name').get();
      
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        department: doc.data().department,
      }));
    } catch (error) {
      console.error('Error listing subjects:', error);
      return [];
    }
  }
);
