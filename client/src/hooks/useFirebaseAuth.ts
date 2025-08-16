import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, onAuthStateChange } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  roles: string[];
  createdAt: any;
  lastLogin: any;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Get or create user profile in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let profile: UserProfile;
        
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
          // Update last login
          await setDoc(userDocRef, {
            ...profile,
            lastLogin: serverTimestamp()
          }, { merge: true });
        } else {
          // Create new user profile
          const names = firebaseUser.displayName?.split(' ') || ['', ''];
          profile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            profileImageUrl: firebaseUser.photoURL || undefined,
            roles: ['learner'], // Default role
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          };
          
          await setDoc(userDocRef, profile);
        }
        
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated
  };
}