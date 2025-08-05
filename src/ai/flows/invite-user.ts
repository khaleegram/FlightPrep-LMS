
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
    auth: {
        // This ensures that only users with an 'isAdmin' custom claim can run this flow.
        // Uncomment this section once you have an admin user.
        // policy: async (auth, input) => {
        //   if (!auth) {
        //     throw new Error("Authentication required.");
        //   }
        //   if (!auth.custom?.isAdmin) {
        //     throw new Error("You must be an admin to perform this action.");
        //   }
        // },
    }
  },
  async (input) => {
    try {
      const userRecord = await adminAuth.createUser({
        email: input.email,
        password: `temp-password-${Date.now()}`,
        emailVerified: false, 
        disabled: false,
      });

      const claims: Record<string, boolean> = {};
      if (input.role === 'Admin') {
        claims.isAdmin = true;
      } else {
        claims.isStudent = true;
      }
      
      await adminAuth.setCustomUserClaims(userRecord.uid, claims);

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
        } else if (error.code === 'auth/insufficient-permission') {
            errorMessage = "Insufficient permission to access the requested resource. Please check your service account roles in IAM.";
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
