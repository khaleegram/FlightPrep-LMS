'use server';

/**
 * @fileOverview A secure flow to list all users.
 *
 * - listUsers - Fetches all users from Firebase Authentication.
 * - ListUsersOutput - The return type for the listUsers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  email: z.string().email().describe("The user's email address."),
  role: z.enum(['Admin', 'Student']).describe("The user's role."),
  avatar: z.string().describe('Two-letter initials for the avatar fallback.'),
});

const ListUsersOutputSchema = z.array(UserSchema);
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;

// IMPORTANT: In a real production application, you would add authentication
// checks here to ensure that only authorized administrators can call this function.
// This would typically involve using the Firebase Admin SDK to verify the
// caller's ID token and check for an `isAdmin` custom claim.

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
    // In a real application, this is where you would use the Firebase Admin SDK
    // to programmatically list all users.
    // e.g., `admin.auth().listUsers()`
    // For now, we will return mock data to simulate the backend call.

    console.log('Listing users (simulated)...');

    return [
      { name: "Liam Johnson", email: "liam@example.com", role: "Student", avatar: "LJ" },
      { name: "Olivia Smith", email: "olivia@example.com", role: "Student", avatar: "OS" },
      { name: "Noah Williams", email: "noah@example.com", role: "Student", avatar: "NW" },
      { name: "Emma Brown", email: "emma@example.com", role: "Admin", avatar: "EB" },
      { name: "James Jones", email: "james@example.com", role: "Student", avatar: "JJ" },
    ];
  }
);
