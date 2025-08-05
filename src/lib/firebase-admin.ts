import admin from 'firebase-admin';

// When running on Google Cloud (like App Hosting or Cloud Run),
// the SDK automatically detects the project's service account credentials.
// We only need to initialize it once.
if (!admin.apps.length) {
    try {
        admin.initializeApp();
    } catch (error: any) {
        // This might happen if the environment variables are not set correctly locally.
        console.error('Firebase admin initialization error:', error);
        // Throw a more helpful error for local development.
        if (error.code === 'app/invalid-credential') {
            throw new Error(
                'Firebase admin initialization failed. ' +
                'Ensure FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set correctly in your .env file for local development.'
            );
        }
        throw error;
    }
}

const adminAuth = admin.auth();

export { adminAuth };
