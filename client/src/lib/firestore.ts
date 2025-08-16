import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp,
  WriteBatch,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Type definitions
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  roles: string[];
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath?: string;
  duration?: number;
  category: 'practice' | 'reference';
  uploadedBy: string;
  uploadedAt: Timestamp;
  isPublic: boolean;
  tags: string[];
}

export interface Feedback {
  id: string;
  videoId: string;
  evaluatorId: string;
  learnerId: string;
  overallScore: number;
  technicalScore: number;
  speedScore: number;
  precisionScore: number;
  comments: string;
  voiceTranscript?: string;
  createdAt: Timestamp;
  status: 'pending' | 'completed';
}

export interface Progress {
  id: string;
  userId: string;
  videoId: string;
  watchTime: number;
  totalDuration: number;
  completed: boolean;
  lastWatched: Timestamp;
}

// Security helper - ensures user is authenticated
const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// User operations
export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    requireAuth();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const user = requireAuth();
    if (user.uid !== userId) {
      throw new Error('Unauthorized: Can only update your own profile');
    }
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { ...data, lastLogin: serverTimestamp() });
  },

  async getAllUsers(): Promise<UserProfile[]> {
    requireAuth();
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  }
};

// Video operations
export const videoService = {
  async getVideos(category?: 'practice' | 'reference'): Promise<Video[]> {
    requireAuth();
    let q = query(
      collection(db, 'videos'), 
      where('isPublic', '==', true),
      orderBy('uploadedAt', 'desc')
    );
    
    if (category) {
      q = query(
        collection(db, 'videos'),
        where('isPublic', '==', true),
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
  },

  async getVideo(videoId: string): Promise<Video | null> {
    requireAuth();
    const docRef = doc(db, 'videos', videoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Video : null;
  },

  async uploadVideo(videoData: Omit<Video, 'id' | 'uploadedAt'>): Promise<string> {
    const user = requireAuth();
    const docRef = doc(collection(db, 'videos'));
    const video: Video = {
      ...videoData,
      id: docRef.id,
      uploadedBy: user.uid,
      uploadedAt: serverTimestamp() as Timestamp
    };
    await setDoc(docRef, video);
    return docRef.id;
  },

  async deleteVideo(videoId: string): Promise<void> {
    const user = requireAuth();
    const video = await this.getVideo(videoId);
    if (!video || video.uploadedBy !== user.uid) {
      throw new Error('Unauthorized: Can only delete your own videos');
    }
    await deleteDoc(doc(db, 'videos', videoId));
  }
};

// Feedback operations
export const feedbackService = {
  async getFeedback(videoId?: string, evaluatorId?: string): Promise<Feedback[]> {
    const user = requireAuth();
    let q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    
    if (videoId && evaluatorId) {
      q = query(
        collection(db, 'feedback'),
        where('videoId', '==', videoId),
        where('evaluatorId', '==', evaluatorId),
        orderBy('createdAt', 'desc')
      );
    } else if (videoId) {
      q = query(
        collection(db, 'feedback'),
        where('videoId', '==', videoId),
        orderBy('createdAt', 'desc')
      );
    } else if (evaluatorId) {
      q = query(
        collection(db, 'feedback'),
        where('evaluatorId', '==', evaluatorId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const allFeedback = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
    
    // Filter to only return feedback the user has access to
    return allFeedback.filter(feedback => 
      feedback.evaluatorId === user.uid || 
      feedback.learnerId === user.uid
    );
  },

  async submitFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<string> {
    const user = requireAuth();
    if (feedbackData.evaluatorId !== user.uid) {
      throw new Error('Unauthorized: Can only submit feedback as yourself');
    }
    
    const docRef = doc(collection(db, 'feedback'));
    const feedback: Feedback = {
      ...feedbackData,
      id: docRef.id,
      createdAt: serverTimestamp() as Timestamp
    };
    await setDoc(docRef, feedback);
    return docRef.id;
  },

  async updateFeedback(feedbackId: string, data: Partial<Feedback>): Promise<void> {
    const user = requireAuth();
    const feedback = await this.getFeedback();
    const targetFeedback = feedback.find(f => f.id === feedbackId);
    
    if (!targetFeedback || targetFeedback.evaluatorId !== user.uid) {
      throw new Error('Unauthorized: Can only update your own feedback');
    }
    
    const docRef = doc(db, 'feedback', feedbackId);
    await updateDoc(docRef, data);
  }
};

// Progress operations
export const progressService = {
  async getProgress(userId?: string): Promise<Progress[]> {
    const user = requireAuth();
    const targetUserId = userId || user.uid;
    
    // Users can only see their own progress unless they're admin/researcher
    if (targetUserId !== user.uid) {
      const userProfile = await userService.getProfile(user.uid);
      if (!userProfile?.roles.includes('admin') && !userProfile?.roles.includes('researcher')) {
        throw new Error('Unauthorized: Can only view your own progress');
      }
    }
    
    const q = query(
      collection(db, 'progress'),
      where('userId', '==', targetUserId),
      orderBy('lastWatched', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Progress));
  },

  async updateProgress(progressData: Omit<Progress, 'id' | 'lastWatched'>): Promise<void> {
    const user = requireAuth();
    if (progressData.userId !== user.uid) {
      throw new Error('Unauthorized: Can only update your own progress');
    }
    
    const docRef = doc(db, 'progress', `${progressData.userId}_${progressData.videoId}`);
    const progress: Progress = {
      ...progressData,
      id: docRef.id,
      lastWatched: serverTimestamp() as Timestamp
    };
    await setDoc(docRef, progress);
  }
};

// Analytics operations (restricted to researchers and admins)
export const analyticsService = {
  async getAnalytics(): Promise<any> {
    const user = requireAuth();
    const userProfile = await userService.getProfile(user.uid);
    
    if (!userProfile?.roles.includes('admin') && !userProfile?.roles.includes('researcher')) {
      throw new Error('Unauthorized: Analytics access restricted to researchers and admins');
    }
    
    // Batch operations for analytics
    const batch = writeBatch(db);
    
    const [users, videos, feedback, progress] = await Promise.all([
      userService.getAllUsers(),
      videoService.getVideos(),
      feedbackService.getFeedback(),
      progressService.getProgress()
    ]);
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => {
        const lastLogin = u.lastLogin as Timestamp;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastLogin && lastLogin.toDate() > dayAgo;
      }).length,
      totalVideos: videos.length,
      totalFeedback: feedback.length,
      averageScore: feedback.reduce((sum, f) => sum + f.overallScore, 0) / feedback.length || 0,
      completionRate: progress.filter(p => p.completed).length / progress.length || 0
    };
  }
};