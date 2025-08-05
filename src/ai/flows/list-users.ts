
'use server';

/**
 * @fileOverview A secure flow to list all users from Firebase Auth and Firestore.
 *
 * - listUsers - Fetches all users from Firebase Authentication.
 * - ListUsersOutput - The return type for the listUsers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserRecord, ListUsersResult } from 'firebase-admin/auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const UserSchema = z.object({
  uid: z.string().describe('The unique ID of the user.'),
  name: z.string().describe('The full name of the user.'),
  email: z.string().email().describe("The user's email address."),
  role: z.enum(['Admin', 'Student', 'Unknown']).describe("The user's role."),
  avatar: z.string().describe('Two-letter initials for the avatar fallback.'),
});

const ListUsersOutputSchema = z.array(UserSchema);
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
};

const determineRole = (user: UserRecord): 'Admin' | 'Student' | 'Unknown' => {
    if (user.customClaims?.isAdmin) {
        return 'Admin';
    }
    if (user.customClaims?.isStudent) {
        return 'Student';
    }
    // New users created via the signup form won't have claims initially. Default to Student.
    if (!user.customClaims?.isAdmin && !user.customClaims?.isStudent) {
        return 'Student';
    }
    return 'Unknown';
}


export async function listUsers(): Promise<ListUsersOutput> {
  return listUsersFlow();
}

const listUsersFlow = ai.defineFlow(
  {
    name: 'listUsersFlow',
    inputSchema: z.void(),
    outputSchema: ListUsersOutputSchema,
    auth: {
        policy: async (auth, input) => {
          if (!auth) {
            throw new Error("Authentication required.");
          }
          if (!auth.custom?.isAdmin) {
            throw new Error("You must be an admin to perform this action.");
          }
        },
    }
  },
  async () => {
    try {
        let allUsers: UserRecord[] = [];
        let nextPageToken: string | undefined;

        do {
            const listUsersResult: ListUsersResult = await adminAuth.listUsers(1000, nextPageToken);
            allUsers = allUsers.concat(listUsersResult.users);
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        const users = allUsers.map(user => ({
            uid: user.uid,
            name: user.displayName || 'Unnamed User',
            email: user.email || 'no-email@example.com',
            role: determineRole(user),
            avatar: getInitials(user.displayName),
        }));

        return users;
    } catch (error) {
        console.error('Error listing users:', error);
        return [];
    }
  }
);
