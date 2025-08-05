
'use server';

/**
 * @fileOverview A utility flow to delete all users except for a specified one.
 * 
 * - deleteAllUsers - A function that handles the deletion process.
 * - DeleteAllUsersInput - The input type for the function.
 * - DeleteAllUsersOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const DeleteAllUsersInputSchema = z.object({
  emailToKeep: z.string().email().describe("The email address of the admin user to keep."),
});

const DeleteAllUsersOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deletedCount: z.number(),
});

export async function deleteAllUsers(input: z.infer<typeof DeleteAllUsersInputSchema>) {
  return deleteAllUsersFlow(input);
}

const deleteAllUsersFlow = ai.defineFlow(
  {
    name: 'deleteAllUsersFlow',
    inputSchema: DeleteAllUsersInputSchema,
    outputSchema: DeleteAllUsersOutputSchema,
    auth: {
      policy: async (auth, input) => {
        if (!auth || !auth.custom?.isAdmin) {
          throw new Error("You must be an admin to perform this action.");
        }
      },
    },
  },
  async (input) => {
    try {
      const listUsersResult = await adminAuth.listUsers(1000);
      const uidsToDelete: string[] = [];
      let deletedCount = 0;

      listUsersResult.users.forEach(userRecord => {
        if (userRecord.email !== input.emailToKeep) {
          uidsToDelete.push(userRecord.uid);
        }
      });

      if (uidsToDelete.length > 0) {
        const deleteResult = await adminAuth.deleteUsers(uidsToDelete);
        deletedCount = deleteResult.successCount;
        
        // Also delete from Firestore
        const batch = adminDb.batch();
        uidsToDelete.forEach(uid => {
          const userDocRef = adminDb.collection('users').doc(uid);
          batch.delete(userDocRef);
        });
        await batch.commit();
      }

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} users.`,
        deletedCount,
      };
    } catch (error: any) {
      console.error("Error deleting users:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred.",
        deletedCount: 0,
      };
    }
  }
);
