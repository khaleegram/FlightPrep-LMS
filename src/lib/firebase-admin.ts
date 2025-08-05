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
                'Ensure your service account credentials are set correctly for the environment.'
            );
        }
        throw error;
    }
}

const adminAuth = admin.auth();

export { adminAuth };
