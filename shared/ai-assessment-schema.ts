import { z } from "zod";

// AI Skill Assessment Schema
export const aiSkillAssessmentSchema = z.object({
  userId: z.string(),
  videoId: z.string(),
  watchId: z.string(),
  userRoleId: z.string(),
  
  // Video analysis data
  videoMetadata: z.object({
    duration: z.number(),
    suturingType: z.string(),
    complexity: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    skillAreas: z.array(z.string()),
  }),
  
  // User performance data
  performanceMetrics: z.object({
    completionPercentage: z.number(),
    watchDuration: z.number(),
    pauseCount: z.number(),
    seekCount: z.number(),
    replayCount: z.number(),
    engagementScore: z.number(),
  }),
  
  // Assessment results
  aiAnalysis: z.object({
    skillScore: z.number().min(0).max(100),
    technicalScore: z.number().min(0).max(100),
    speedScore: z.number().min(0).max(100),
    accuracyScore: z.number().min(0).max(100),
    overallProficiency: z.enum(['novice', 'beginner', 'intermediate', 'advanced', 'expert']),
    
    strengths: z.array(z.object({
      area: z.string(),
      description: z.string(),
      score: z.number(),
    })),
    
    improvementAreas: z.array(z.object({
      area: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
      recommendedActions: z.array(z.string()),
    })),
    
    personalizedFeedback: z.object({
      summary: z.string(),
      detailedAnalysis: z.string(),
      encouragement: z.string(),
      nextSteps: z.array(z.string()),
    }),
    
    recommendations: z.object({
      videos: z.array(z.object({
        videoId: z.string(),
        title: z.string(),
        reason: z.string(),
        priority: z.number(),
      })),
      learningPaths: z.array(z.object({
        pathName: z.string(),
        description: z.string(),
        estimatedDuration: z.string(),
        difficulty: z.string(),
      })),
      practiceExercises: z.array(z.object({
        title: z.string(),
        description: z.string(),
        difficulty: z.string(),
        estimatedTime: z.string(),
      })),
    }),
  }),
});

export type AiSkillAssessment = z.infer<typeof aiSkillAssessmentSchema>;

// Feedback Generation Schema
export const feedbackGenerationSchema = z.object({
  learningRecord: z.object({
    watchId: z.string(),
    userId: z.string(),
    userRoleId: z.string(),
    videoId: z.string(),
    skillLevel: z.string(),
    completionPercentage: z.number(),
    engagementScore: z.number(),
    pauseCount: z.number(),
    seekCount: z.number(),
    replayCount: z.number(),
  }),
  
  userProfile: z.object({
    currentSkillLevel: z.string(),
    learningGoals: z.array(z.string()),
    preferredLearningStyle: z.string(),
    experienceLevel: z.string(),
    specializations: z.array(z.string()),
  }),
  
  contextualData: z.object({
    recentPerformance: z.array(z.object({
      videoId: z.string(),
      score: z.number(),
      completionDate: z.string(),
    })),
    learningTrends: z.object({
      improvementRate: z.number(),
      consistencyScore: z.number(),
      engagementTrend: z.string(),
    }),
  }),
});

export type FeedbackGeneration = z.infer<typeof feedbackGenerationSchema>;

// Skill Progression Schema
export const skillProgressionSchema = z.object({
  userId: z.string(),
  userRoleId: z.string(),
  skillArea: z.string(),
  
  currentLevel: z.object({
    name: z.string(),
    score: z.number(),
    description: z.string(),
  }),
  
  progression: z.array(z.object({
    date: z.string(),
    score: z.number(),
    milestone: z.string().optional(),
    videoId: z.string().optional(),
  })),
  
  nextLevelRequirements: z.object({
    targetScore: z.number(),
    requiredSkills: z.array(z.string()),
    recommendedVideos: z.array(z.string()),
    estimatedTimeToAchieve: z.string(),
  }),
  
  aiInsights: z.object({
    learningVelocity: z.string(),
    strengthAreas: z.array(z.string()),
    challengeAreas: z.array(z.string()),
    personalizedTips: z.array(z.string()),
  }),
});

export type SkillProgression = z.infer<typeof skillProgressionSchema>;