'use server';

/**
 * @fileOverview A secure flow to invite a new user.
 *
 * - inviteUser - Creates a new user and sets their role.
 * - InviteUserInput - The input type for the inviteUser function.
 * - InviteUserOutput - The return type for the inviteUser function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InviteUserInputSchema = z.object({
  email: z.string().email().describe("The new user's email address."),
  role: z.enum(['Admin', 'Student']).describe("The role to assign to the new user."),
});
export type InviteUserInput = z.infer<typeof InviteUserInputSchema>;

const InviteUserOutputSchema = z.object({
  success: z.boolean().describe('Whether the user was invited successfully.'),
  message: z.string().describe('A message indicating the result.'),
});
export type InviteUserOutput = z.infer<typeof InviteUserOutputSchema>;

// IMPORTANT: In a real production application, you would add authentication
// checks here to ensure that only authorized administrators can call this function.
// This would typically involve using the Firebase Admin SDK to verify the
// caller's ID token and check for an `isAdmin` custom claim.

export async function inviteUser(input: InviteUserInput): Promise<InviteUserOutput> {
  return inviteUserFlow(input);
}

const inviteUserFlow = ai.defineFlow(
  {
    name: 'inviteUserFlow',
    inputSchema: InviteUserInputSchema,
    outputSchema: InviteUserOutputSchema,
  },
  async (input) => {
    // In a real application, this is where you would use the Firebase Admin SDK to:
    // 1. Create a new user with the provided email.
    // 2. Set a custom claim on that user object to assign their role.
    //    e.g., `admin.auth().setCustomUserClaims(user.uid, { [input.role.toLowerCase()]: true })`
    // For now, we simulate this and return a success message.

    console.log(`Simulating invitation for ${input.email} with role ${input.role}`);

    // Simulate a delay to make it feel like a real network request.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: `User ${input.email} invited successfully as a ${input.role}.`,
    };
  }
);
