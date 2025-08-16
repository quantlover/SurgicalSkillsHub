import { Router } from "express";
import { z } from "zod";
import type { IStorage } from "./storage";
import { insertLearningRecordSchema } from "@shared/schema";
import { generateLearningRecordIds, validateWatchId, validateUserRoleId } from "./services/id-generator";

export function createLearningRecordsRoutes(storage: IStorage): Router {
  const router = Router();

  // Create new learning record
  router.post("/learning-records", async (req, res) => {
    try {
      const data = insertLearningRecordSchema.parse(req.body);
      
      // Validate IDs
      if (!validateWatchId(data.watchId)) {
        return res.status(400).json({ error: "Invalid watch ID format" });
      }
      
      if (!validateUserRoleId(data.userRoleId)) {
        return res.status(400).json({ error: "Invalid user role ID format" });
      }
      
      const record = await storage.createLearningRecord(data);
      res.json(record);
    } catch (error) {
      console.error("Error creating learning record:", error);
      res.status(400).json({ error: "Invalid learning record data" });
    }
  });

  // Update learning record
  router.put("/learning-records/:watchId", async (req, res) => {
    try {
      const { watchId } = req.params;
      const updates = req.body;
      
      if (!validateWatchId(watchId)) {
        return res.status(400).json({ error: "Invalid watch ID format" });
      }
      
      const record = await storage.updateLearningRecord(watchId, updates);
      res.json(record);
    } catch (error) {
      console.error("Error updating learning record:", error);
      res.status(500).json({ error: "Failed to update learning record" });
    }
  });

  // Get learning record by watch ID
  router.get("/learning-records/:watchId", async (req, res) => {
    try {
      const { watchId } = req.params;
      
      if (!validateWatchId(watchId)) {
        return res.status(400).json({ error: "Invalid watch ID format" });
      }
      
      const record = await storage.getLearningRecord(watchId);
      if (!record) {
        return res.status(404).json({ error: "Learning record not found" });
      }
      
      res.json(record);
    } catch (error) {
      console.error("Error fetching learning record:", error);
      res.status(500).json({ error: "Failed to fetch learning record" });
    }
  });

  // Get learning records by user
  router.get("/learning-records/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId } = req.query;
      
      const records = await storage.getLearningRecordsByUser(userId, roleId as string);
      res.json(records);
    } catch (error) {
      console.error("Error fetching user learning records:", error);
      res.status(500).json({ error: "Failed to fetch user learning records" });
    }
  });

  // Get learning records by video
  router.get("/learning-records/video/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const records = await storage.getLearningRecordsByVideo(videoId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching video learning records:", error);
      res.status(500).json({ error: "Failed to fetch video learning records" });
    }
  });

  // Get all learning records with filters
  router.get("/learning-records", async (req, res) => {
    try {
      const filters = {
        userId: req.query.userId as string,
        roleId: req.query.roleId as string,
        videoId: req.query.videoId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        skillLevel: req.query.skillLevel as string,
        isCompleted: req.query.isCompleted ? req.query.isCompleted === 'true' : undefined
      };
      
      const records = await storage.getAllLearningRecords(filters);
      res.json(records);
    } catch (error) {
      console.error("Error fetching learning records:", error);
      res.status(500).json({ error: "Failed to fetch learning records" });
    }
  });

  // Export individual learning records
  router.get("/learning-records/export", async (req, res) => {
    try {
      const filters = {
        userId: req.query.userId as string,
        roleId: req.query.roleId as string,
        videoId: req.query.videoId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      
      const records = await storage.exportIndividualLearningRecords(filters);
      res.json(records);
    } catch (error) {
      console.error("Error exporting learning records:", error);
      res.status(500).json({ error: "Failed to export learning records" });
    }
  });

  // Generate new unique IDs for a user/role combination
  router.post("/learning-records/generate-ids", async (req, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({ error: "User ID and role are required" });
      }
      
      const ids = generateLearningRecordIds(userId, role);
      res.json(ids);
    } catch (error) {
      console.error("Error generating IDs:", error);
      res.status(500).json({ error: "Failed to generate IDs" });
    }
  });

  // Get analytics summary for learning records
  router.get("/learning-records/analytics/summary", async (req, res) => {
    try {
      const { userId, roleId, timeframe = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const dateFrom = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      const filters = {
        userId: userId as string,
        roleId: roleId as string,
        dateFrom,
        dateTo: now
      };
      
      const records = await storage.getAllLearningRecords(filters);
      
      // Calculate summary statistics
      const summary = {
        totalSessions: records.length,
        totalWatchTime: records.reduce((sum, record) => sum + (record.watchDuration || 0), 0),
        completedSessions: records.filter(record => record.isCompleted).length,
        averageCompletionRate: records.length > 0 
          ? records.reduce((sum, record) => sum + record.completionPercentage, 0) / records.length 
          : 0,
        averageEngagementScore: records.length > 0 
          ? records.reduce((sum, record) => sum + (record.engagementScore || 0), 0) / records.length 
          : 0,
        uniqueVideos: new Set(records.map(record => record.videoId)).size,
        skillLevels: records.reduce((acc, record) => {
          if (record.skillLevel) {
            acc[record.skillLevel] = (acc[record.skillLevel] || 0) + 1;
          }
          return acc;
        }, {} as { [key: string]: number }),
        deviceTypes: records.reduce((acc, record) => {
          acc[record.deviceType] = (acc[record.deviceType] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error generating learning records summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  return router;
}

export default createLearningRecordsRoutes;