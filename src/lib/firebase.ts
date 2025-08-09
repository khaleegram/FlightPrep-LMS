
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRcJzLuqtW7aT_ddYv43w4mrhw_zstZdw",
  authDomain: "flightprep-lms.firebaseapp.com",
  projectId: "flightprep-lms",
  storageBucket: "flightprep-lms.appspot.com",
  messagingSenderId: "1087145337434",
  appId: "1:1087145337434:web:201f309142b315f2416e63",
  measurementId: "G-NS1CJ8W235"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const appleProvider = new OAuthProvider('apple.com');

export { app, auth, db, googleProvider, appleProvider };
