import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
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
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    res.json({
      videosWatched: 15,
      videosUploaded: 3,
      feedbackReceived: 8,
      averageScore: 4.2,
      lastActivityAt: new Date().toISOString()
    });
  });

  // Feedback routes
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
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
      },
      {
        id: '2',
        videoId: '2',
        evaluatorId: 'eval-456',
        learnerId: 'dev-user-123',
        overallScore: 3.8,
        needleControl: 3,
        sutureSpacing: 4,
        knotSecurity: 4,
        overallTechnique: 4,
        textFeedback: 'Good progress. Work on needle control precision.',
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockFeedback);
  });

  // Pending feedback for evaluators
  app.get('/api/feedback/pending', isAuthenticated, async (req: any, res) => {
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
      },
      {
        id: '4',
        title: 'Student Practice Video 2',
        description: 'Running suture technique',
        uploaderId: 'student-456',
        category: 'practice',
        suturingType: 'running',
        duration: 240,
        createdAt: new Date().toISOString()
      }
    ];
    res.json(pendingVideos);
  });

  // Create HTTP server
  const server = createServer(app);
  return server;
}