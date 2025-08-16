import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// Initialize Firebase (using environment variables)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'));
    }
  },
});

export async function registerRoutes(expressApp: Express): Promise<Server> {
  // Simple auth middleware for development
  const isAuthenticated = (req: any, res: any, next: any) => {
    req.user = { uid: 'dev-user-123' };
    next();
  };

  // Auth routes
  expressApp.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json({
      id: 'dev-user-123',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      roles: ['learner', 'evaluator']
    });
  });

  // Video routes
  expressApp.get('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      let videosQuery = collection(db, 'videos');
      
      if (category) {
        videosQuery = query(videosQuery, where('category', '==', category));
      }
      
      const snapshot = await getDocs(videosQuery);
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fallback to mock data if Firebase fails
      const mockVideos = [
        {
          id: '1',
          title: 'Basic Suturing Techniques',
          description: 'Learn fundamental suturing methods',
          filePath: '/uploads/video1.mp4',
          uploaderId: 'dev-user-123',
          category: req.query.category || 'reference',
          suturingType: 'simple_interrupted',
          duration: 300,
          thumbnailPath: '/uploads/thumb1.jpg',
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockVideos);
    }
  });

  // Video upload
  expressApp.post('/api/videos', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }

      const { title, description, category, suturingType } = req.body;
      const userId = req.user.uid;
      
      // Upload to Firebase Storage
      const filename = `videos/${userId}/${Date.now()}-${req.file.originalname}`;
      const storageRef = ref(storage, filename);
      
      const uploadResult = await uploadBytes(storageRef, req.file.buffer);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Save metadata to Firestore
      const videoData = {
        title,
        description: description || '',
        filePath: downloadURL,
        uploaderId: userId,
        category: category || 'practice',
        suturingType: suturingType || '',
        duration: 0, // Will be updated after processing
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'videos'), videoData);
      
      res.json({
        id: docRef.id,
        ...videoData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ message: 'Failed to upload video' });
    }
  });

  // Progress routes
  expressApp.get('/api/progress', isAuthenticated, async (req: any, res) => {
    res.json({
      videosWatched: 15,
      videosUploaded: 3,
      feedbackReceived: 8,
      averageScore: 4.2,
      lastActivityAt: new Date().toISOString()
    });
  });

  // Feedback routes
  expressApp.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { evaluatorId, learnerId } = req.query;
      let feedbackQuery = collection(db, 'feedback');
      
      if (evaluatorId) {
        feedbackQuery = query(feedbackQuery, where('evaluatorId', '==', evaluatorId));
      }
      if (learnerId) {
        feedbackQuery = query(feedbackQuery, where('learnerId', '==', learnerId));
      }
      
      feedbackQuery = query(feedbackQuery, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(feedbackQuery);
      const feedback = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Fallback to mock data
      const mockFeedback = [
        {
          id: '1',
          videoId: '1',
          evaluatorId: 'eval-123',
          learnerId: 'dev-user-123',
          overallScore: 4.5,
          needleControl: 4,
          sutureSpacing: 5,
          knotSecurity: 4,
          overallTechnique: 5,
          textFeedback: 'Excellent technique overall. Focus on needle control consistency.',
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockFeedback);
    }
  });

  // Create feedback
  expressApp.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const feedbackData = {
        ...req.body,
        evaluatorId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
      
      res.json({
        id: docRef.id,
        ...feedbackData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Failed to create feedback' });
    }
  });

  // Pending feedback for evaluators
  expressApp.get('/api/feedback/pending', isAuthenticated, async (req: any, res) => {
    try {
      // Get all practice videos
      const videosQuery = query(
        collection(db, 'videos'),
        where('category', '==', 'practice'),
        orderBy('createdAt', 'desc')
      );
      
      const videosSnapshot = await getDocs(videosQuery);
      const allVideos = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get all feedback to filter out videos that already have feedback
      const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
      const feedbackVideoIds = new Set(
        feedbackSnapshot.docs.map(doc => doc.data().videoId)
      );
      
      // Filter videos without feedback
      const pendingVideos = allVideos.filter(video => 
        !feedbackVideoIds.has(video.id)
      );
      
      res.json(pendingVideos);
    } catch (error) {
      console.error('Error fetching pending videos:', error);
      // Fallback to mock data
      const pendingVideos = [
        {
          id: '3',
          title: 'Student Practice Video 1',
          description: 'Basic interrupted sutures practice',
          uploaderId: 'student-123',
          category: 'practice',
          suturingType: 'simple_interrupted',
          duration: 180,
          createdAt: new Date().toISOString()
        }
      ];
      res.json(pendingVideos);
    }
  });

  // Speech-to-text endpoint using OpenAI Whisper
  expressApp.post('/api/speech-to-text', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      // In production, this would use OpenAI Whisper API
      // For now, return a placeholder
      const mockTranscription = "This is a mock transcription. The evaluator provided detailed feedback about the suturing technique.";
      
      res.json({ transcription: mockTranscription });
    } catch (error) {
      console.error('Error processing speech-to-text:', error);
      res.status(500).json({ message: 'Failed to process audio' });
    }
  });

  // Create HTTP server
  const server = createServer(expressApp);
  return server;
}