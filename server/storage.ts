import {
  users,
  userRoles,
  videos,
  feedback,
  userProgress,
  learningSessions,
  scrapedVideos,
  type User,
  type UpsertUser,
  type UserRole,
  type InsertUserRole,
  type Video,
  type InsertVideo,
  type Feedback,
  type InsertFeedback,
  type UserProgress,
  type InsertUserProgress,
  type LearningSession,
  type InsertLearningSession,
  type ScrapedVideo,
  type InsertScrapedVideo,
  type VideoAnalytics,
  type InsertVideoAnalytics,
  type VideoPerformance,
  type InsertVideoPerformance,
  type UserAnalytics,
  type InsertUserAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User role operations
  getUserRoles(userId: string): Promise<UserRole[]>;
  assignUserRole(userRole: InsertUserRole): Promise<UserRole>;
  removeUserRole(userId: string, role: string): Promise<void>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideosByUploader(uploaderId: string): Promise<Video[]>;
  updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByVideo(videoId: string): Promise<Feedback[]>;
  getFeedbackByEvaluator(evaluatorId: string): Promise<Feedback[]>;
  getFeedbackByLearner(learnerId: string): Promise<Feedback[]>;
  getPendingFeedback(evaluatorId: string): Promise<Video[]>;
  
  // Progress tracking
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  
  // Learning sessions
  createLearningSession(session: InsertLearningSession): Promise<LearningSession>;
  updateLearningSession(id: string, updates: Partial<InsertLearningSession>): Promise<LearningSession>;
  
  // Scraped videos for admin review
  createScrapedVideo(scrapedVideo: InsertScrapedVideo): Promise<ScrapedVideo>;
  getScrapedVideosPendingReview(): Promise<ScrapedVideo[]>;
  getScrapedVideosByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ScrapedVideo[]>;
  updateScrapedVideoReview(id: string, review: {
    reviewStatus: 'approved' | 'rejected';
    reviewedBy: string;
    reviewNotes?: string;
    approvedVideoId?: string;
  }): Promise<ScrapedVideo>;
  
  // Video analytics for performance tracking
  createVideoAnalytics(analytics: InsertVideoAnalytics): Promise<VideoAnalytics>;
  updateVideoAnalytics(id: string, updates: Partial<InsertVideoAnalytics>): Promise<VideoAnalytics>;
  getVideoAnalytics(videoId: string, userId?: string): Promise<VideoAnalytics[]>;
  getVideoPerformance(videoId: string): Promise<VideoPerformance | undefined>;
  updateVideoPerformance(videoId: string, updates: Partial<InsertVideoPerformance>): Promise<VideoPerformance>;
  getUserAnalytics(userId: string): Promise<UserAnalytics | undefined>;
  updateUserAnalytics(userId: string, updates: Partial<InsertUserAnalytics>): Promise<UserAnalytics>;
  
  // Analytics aggregation and reporting
  getEngagementMetrics(timeframe: string): Promise<any>;
  getLearningProgressMetrics(userId?: string): Promise<any>;
  getVideoPerformanceReport(videoIds?: string[]): Promise<any>;
  getPopularContent(limit?: number): Promise<any>;
  
  // Analytics and exports
  getAnalytics(): Promise<{
    totalVideos: number;
    activeUsers: number;
    averageScore: number;
    completionRate: number;
  }>;
  
  getExportData(options: {
    includeMetadata?: boolean;
    includeFeedback?: boolean;
    includeProgress?: boolean;
    includeTrajectories?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User role operations
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await db.select().from(userRoles).where(eq(userRoles.userId, userId));
  }

  async assignUserRole(userRole: InsertUserRole): Promise<UserRole> {
    const [role] = await db.insert(userRoles).values(userRole).returning();
    return role;
  }

  async removeUserRole(userId: string, role: string): Promise<void> {
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
  }

  // Video operations
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.category, category))
      .orderBy(desc(videos.createdAt));
  }

  async getVideosByUploader(uploaderId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.uploaderId, uploaderId))
      .orderBy(desc(videos.createdAt));
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getFeedbackByVideo(videoId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.videoId, videoId))
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByEvaluator(evaluatorId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.evaluatorId, evaluatorId))
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByLearner(learnerId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.learnerId, learnerId))
      .orderBy(desc(feedback.createdAt));
  }

  async getPendingFeedback(evaluatorId: string): Promise<Video[]> {
    // Get videos that need feedback from this evaluator
    const videosWithoutFeedback = await db
      .select()
      .from(videos)
      .leftJoin(feedback, eq(videos.id, feedback.videoId))
      .where(
        and(
          eq(videos.category, 'practice'),
          sql`${feedback.id} IS NULL`
        )
      );
    
    return videosWithoutFeedback.map(row => row.videos);
  }

  // Progress tracking
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    return progress;
  }

  async updateUserProgress(userId: string, progressData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [updatedProgress] = await db
      .insert(userProgress)
      .values({ userId, ...progressData })
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedProgress;
  }

  // Learning sessions
  async createLearningSession(session: InsertLearningSession): Promise<LearningSession> {
    const [newSession] = await db.insert(learningSessions).values(session).returning();
    return newSession;
  }

  async updateLearningSession(id: string, updates: Partial<InsertLearningSession>): Promise<LearningSession> {
    const [updatedSession] = await db
      .update(learningSessions)
      .set(updates)
      .where(eq(learningSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Analytics and exports
  async getAnalytics(): Promise<{
    totalVideos: number;
    activeUsers: number;
    averageScore: number;
    completionRate: number;
  }> {
    const [videoCount] = await db.select({ count: sql`count(*)` }).from(videos);
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [avgScore] = await db.select({ avg: sql`avg(${feedback.overallScore})` }).from(feedback);
    const [completionRate] = await db.select({ avg: sql`avg(${learningSessions.completionPercentage})` }).from(learningSessions);

    return {
      totalVideos: Number(videoCount.count),
      activeUsers: Number(userCount.count),
      averageScore: Number(avgScore.avg) || 0,
      completionRate: Number(completionRate.avg) || 0,
    };
  }

  async getExportData(options: {
    includeMetadata?: boolean;
    includeFeedback?: boolean;
    includeProgress?: boolean;
    includeTrajectories?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const result: any = {};

    if (options.includeMetadata) {
      let query = db.select().from(videos);
      if (options.startDate) {
        query = query.where(sql`${videos.createdAt} >= ${options.startDate}`);
      }
      if (options.endDate) {
        query = query.where(sql`${videos.createdAt} <= ${options.endDate}`);
      }
      result.videos = await query;
    }

    if (options.includeFeedback) {
      let query = db.select().from(feedback);
      if (options.startDate) {
        query = query.where(sql`${feedback.createdAt} >= ${options.startDate}`);
      }
      if (options.endDate) {
        query = query.where(sql`${feedback.createdAt} <= ${options.endDate}`);
      }
      result.feedback = await query;
    }

    if (options.includeProgress) {
      result.userProgress = await db.select().from(userProgress);
    }

    if (options.includeTrajectories) {
      let query = db.select().from(learningSessions);
      if (options.startDate) {
        query = query.where(sql`${learningSessions.startTime} >= ${options.startDate}`);
      }
      if (options.endDate) {
        query = query.where(sql`${learningSessions.startTime} <= ${options.endDate}`);
      }
      result.learningSessions = await query;
    }

    return result;
  }
}

export const storage = new DatabaseStorage();
