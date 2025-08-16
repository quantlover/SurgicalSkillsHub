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

  // AI Assessment endpoints
  app.post('/api/ai-assessment/analyze-skill', async (req, res) => {
    try {
      console.log('AI skill assessment requested');
      
      const { watchId, userId, userRoleId, videoId, learningRecord } = req.body;
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate skill scores based on learning record
      const calculateSkillScores = (record: any) => {
        const {
          completionPercentage = 75,
          watchDuration = 480,
          videoDuration = 600,
          pauseCount = 3,
          seekCount = 1,
          replayCount = 0,
          engagementScore = 82,
        } = record;

        // Technical execution score
        const technicalScore = Math.min(100, (completionPercentage * 0.7) + (engagementScore * 0.3));

        // Speed score
        const optimalWatchRatio = Math.min(1.5, watchDuration / videoDuration);
        const pausePenalty = Math.min(20, pauseCount * 2);
        const seekPenalty = Math.min(15, seekCount * 1.5);
        const speedScore = Math.max(0, 100 - pausePenalty - seekPenalty - ((optimalWatchRatio - 1) * 10));

        // Accuracy score
        const replayPenalty = Math.min(25, replayCount * 5);
        const accuracyScore = Math.max(0, 100 - replayPenalty - (seekCount * 2));

        // Overall skill score
        const skillScore = (technicalScore * 0.4) + (speedScore * 0.3) + (accuracyScore * 0.3);

        return {
          skillScore: Math.round(skillScore),
          technicalScore: Math.round(technicalScore),
          speedScore: Math.round(speedScore),
          accuracyScore: Math.round(accuracyScore),
        };
      };

      const scores = calculateSkillScores(learningRecord);
      
      // Determine proficiency level
      const getProficiencyLevel = (score: number) => {
        if (score >= 90) return 'expert';
        if (score >= 80) return 'advanced';
        if (score >= 60) return 'intermediate';
        if (score >= 40) return 'beginner';
        return 'novice';
      };

      const assessment = {
        overallProficiency: getProficiencyLevel(scores.skillScore),
        strengths: [
          {
            area: 'Learning Engagement',
            description: 'You demonstrate consistent attention and focus during learning sessions',
            score: Math.max(70, learningRecord.engagementScore || 82)
          },
          {
            area: 'Content Completion',
            description: 'You work through material systematically and thoroughly',
            score: learningRecord.completionPercentage || 75
          }
        ],
        improvementAreas: [
          {
            area: 'Technique Efficiency',
            description: 'Focus on smooth, continuous technique execution without excessive pauses',
            priority: learningRecord.pauseCount > 5 ? 'high' : 'medium',
            recommendedActions: [
              'Practice techniques in shorter, focused sessions',
              'Review prerequisite skills before attempting complex procedures',
              'Use mental rehearsal before practical execution'
            ]
          },
          {
            area: 'Conceptual Understanding',
            description: 'Strengthen theoretical foundation to support practical skills',
            priority: learningRecord.replayCount > 2 ? 'high' : 'low',
            recommendedActions: [
              'Review anatomical diagrams before video sessions',
              'Take notes on key technique points',
              'Discuss complex concepts with instructors'
            ]
          }
        ],
        personalizedFeedback: {
          summary: `You achieved ${scores.skillScore}% overall proficiency with particularly strong ${scores.technicalScore >= scores.speedScore ? 'technical execution' : 'learning efficiency'}.`,
          detailedAnalysis: `Your learning pattern shows ${learningRecord.completionPercentage >= 80 ? 'excellent commitment to completing material' : 'good engagement with room for improvement in completion rates'}. ${learningRecord.pauseCount <= 5 ? 'Your focused viewing approach indicates good comprehension.' : 'Consider reviewing prerequisite material to reduce the need for frequent pauses.'}`,
          encouragement: 'Your dedication to learning surgical techniques is evident in your engagement metrics. Every practice session builds crucial muscle memory and theoretical understanding.',
          nextSteps: [
            'Complete any remaining sections of the current video',
            'Practice the demonstrated techniques in a controlled environment',
            'Seek feedback from experienced practitioners',
            'Progress to the next skill level when ready'
          ]
        },
        recommendations: {
          videos: [
            {
              videoId: 'recommended-1',
              title: 'Advanced Suturing Techniques',
              reason: 'Builds upon your current skill foundation',
              priority: 85
            },
            {
              videoId: 'recommended-2', 
              title: 'Common Suturing Mistakes and Corrections',
              reason: 'Addresses identified improvement areas',
              priority: 75
            }
          ],
          learningPaths: [
            {
              pathName: 'Comprehensive Suturing Mastery',
              description: 'Progressive skill development from basic to expert level',
              estimatedDuration: '8-12 weeks',
              difficulty: 'progressive'
            }
          ],
          practiceExercises: [
            {
              title: 'Simple Interrupted Suture Practice',
              description: 'Repetitive practice of fundamental technique',
              difficulty: 'beginner',
              estimatedTime: '30 minutes'
            }
          ]
        }
      };

      const feedback = scores.skillScore >= 75 
        ? 'Excellent progress! Your performance demonstrates strong technical competency and learning engagement. Continue building on these solid foundations with advanced techniques.'
        : scores.skillScore >= 60
        ? 'Good work! You\'re developing solid suturing skills. Focus on consistency and smooth technique execution to reach the next proficiency level.'
        : 'You\'re making progress in your surgical training. Remember that mastering suturing techniques takes dedicated practice. Focus on understanding each step thoroughly before increasing speed.';

      const responseData = {
        scores,
        assessment,
        feedback,
        watchId,
        userId,
        userRoleId,
        analysisDate: new Date().toISOString()
      };

      res.json(responseData);
      console.log('AI assessment completed successfully');
      
    } catch (error) {
      console.error('AI assessment error:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI assessment',
        message: 'The AI assessment service is currently unavailable. Please try again later.'
      });
    }
  });

  app.post('/api/ai-assessment/generate-feedback', async (req, res) => {
    try {
      const { learningRecord, userProfile, contextualData } = req.body;
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const completion = learningRecord.completionPercentage || 75;
      const engagement = learningRecord.engagementScore || 80;
      
      let feedback = '';
      
      if (completion >= 80 && engagement >= 70) {
        feedback = 'Outstanding performance! Your high completion rate and strong engagement demonstrate excellent learning habits. You\'re showing mastery of the fundamental concepts and are ready to tackle more advanced techniques. Your consistent attention to detail will serve you well in clinical practice.';
      } else if (completion >= 60 && engagement >= 60) {
        feedback = 'Solid progress! You\'re building a good foundation in surgical techniques. Consider reviewing the sections where you paused most frequently to reinforce key concepts. Your engagement level shows commitment to learning - keep up the excellent work!';
      } else if (completion >= 40) {
        feedback = 'You\'re on the right track! Learning complex surgical procedures takes time and patience. Focus on completing each video section thoroughly before moving on. Don\'t hesitate to replay difficult sections - this repetition is crucial for skill development.';
      } else {
        feedback = 'Every expert started where you are now! Surgical skills require dedicated practice and patience. Set aside focused study time, minimize distractions, and remember that each session builds important foundational knowledge. Consider breaking longer videos into smaller, manageable segments.';
      }
      
      res.json({
        feedback,
        confidence: 0.85,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Feedback generation error:', error);
      res.status(500).json({ error: 'Failed to generate personalized feedback' });
    }
  });

  return createServer(app);
}