
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
import { adminAuth } from '@/lib/firebase-admin';

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
    try {
      // 1. Create a new user with the provided email.
      // A temporary password is required, but the user will likely reset it
      // or sign in with a provider. You could also implement a passwordless email link.
      const userRecord = await adminAuth.createUser({
        email: input.email,
        password: `temp-password-${Date.now()}`, // A random temporary password
        emailVerified: false, // User will need to verify their email
        disabled: false,
      });

      // 2. Set a custom claim on that user object to assign their role.
      const claims: Record<string, boolean> = {};
      if (input.role === 'Admin') {
        claims.isAdmin = true;
      } else {
        claims.isStudent = true;
      }
      
      await adminAuth.setCustomUserClaims(userRecord.uid, claims);

      // In a real app, you would also trigger an email to be sent to the user.
      // This can be done via another service or a Firebase Extension.
      console.log(`User ${input.email} created with UID ${userRecord.uid} and role ${input.role}`);

      return {
        success: true,
        message: `User ${input.email} invited successfully as a ${input.role}.`,
      };
    } catch (error: any) {
        console.error("Error inviting user:", error);

        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-exists') {
            errorMessage = "This email address is already in use by another account.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            message: errorMessage,
        };
    }
  }
);
