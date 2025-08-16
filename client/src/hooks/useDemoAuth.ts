import { useState, useEffect } from 'react';

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

export function useDemoAuth() {
  const [user, setUser] = useState<null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Always run in demo mode with no authentication
    setIsLoading(false);
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
  };
}