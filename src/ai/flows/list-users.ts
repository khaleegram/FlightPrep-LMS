
'use server';

/**
 * @fileOverview A secure flow to list all users.
 *
 * - listUsers - Fetches all users from Firebase Authentication.
 * - ListUsersOutput - The return type for the listUsers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserRecord } from 'firebase-admin/auth';
import { adminAuth } from '@/lib/firebase-admin';

const UserSchema = z.object({
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
    // Checking for isStudent, or defaulting to Student if no admin claim
    if (user.customClaims?.isStudent || !user.customClaims?.isAdmin) {
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
  },
  async () => {
    try {
        const userRecords = await adminAuth.listUsers(100); // Get up to 100 users
        const users = userRecords.users.map(user => ({
            name: user.displayName || 'Unnamed User',
            email: user.email || 'no-email@example.com',
            role: determineRole(user),
            avatar: getInitials(user.displayName),
        }));
        return users;
    } catch (error) {
        console.error('Error listing users:', error);
        // In case of error, return an empty array or handle it as needed
        return [];
    }
  }
);
