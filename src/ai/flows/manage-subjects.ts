
'use server';

/**
 * @fileOverview A set of flows for managing subjects and departments.
 *
 * - addSubject: Creates a new subject linked to a department.
 * - listSubjects: Retrieves all subjects, optionally filtered by department.
 * - addDepartment: Creates a new department.
 * - listDepartments: Retrieves all departments.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/firebase-admin';
import type admin from 'firebase-admin';

// Add Subject Flow
const AddSubjectInputSchema = z.object({
  name: z.string().min(3, 'Subject name must be at least 3 characters long.'),
  department: z.string({ required_error: 'Department is required.' }),
});

const AddSubjectOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  subjectId: z.string().optional(),
});

export async function addSubject(input: z.infer<typeof AddSubjectInputSchema>) {
  return addSubjectFlow(input);
}

const addSubjectFlow = ai.defineFlow(
  {
    name: 'addSubjectFlow',
    inputSchema: AddSubjectInputSchema,
    outputSchema: AddSubjectOutputSchema,
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
        message: `Subject "${input.name}" has been added to the ${input.department} department.`,
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

const SubjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    department: z.string(),
});

const ListSubjectsOutputSchema = z.array(SubjectSchema);

export async function listSubjects(input?: z.infer<typeof ListSubjectsInputSchema>) {
  return listSubjectsFlow(input || {});
}

const listSubjectsFlow = ai.defineFlow(
  {
    name: 'listSubjectsFlow',
    inputSchema: ListSubjectsInputSchema,
    outputSchema: ListSubjectsOutputSchema,
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


// Add Department Flow
const AddDepartmentInputSchema = z.object({
  name: z.string().min(3, 'Department name must be at least 3 characters long.'),
});

const AddDepartmentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  departmentId: z.string().optional(),
});

export async function addDepartment(input: z.infer<typeof AddDepartmentInputSchema>) {
  return addDepartmentFlow(input);
}

const addDepartmentFlow = ai.defineFlow(
  {
    name: 'addDepartmentFlow',
    inputSchema: AddDepartmentInputSchema,
    outputSchema: AddDepartmentOutputSchema,
  },
  async (input) => {
    try {
      const deptRef = adminDb.collection('departments').doc();
      await deptRef.set({
        name: input.name,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Department "${input.name}" has been created.`,
        departmentId: deptRef.id,
      };
    } catch (error: any) {
      console.error('Error adding department:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while adding the department.',
      };
    }
  }
);


// List Departments Flow
const DepartmentSchema = z.object({
    id: z.string(),
    name: z.string(),
});

const ListDepartmentsOutputSchema = z.array(DepartmentSchema);

export async function listDepartments(): Promise<z.infer<typeof ListDepartmentsOutputSchema>> {
  return listDepartmentsFlow();
}

const listDepartmentsFlow = ai.defineFlow(
  {
    name: 'listDepartmentsFlow',
    inputSchema: z.void(),
    outputSchema: ListDepartmentsOutputSchema,
  },
  async () => {
    try {
      const snapshot = await adminDb.collection('departments').orderBy('name').get();
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
    } catch (error) {
      console.error('Error listing departments:', error);
      return [];
    }
  }
);

