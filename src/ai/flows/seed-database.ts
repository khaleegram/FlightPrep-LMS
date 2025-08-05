
'use server';
/**
 * @fileOverview A flow to seed the Firestore database with a single admin user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const SeedInputSchema = z.object({
  adminEmail: z.string().email().describe("The email address for the initial admin user."),
});

const SeedOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export async function seedDatabase(input: z.infer<typeof SeedInputSchema>): Promise<z.infer<typeof SeedOutputSchema>> {
  return seedDatabaseFlow(input);
}

const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    inputSchema: SeedInputSchema,
    outputSchema: SeedOutputSchema,
  },
  async ({ adminEmail }) => {
    try {
      console.log(`Attempting to create admin user: ${adminEmail}`);
      
      // 1. Create User in Firebase Auth
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(adminEmail);
        console.log(`User ${adminEmail} already exists. Updating claims.`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`Creating new user for ${adminEmail}.`);
          userRecord = await adminAuth.createUser({
            email: adminEmail,
            password: `password-${Date.now()}`, // Set a secure, temporary password
            displayName: 'Admin User',
            emailVerified: true,
          });
        } else {
          // Re-throw other auth errors
          throw error;
        }
      }

      // 2. Set Custom Claims for Admin Role
      await adminAuth.setCustomUserClaims(userRecord.uid, { isAdmin: true });
      console.log(`Admin claims set for ${adminEmail}.`);
      
      // 3. Create User Document in Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
        displayName: userRecord.displayName || 'Admin User',
        email: userRecord.email,
        role: 'Admin',
        createdAt: new Date().toISOString(),
        leaderboardScore: 0,
      }, { merge: true });
      console.log(`Firestore document created/updated for ${adminEmail}.`);

      return {
        success: true,
        message: `Admin user ${adminEmail} created or updated successfully.`,
      };

    } catch (error: any) {
      console.error('Error seeding database:', error);
      // Return the specific error message to the frontend
      return {
        success: false,
        message: error.message || 'An unknown error occurred during seeding.',
      };
    }
  }
);
