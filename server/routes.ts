import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, insertFeedbackSchema, insertUserRoleSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { speechToText } from "./services/speechToText";
import { processVideo } from "./services/videoProcessor";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const roles = await storage.getUserRoles(userId);
      res.json({ ...user, roles });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User role management
  app.post('/api/users/:userId/roles', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const roleData = insertUserRoleSchema.parse({ userId, ...req.body });
      const role = await storage.assignUserRole(roleData);
      res.json(role);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  app.delete('/api/users/:userId/roles/:role', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, role } = req.params;
      await storage.removeUserRole(userId, role);
      res.json({ message: "Role removed successfully" });
    } catch (error) {
      console.error("Error removing role:", error);
      res.status(500).json({ message: "Failed to remove role" });
    }
  });

  // Video routes
  app.get('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      const videos = category 
        ? await storage.getVideosByCategory(category)
        : await storage.getVideosByUploader(req.user.claims.sub);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.post('/api/videos', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const videoData = insertVideoSchema.parse({
        ...req.body,
        uploaderId: req.user.claims.sub,
        filePath: req.file.path,
      });

      // Process video to extract metadata and generate subtitles
      const processedData = await processVideo(req.file.path);
      
      const video = await storage.createVideo({
        ...videoData,
        duration: processedData.duration,
        thumbnailPath: processedData.thumbnailPath,
        subtitles: processedData.subtitles,
      });

      // Update user progress
      const progress = await storage.getUserProgress(req.user.claims.sub);
      await storage.updateUserProgress(req.user.claims.sub, {
        videosUploaded: (progress?.videosUploaded || 0) + 1,
      });

      res.json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Feedback routes
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, evaluatorId, learnerId } = req.query;
      let feedback;

      if (videoId) {
        feedback = await storage.getFeedbackByVideo(videoId);
      } else if (evaluatorId) {
        feedback = await storage.getFeedbackByEvaluator(evaluatorId);
      } else if (learnerId) {
        feedback = await storage.getFeedbackByLearner(learnerId);
      } else {
        feedback = await storage.getFeedbackByLearner(req.user.claims.sub);
      }

      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post('/api/feedback', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      let feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        evaluatorId: req.user.claims.sub,
      });

      // Process audio if provided
      if (req.file) {
        const transcription = await speechToText(req.file.path);
        feedbackData = {
          ...feedbackData,
          audioFilePath: req.file.path,
          voiceTranscription: transcription,
        };
      }

      const feedback = await storage.createFeedback(feedbackData);

      // Update user progress
      const progress = await storage.getUserProgress(feedbackData.learnerId);
      await storage.updateUserProgress(feedbackData.learnerId, {
        feedbackReceived: (progress?.feedbackReceived || 0) + 1,
      });

      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get('/api/feedback/pending', isAuthenticated, async (req: any, res) => {
    try {
      const videos = await storage.getPendingFeedback(req.user.claims.sub);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching pending feedback:", error);
      res.status(500).json({ message: "Failed to fetch pending feedback" });
    }
  });

  // Progress tracking
  app.get('/api/progress/:userId?', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId || req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Learning sessions
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = {
        ...req.body,
        userId: req.user.claims.sub,
      };
      const session = await storage.createLearningSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.put('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const session = await storage.updateLearningSession(id, req.body);
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Analytics and exports
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/export', isAuthenticated, async (req: any, res) => {
    try {
      const exportData = await storage.getExportData(req.body);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Speech to text endpoint
  app.post('/api/speech-to-text', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const transcription = await speechToText(req.file.path);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({ transcription });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // Serve uploaded files
  app.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(path.resolve(filePath));
  });

  const httpServer = createServer(app);
  return httpServer;
}
