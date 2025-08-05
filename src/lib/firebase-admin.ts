
import admin from 'firebase-admin';

// This logic prevents re-initializing the app on every hot-reload in development
// and resolves the EventEmitter memory leak warning.
if (!admin.apps.length) {
    // Ensure all required environment variables are present
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error(
            'Firebase Admin SDK environment variables are not set. ' +
            'Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are defined in your .env file.'
        );
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly.
        // Replace \\n with \n to ensure newlines are handled properly.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    try {
        // Initialize the app with explicit service account credentials
        // This is the most robust method for both local dev and deployed environments
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase admin initialization error:', error.message);
        throw new Error(
            'Firebase admin initialization failed. ' +
            'Please check the format of your service account credentials in the .env file. ' +
            `Original error: ${error.message}`
        );
    }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
