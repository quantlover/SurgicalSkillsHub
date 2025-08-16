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
    // Always start in demo mode - no Firebase authentication
    console.log('Running in demo mode');
    setIsLoading(false);
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated
  };
}