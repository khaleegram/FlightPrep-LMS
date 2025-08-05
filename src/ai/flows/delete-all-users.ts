
'use server';

/**
 * @fileOverview A utility flow to delete all users except for a specified one, and a flow to delete a single user.
 * 
 * - deleteAllUsers - A function that handles the deletion of all users except one.
 * - deleteUser - A function that deletes a single user by UID.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Delete All Users Flow
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


// Delete Single User Flow
const DeleteUserInputSchema = z.object({
    uid: z.string().describe("The UID of the user to delete."),
});

const DeleteUserOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export async function deleteUser(input: z.infer<typeof DeleteUserInputSchema>) {
    return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
    {
        name: 'deleteUserFlow',
        inputSchema: DeleteUserInputSchema,
        outputSchema: DeleteUserOutputSchema,
    },
    async ({ uid }) => {
        try {
            // Delete from Firebase Authentication
            await adminAuth.deleteUser(uid);

            // Delete from Firestore
            const userDocRef = adminDb.collection('users').doc(uid);
            await userDocRef.delete();

            return {
                success: true,
                message: "User has been deleted successfully.",
            };
        } catch (error: any) {
            console.error(`Error deleting user ${uid}:`, error);
            return {
                success: false,
                message: error.message || "An unexpected error occurred while deleting the user.",
            };
        }
    }
);
