import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Check if Firebase is configured
const isFirebaseConfigured = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_APP_ID;

let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Connect to Firestore emulator in development (only if needed)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Emulator is already connected or not available
      console.log('Firestore emulator connection skipped');
    }
  }
} else {
  console.log('Firebase not configured - running in demo mode');
}

export { auth, db };



// Google Auth Provider (only if Firebase is configured)
export const googleProvider = isFirebaseConfigured ? (() => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
})() : null;

// Auth functions
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase authentication is not configured. Please set up Firebase credentials or use demo mode.');
  }
  
  try {
    console.log('Attempting Google sign-in...');
    return await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Check if the error is due to domain configuration
    if ((error as any).code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Firebase authentication. Please configure this domain in your Firebase console under Authentication > Settings > Authorized domains.');
    } else if ((error as any).code === 'auth/popup-blocked') {
      throw new Error('Popup blocked. Please allow popups for this site and try again.');
    } else {
      throw new Error(`Authentication failed: ${(error as any).message || 'Unknown error'}`);
    }
  }
};

export const signOut = () => {
  if (!auth) return Promise.resolve();
  return firebaseSignOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // For demo mode, immediately call callback with null user
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

export default app;