
import admin from 'firebase-admin';

if (!admin.apps.length) {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        if (process.env.VERCEL || process.env.FIREBASE_CONFIG) {
            console.warn('Firebase Admin SDK ENV not set. Attempting default credentials.');
            admin.initializeApp();
        } else {
            // This case should not be hit if .env.local is set up correctly
            console.error('Missing Firebase Admin SDK environment variables. Please check your .env.local file.');
        }
    } else {
        const serviceAccount = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace escaped newlines from the .env file with actual newlines
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        };

        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error('Firebase Admin Init Error:', error.message);
            throw new Error('Admin SDK init failed: ' + error.message);
        }
    }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
