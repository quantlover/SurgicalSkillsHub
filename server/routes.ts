import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { speechToText } from "./services/speechToText";
import { processVideo } from "./services/videoProcessor";
import { VideoScraperService } from "./services/video-scraper.js";
import { VideoProcessorService } from "./services/video-processor.js";
import createLearningRecordsRoutes from "./learning-records-routes";

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
  // Initialize video services
  const videoScraper = new VideoScraperService();
  const videoProcessor = new VideoProcessorService();
  
  // Mock storage for development - in production this would use a real storage implementation
  const mockStorage = {
    // Learning records methods
    createLearningRecord: async (record: any) => ({ id: 'mock-id', ...record }),
    updateLearningRecord: async (watchId: string, updates: any) => ({ watchId, ...updates }),
    getLearningRecord: async (watchId: string) => null,
    getLearningRecordsByUser: async (userId: string, roleId?: string) => [],
    getLearningRecordsByVideo: async (videoId: string) => [],
    getAllLearningRecords: async (filters?: any) => [],
    exportIndividualLearningRecords: async (filters?: any) => [
      {
        watchId: 'W123ABC456',
        userId: 'user-123',
        userRoleId: '1L12345',
        videoId: 'video-456',
        videoTitle: 'Basic Suturing Techniques',
        sessionStartTime: new Date().toISOString(),
        sessionEndTime: new Date().toISOString(),
        watchDuration: 480,
        videoDuration: 600,
        completionPercentage: 80,
        isCompleted: false,
        pauseCount: 3,
        seekCount: 1,
        replayCount: 0,
        maxProgressReached: 85,
        skillLevel: 'intermediate',
        learningPath: 'basic-surgery',
        deviceType: 'desktop',
        browserInfo: 'Chrome',
        screenResolution: '1920x1080',
        accessMethod: 'direct',
        engagementScore: 82
      }
    ]
  };
  
  // Mount learning records routes
  app.use('/api', createLearningRecordsRoutes(mockStorage as any));
  
  // Simple auth middleware for development
  const isAuthenticated = (req: any, res: any, next: any) => {
    req.user = { uid: 'dev-user-123' };
    next();
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json({
      id: 'dev-user-123',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      roles: ['learner', 'evaluator']
    });
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
    const { category } = req.query;
    const mockVideos = [
      {
        id: '1',
        title: 'Basic Suturing Techniques',
        description: 'Learn fundamental suturing methods',
        filePath: '/uploads/video1.mp4',
        uploaderId: 'dev-user-123',
        category: category || 'reference',
        suturingType: 'simple_interrupted',
        duration: 300,
        thumbnailPath: '/uploads/thumb1.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Advanced Knot Tying',
        description: 'Master complex knot techniques',
        filePath: '/uploads/video2.mp4',
        uploaderId: 'dev-user-123',
        category: category || 'reference',
        suturingType: 'running',
        duration: 450,
        thumbnailPath: '/uploads/thumb2.jpg',
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockVideos);
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

  // Video scraping endpoints
  app.post('/api/scrape/youtube', isAuthenticated, async (req, res) => {
    try {
      const { channelId, maxVideos = 10 } = req.body;
      
      if (!channelId) {
        return res.status(400).json({ error: 'Channel ID is required' });
      }

      const scrapedVideos = await videoScraper.scrapeYouTubeChannel(channelId, maxVideos);
      const processedVideos = await videoProcessor.processVideoBatch(scrapedVideos);
      
      res.json({
        success: true,
        count: processedVideos.length,
        videos: processedVideos
      });
    } catch (error) {
      console.error('YouTube scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape YouTube channel' });
    }
  });

  app.post('/api/scrape/surghub', isAuthenticated, async (req, res) => {
    try {
      const { maxVideos = 10 } = req.body;
      
      const scrapedVideos = await videoScraper.scrapeSURGhub(maxVideos);
      const processedVideos = await videoProcessor.processVideoBatch(scrapedVideos);
      
      res.json({
        success: true,
        count: processedVideos.length,
        videos: processedVideos
      });
    } catch (error) {
      console.error('SURGhub scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape SURGhub' });
    }
  });

  app.post('/api/scrape/medtube', isAuthenticated, async (req, res) => {
    try {
      const { maxVideos = 10 } = req.body;
      
      const scrapedVideos = await videoScraper.scrapeMEDtube(maxVideos);
      const processedVideos = await videoProcessor.processVideoBatch(scrapedVideos);
      
      res.json({
        success: true,
        count: processedVideos.length,
        videos: processedVideos
      });
    } catch (error) {
      console.error('MEDtube scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape MEDtube' });
    }
  });

  app.post('/api/scrape/all', isAuthenticated, async (req, res) => {
    try {
      console.log('Starting comprehensive video scraping...');
      
      const scrapedVideos = await videoScraper.scrapeAllPlatforms();
      console.log(`Scraped ${scrapedVideos.length} videos`);
      
      // For demo purposes, we'll return the scraped videos directly
      // In a real implementation, you'd process them through the video processor
      const processedVideos = scrapedVideos;
      
      const platformCounts = {
        youtube: processedVideos.filter(v => v.platform === 'YouTube').length,
        surghub: processedVideos.filter(v => v.platform === 'SURGhub').length,
        medtube: processedVideos.filter(v => v.platform === 'MEDtube').length
      };
      
      console.log(`Successfully processed ${processedVideos.length} videos:`, platformCounts);
      
      res.json({
        success: true,
        count: processedVideos.length,
        videos: processedVideos,
        platforms: platformCounts
      });
    } catch (error) {
      console.error('Comprehensive scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape video platforms' });
    }
  });

  app.get('/api/scrape/status', isAuthenticated, async (req, res) => {
    try {
      res.json({
        success: true,
        platforms: {
          youtube: 'Available',
          surghub: 'Available', 
          medtube: 'Available'
        },
        supportedChannels: [
          'Medical Creations',
          'Armando Hasudungan',
          'MedCram',
          'Osmosis',
          'The Suture Buddy'
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get scraping status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
