
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
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const InviteUserInputSchema = z.object({
  email: z.string().email().describe("The new user's email address."),
  role: z.enum(['Admin', 'Student']).describe("The role to assign to the new user."),
  department: z.string().optional().describe("The department to assign to a new student user.")
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
  async (input) => {
    try {
      // Create the user without a password first
      const userRecord = await adminAuth.createUser({
        email: input.email,
        emailVerified: true, 
        disabled: false,
        displayName: input.email.split('@')[0],
      });

      const claims: Record<string, boolean> = {};
      if (input.role === 'Admin') {
        claims.isAdmin = true;
      } else {
        claims.isStudent = true;
      }
      
      await adminAuth.setCustomUserClaims(userRecord.uid, claims);

      const userData: any = {
        displayName: userRecord.displayName,
        email: userRecord.email,
        role: input.role,
        createdAt: new Date().toISOString(),
        leaderboardScore: 0,
      };

      if (input.role === 'Student' && input.department) {
        userData.department = input.department;
      }

      await adminDb.collection('users').doc(userRecord.uid).set(userData);

      // Generate a password reset link for the new user to set their password
      const link = await adminAuth.generatePasswordResetLink(input.email);
      
      // IMPORTANT: In a production app, you would email this link to the user.
      // For this prototype, we will log it to the console for the admin to share.
      console.log(`Password setup link for ${input.email}: ${link}`);

      return {
        success: true,
        message: `User ${input.email} invited as ${input.role}. Password setup link logged to console.`,
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
