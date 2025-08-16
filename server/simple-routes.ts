import type { Express } from "express";
import { createServer } from "http";

export function registerSimpleRoutes(app: Express) {
  // Learning records export endpoint
  app.get('/api/learning-records/export', (req, res) => {
    console.log('Learning records export endpoint called');
    
    const sampleRecords = [
      {
        watchId: 'W1ABC23456',
        userId: 'user-dev-123',
        userRoleId: '1L12345',
        videoId: 'video-basic-suturing',
        videoTitle: 'Basic Suturing Techniques',
        sessionStartTime: new Date(Date.now() - 900000).toISOString(),
        sessionEndTime: new Date(Date.now() - 420000).toISOString(),
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
        engagementScore: 82,
        preAssessmentScore: 65,
        postAssessmentScore: 78,
        difficultyRating: 3,
        satisfactionRating: 4
      },
      {
        watchId: 'W2DEF78901',
        userId: 'user-dev-456',
        userRoleId: '1R67890',
        videoId: 'video-advanced-knots',
        videoTitle: 'Advanced Knot Tying',
        sessionStartTime: new Date(Date.now() - 7200000).toISOString(),
        sessionEndTime: new Date(Date.now() - 6600000).toISOString(),
        watchDuration: 600,
        videoDuration: 720,
        completionPercentage: 83.3,
        isCompleted: true,
        pauseCount: 2,
        seekCount: 0,
        replayCount: 1,
        maxProgressReached: 100,
        skillLevel: 'advanced',
        learningPath: 'advanced-surgery',
        deviceType: 'tablet',
        browserInfo: 'Safari',
        screenResolution: '1024x768',
        accessMethod: 'recommendation',
        engagementScore: 91,
        preAssessmentScore: 72,
        postAssessmentScore: 89,
        difficultyRating: 4,
        satisfactionRating: 5
      },
      {
        watchId: 'W3GHI34567',
        userId: 'user-dev-789',
        userRoleId: '1A11111',
        videoId: 'video-instrument-handling',
        videoTitle: 'Surgical Instrument Handling',
        sessionStartTime: new Date(Date.now() - 3600000).toISOString(),
        sessionEndTime: new Date(Date.now() - 3240000).toISOString(),
        watchDuration: 360,
        videoDuration: 450,
        completionPercentage: 80,
        isCompleted: false,
        pauseCount: 1,
        seekCount: 2,
        replayCount: 0,
        maxProgressReached: 85,
        skillLevel: 'beginner',
        learningPath: 'basic-surgery',
        deviceType: 'mobile',
        browserInfo: 'Chrome',
        screenResolution: '375x667',
        accessMethod: 'assignment',
        engagementScore: 75,
        preAssessmentScore: 45,
        postAssessmentScore: 62,
        difficultyRating: 2,
        satisfactionRating: 4
      }
    ];
    
    res.setHeader('Content-Type', 'application/json');
    res.json(sampleRecords);
    console.log('Successfully sent', sampleRecords.length, 'learning records');
  });

  // Simple video scraper demo endpoint
  app.get('/api/scrape/status', (req, res) => {
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
  });

  app.post('/api/scrape/all', (req, res) => {
    console.log('Starting demo video scraping...');
    
    // Simulate a delay for realistic demo
    setTimeout(() => {
      const demoVideos = [
        {
          id: '1',
          title: "Basic Suturing Techniques for Medical Students",
          description: "Learn fundamental suturing techniques including simple interrupted, running, and mattress sutures.",
          duration: 720,
          platform: 'YouTube',
          instructor: 'Medical Creations'
        },
        {
          id: '2',
          title: "Advanced Surgical Knot Tying",
          description: "Master advanced knot tying techniques for surgical procedures.",
          duration: 900,
          platform: 'YouTube',
          instructor: 'Armando Hasudungan'
        },
        {
          id: '3',
          title: "Global Surgery Training: Suturing in Resource-Limited Settings",
          description: "Effective suturing techniques adapted for resource-limited surgical environments.",
          duration: 1200,
          platform: 'SURGhub',
          institution: 'UN Global Surgery Learning Hub'
        },
        {
          id: '4',
          title: "Emergency Suturing Procedures",
          description: "Critical suturing techniques for emergency and trauma situations.",
          duration: 960,
          platform: 'SURGhub',
          institution: 'UN Global Surgery Learning Hub'
        },
        {
          id: '5',
          title: "Plastic Surgery Suturing Techniques",
          description: "Aesthetic and functional suturing techniques for plastic surgery procedures.",
          duration: 1440,
          platform: 'MEDtube',
          institution: 'MEDtube Professional Network'
        },
        {
          id: '6',
          title: "Pediatric Suturing Considerations",
          description: "Special considerations and techniques for suturing in pediatric patients.",
          duration: 840,
          platform: 'MEDtube',
          institution: 'MEDtube Professional Network'
        },
        {
          id: '7',
          title: "Cardiovascular Surgery Suturing Techniques",
          description: "Specialized suturing techniques for cardiovascular procedures.",
          duration: 1800,
          platform: 'YouTube',
          instructor: 'MedCram'
        }
      ];

      const platformCounts = {
        youtube: demoVideos.filter(v => v.platform === 'YouTube').length,
        surghub: demoVideos.filter(v => v.platform === 'SURGhub').length,
        medtube: demoVideos.filter(v => v.platform === 'MEDtube').length
      };

      console.log(`Demo scraping complete: ${demoVideos.length} videos found`);

      res.json({
        success: true,
        count: demoVideos.length,
        videos: demoVideos,
        platforms: platformCounts
      });
    }, 1000); // 1 second delay to simulate scraping
  });

  return createServer(app);
}