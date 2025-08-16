import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export function registerSimpleRoutes(app: Express): Server {
  // Mock data for demo mode
  const mockVideos = [
    {
      id: '1',
      title: 'Basic Suturing Techniques',
      description: 'Learn fundamental suturing methods used in medical procedures',
      filePath: '/uploads/basic-suturing.mp4',
      uploaderId: 'instructor-1',
      category: 'reference',
      duration: 180,
      createdAt: new Date('2024-01-15').toISOString(),
      tags: ['basic', 'suturing', 'technique']
    },
    {
      id: '2',
      title: 'Advanced Knot Tying',
      description: 'Master complex knot tying techniques for surgical procedures',
      filePath: '/uploads/knot-tying.mp4',
      uploaderId: 'instructor-2',
      category: 'reference',
      duration: 240,
      createdAt: new Date('2024-01-20').toISOString(),
      tags: ['advanced', 'knots', 'surgical']
    },
    {
      id: '3',
      title: 'Student Practice: Simple Interrupted',
      description: 'Practice video demonstrating simple interrupted suturing',
      filePath: '/uploads/practice-1.mp4',
      uploaderId: 'student-1',
      category: 'practice',
      duration: 120,
      createdAt: new Date('2024-02-01').toISOString(),
      tags: ['practice', 'interrupted', 'beginner']
    }
  ];

  const mockFeedback = [
    {
      id: '1',
      videoId: '3',
      evaluatorId: 'eval-1',
      learnerId: 'student-1',
      overallScore: 4,
      technicalScore: 4,
      speedScore: 3,
      precisionScore: 4,
      comments: 'Good technique overall. Need to work on speed and consistency.',
      voiceTranscript: 'The student demonstrates good understanding of the basic technique. Hand positioning is correct and suture placement is accurate. However, there is room for improvement in speed and consistency between sutures.',
      createdAt: new Date('2024-02-02').toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      videoId: '3',
      evaluatorId: 'eval-2',
      learnerId: 'student-1',
      overallScore: 3,
      technicalScore: 3,
      speedScore: 3,
      precisionScore: 4,
      comments: 'Needs improvement in instrument handling and knot tying speed.',
      createdAt: new Date('2024-02-03').toISOString(),
      status: 'pending'
    }
  ];

  const mockProgress = {
    videosWatched: 15,
    videosUploaded: 3,
    feedbackReceived: 8,
    averageScore: 3.6,
    skillLevel: 'Intermediate',
    completionRate: 0.75
  };

  // Simple auth middleware for demo mode
  const demoAuth = (req: any, res: any, next: any) => {
    req.user = { uid: 'demo-user-123', email: 'demo@example.com' };
    next();
  };

  // Auth routes
  app.get('/api/auth/user', demoAuth, (req: any, res) => {
    res.json({
      id: 'demo-user-123',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      roles: ['learner', 'evaluator']
    });
  });

  // Video routes
  app.get('/api/videos', demoAuth, (req: any, res) => {
    const { category } = req.query;
    let videos = mockVideos;
    
    if (category) {
      videos = videos.filter(v => v.category === category);
    }
    
    res.json(videos);
  });

  app.post('/api/videos', demoAuth, upload.single('video'), (req: any, res) => {
    const { title, description, category = 'practice' } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const newVideo = {
      id: Date.now().toString(),
      title,
      description,
      filePath: `/uploads/${file.filename}`,
      uploaderId: req.user.uid,
      category,
      duration: 0, // Would be processed in real implementation
      createdAt: new Date().toISOString(),
      tags: []
    };

    mockVideos.push(newVideo);
    res.json(newVideo);
  });

  app.get('/api/videos/:id', demoAuth, (req: any, res) => {
    const video = mockVideos.find(v => v.id === req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  });

  // Feedback routes
  app.get('/api/feedback', demoAuth, (req: any, res) => {
    const { evaluatorId, learnerId } = req.query;
    let feedback = mockFeedback;
    
    if (evaluatorId) {
      feedback = feedback.filter(f => f.evaluatorId === evaluatorId);
    }
    if (learnerId) {
      feedback = feedback.filter(f => f.learnerId === learnerId);
    }
    
    res.json(feedback);
  });

  app.post('/api/feedback', demoAuth, (req: any, res) => {
    const feedbackData = {
      id: Date.now().toString(),
      evaluatorId: req.user.uid,
      createdAt: new Date().toISOString(),
      status: 'completed',
      ...req.body
    };
    
    mockFeedback.push(feedbackData);
    res.json(feedbackData);
  });

  // Progress routes
  app.get('/api/progress', demoAuth, (req: any, res) => {
    res.json(mockProgress);
  });

  // Speech-to-text route
  app.post('/api/speech-to-text', demoAuth, upload.single('audio'), (req: any, res) => {
    // Demo response - in real implementation would use OpenAI or browser speech recognition
    const mockTranscription = "This is a demonstration of speech-to-text functionality. In the real implementation, this would transcribe the uploaded audio file.";
    res.json({ transcript: mockTranscription });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'demo' });
  });

  const httpServer = createServer(app);
  return httpServer;
}