
import admin from 'firebase-admin';

// This logic prevents re-initializing the app on every hot-reload in development
// and resolves the EventEmitter memory leak warning.
if (!admin.apps.length) {
    // When running on Google Cloud (like App Hosting or Cloud Run),
    // the SDK automatically detects the project's service account credentials.
    // For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable to point to your service account key file.
    try {
        admin.initializeApp();
    } catch (error: any) {
        console.error('Firebase admin initialization error:', error);
        throw new Error(
            'Firebase admin initialization failed. ' +
            'If running locally, ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly. ' +
            'On App Hosting, this should be configured automatically.'
        );
    }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
