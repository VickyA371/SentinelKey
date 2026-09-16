import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase web configuration.
 *
 * 🔑 Replace these placeholder values with your actual Firebase project config
 * from: Firebase Console → Project Settings → Your apps → Web app
 */
const firebaseConfig = {
  apiKey: "AIzaSyACqRfh5LeAzHVjWRRyNUAcLlrAdq3uPKQ",
  authDomain: "sentinel-key.firebaseapp.com",
  projectId: "sentinel-key",
  storageBucket: "sentinel-key.firebasestorage.app",
  messagingSenderId: "783216267852",
  appId: "1:783216267852:web:7ab00d1cacad3893fa1ae9",
  measurementId: "G-SB6DEQS00W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
