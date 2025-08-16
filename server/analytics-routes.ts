import { Router } from "express";
import { z } from "zod";
import type { IStorage } from "./storage";
import { insertVideoAnalyticsSchema, insertVideoPerformanceSchema, insertUserAnalyticsSchema } from "@shared/schema";

export function createAnalyticsRoutes(storage: IStorage): Router {
  const router = Router();

  // Create or update video analytics
  router.post("/video-analytics", async (req, res) => {
    try {
      const data = insertVideoAnalyticsSchema.parse(req.body);
      const analytics = await storage.createVideoAnalytics(data);
      
      // Also update video performance aggregates
      await updateVideoPerformanceAggregates(storage, data.videoId);
      
      res.json(analytics);
    } catch (error) {
      console.error("Error creating video analytics:", error);
      res.status(400).json({ error: "Invalid analytics data" });
    }
  });

  // Get video analytics for a specific video
  router.get("/video-analytics/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.query;
      
      const analytics = await storage.getVideoAnalytics(videoId, userId as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching video analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get video performance metrics
  router.get("/video-performance/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const performance = await storage.getVideoPerformance(videoId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching video performance:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Get user analytics
  router.get("/user-analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  // Get engagement metrics for dashboard
  router.get("/engagement-metrics", async (req, res) => {
    try {
      const { timeframe = '7d' } = req.query;
      const metrics = await storage.getEngagementMetrics(timeframe as string);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching engagement metrics:", error);
      res.status(500).json({ error: "Failed to fetch engagement metrics" });
    }
  });

  // Get learning progress metrics
  router.get("/learning-progress", async (req, res) => {
    try {
      const { userId } = req.query;
      const progress = await storage.getLearningProgressMetrics(userId as string);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ error: "Failed to fetch learning progress" });
    }
  });

  // Get video performance report
  router.get("/video-performance-report", async (req, res) => {
    try {
      const videoIds = req.query.videoIds as string[];
      const report = await storage.getVideoPerformanceReport(videoIds);
      res.json(report);
    } catch (error) {
      console.error("Error generating performance report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Get popular content
  router.get("/popular-content", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const content = await storage.getPopularContent(Number(limit));
      res.json(content);
    } catch (error) {
      console.error("Error fetching popular content:", error);
      res.status(500).json({ error: "Failed to fetch popular content" });
    }
  });

  return router;
}

// Helper function to update video performance aggregates
async function updateVideoPerformanceAggregates(storage: IStorage, videoId: string) {
  try {
    // Get all analytics for this video
    const allAnalytics = await storage.getVideoAnalytics(videoId);
    
    if (allAnalytics.length === 0) return;

    // Calculate aggregated metrics
    const totalViews = allAnalytics.length;
    const uniqueViewers = new Set(allAnalytics.map(a => a.userId)).size;
    const completedViews = allAnalytics.filter(a => a.isCompleted).length;
    const totalWatchTime = allAnalytics.reduce((sum, a) => sum + (a.watchDuration || 0), 0);
    const avgWatchTime = totalWatchTime / totalViews;
    const completionRate = (completedViews / totalViews) * 100;
    
    // Calculate engagement score (0-100)
    const avgPauseCount = allAnalytics.reduce((sum, a) => sum + (a.pauseCount || 0), 0) / totalViews;
    const avgSeekCount = allAnalytics.reduce((sum, a) => sum + (a.seekCount || 0), 0) / totalViews;
    const replayCount = allAnalytics.filter(a => (a.replayCount || 0) > 0).length;
    const replayRate = (replayCount / totalViews) * 100;
    
    // Simple engagement score algorithm
    const engagementScore = Math.min(100, 
      (completionRate * 0.4) + 
      (Math.min(avgWatchTime / 600, 1) * 30) + // Normalize to 10 minutes
      (Math.max(0, 20 - avgPauseCount * 2)) + // Fewer pauses = better engagement
      (replayRate * 0.1)
    );

    // Update or create performance record
    const performanceData = {
      videoId,
      totalViews,
      uniqueViewers,
      averageWatchTime: avgWatchTime,
      completionRate,
      averagePauseCount: avgPauseCount,
      averageSeekCount: avgSeekCount,
      replayRate,
      engagementScore,
      lastUpdated: new Date().toISOString()
    };

    await storage.updateVideoPerformance(videoId, performanceData);
  } catch (error) {
    console.error("Error updating video performance aggregates:", error);
  }
}

export default createAnalyticsRoutes;