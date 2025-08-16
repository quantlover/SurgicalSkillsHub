import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to Firestore emulator in development (only if needed)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator is already connected or not available
    console.log('Firestore emulator connection skipped');
  }
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in...');
    return await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Check if the error is due to domain configuration
    if ((error as any).code === 'auth/unauthorized-domain') {
      alert('Authentication Error: This domain is not authorized. Please configure this domain in your Firebase console under Authentication > Settings > Authorized domains.');
    } else if ((error as any).code === 'auth/popup-blocked') {
      alert('Popup blocked. Please allow popups for this site and try again.');
    } else {
      alert('Authentication failed. Please check your internet connection and try again.');
    }
    
    throw error;
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;