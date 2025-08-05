
import admin from 'firebase-admin';

// This logic prevents re-initializing the app on every hot-reload in development
// and resolves the EventEmitter memory leak warning.
if (!admin.apps.length) {
    // Check if the essential environment variables are present.
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        // In a deployed environment (like Vercel or Firebase Hosting), the SDK
        // might auto-initialize. We log a warning but don't throw an error.
        if (process.env.VERCEL || process.env.FIREBASE_CONFIG) {
             console.warn(
                'Firebase Admin SDK environment variables are not set. ' +
                'Attempting to rely on default application credentials.'
             );
             admin.initializeApp();
        } else {
            // In a local environment, these variables are required.
            throw new Error(
                'Firebase Admin SDK environment variables are not set. ' +
                'Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are defined in your .env file.'
            );
        }
    } else {
        // If variables are present, use them for explicit initialization. This is the most reliable method.
        const serviceAccount = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // The private key must be formatted correctly.
            // Replace literal \\n with actual newlines \n.
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        };

        try {
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
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
