import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles for role-based access control
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").notNull(), // 'learner', 'evaluator', 'researcher', 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos table for storing uploaded and reference videos
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  filePath: varchar("file_path").notNull(),
  uploaderId: varchar("uploader_id").references(() => users.id).notNull(),
  category: varchar("category").notNull(), // 'reference', 'practice'
  suturingType: varchar("suturing_type"), // 'simple_interrupted', 'running', 'mattress', etc.
  duration: integer("duration"), // in seconds
  thumbnailPath: varchar("thumbnail_path"),
  subtitles: jsonb("subtitles"), // array of subtitle objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback table for evaluator feedback on videos
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id").references(() => videos.id).notNull(),
  evaluatorId: varchar("evaluator_id").references(() => users.id).notNull(),
  learnerId: varchar("learner_id").references(() => users.id).notNull(),
  overallScore: real("overall_score"), // 1-5 scale
  needleControl: integer("needle_control"), // 1-5 scale
  sutureSpacing: integer("suture_spacing"), // 1-5 scale
  knotSecurity: integer("knot_security"), // 1-5 scale
  overallTechnique: integer("overall_technique"), // 1-5 scale
  textFeedback: text("text_feedback"),
  voiceTranscription: text("voice_transcription"),
  audioFilePath: varchar("audio_file_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videosWatched: integer("videos_watched").default(0),
  videosUploaded: integer("videos_uploaded").default(0),
  feedbackReceived: integer("feedback_received").default(0),
  averageScore: real("average_score"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning sessions for tracking video viewing
export const learningSessions = pgTable("learning_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videoId: uuid("video_id").references(() => videos.id).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  completionPercentage: real("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scraped videos pending admin review
export const scrapedVideos = pgTable("scraped_videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: integer("duration"), // in seconds
  thumbnailUrl: varchar("thumbnail_url"),
  videoUrl: varchar("video_url").notNull(),
  sourceUrl: varchar("source_url").notNull(),
  platform: varchar("platform").notNull(), // 'YouTube', 'SURGhub', 'MEDtube'
  category: varchar("category").notNull(), // 'practice', 'reference'
  difficulty: varchar("difficulty"), // 'beginner', 'intermediate', 'advanced', 'expert'
  tags: jsonb("tags"), // array of tags
  instructor: varchar("instructor"), // for YouTube videos
  institution: varchar("institution"), // for institutional videos
  scrapedAt: timestamp("scraped_at").defaultNow(),
  scrapedBy: varchar("scraped_by").references(() => users.id).notNull(),
  reviewStatus: varchar("review_status").default("pending").notNull(), // 'pending', 'approved', 'rejected'
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  approvedVideoId: uuid("approved_video_id").references(() => videos.id), // links to main videos table when approved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video analytics for detailed performance metrics
export const videoAnalytics = pgTable('video_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // View metrics
  viewStartTime: timestamp('view_start_time', { withTimezone: true }).notNull(),
  viewEndTime: timestamp('view_end_time', { withTimezone: true }),
  watchDuration: integer('watch_duration'), // seconds watched
  completionPercentage: real('completion_percentage'), // 0-100
  isCompleted: boolean('is_completed').default(false),
  
  // Engagement metrics
  pauseCount: integer('pause_count').default(0),
  seekCount: integer('seek_count').default(0),
  replayCount: integer('replay_count').default(0),
  playbackSpeed: real('playback_speed').default(1.0),
  
  // Learning metrics
  maxProgressReached: real('max_progress_reached').default(0), // highest % reached
  timeToCompletion: integer('time_to_completion'), // total time to complete
  averageViewingSession: integer('average_viewing_session'), // avg session length
  totalViewingSessions: integer('total_viewing_sessions').default(1),
  
  // Context metrics
  deviceType: varchar('device_type'), // 'desktop', 'mobile', 'tablet'
  accessMethod: varchar('access_method'), // 'direct', 'search', 'recommendation'
  referrerPage: varchar('referrer_page'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Video performance aggregates for quick dashboard queries
export const videoPerformance = pgTable('video_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id),
  
  // View statistics
  totalViews: integer('total_views').default(0),
  uniqueViewers: integer('unique_viewers').default(0),
  averageWatchTime: real('average_watch_time').default(0),
  completionRate: real('completion_rate').default(0), // percentage of viewers who completed
  
  // Engagement statistics
  averagePauseCount: real('average_pause_count').default(0),
  averageSeekCount: real('average_seek_count').default(0),
  replayRate: real('replay_rate').default(0), // percentage who replayed
  
  // Learning effectiveness
  averageTimeToCompletion: real('average_time_to_completion').default(0),
  dropoffPoints: jsonb('dropoff_points'), // array of percentages where users commonly drop off
  engagementScore: real('engagement_score').default(0), // computed engagement metric 0-100
  
  // Temporal metrics
  peakViewingHours: jsonb('peak_viewing_hours'), // hours of day with most views
  viewingTrends: jsonb('viewing_trends'), // JSON object of trend data
  
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// User learning analytics
export const userAnalytics = pgTable('user_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // Overall learning metrics
  totalWatchTime: integer('total_watch_time').default(0), // total seconds watched
  videosCompleted: integer('videos_completed').default(0),
  averageCompletionRate: real('average_completion_rate').default(0),
  learningStreak: integer('learning_streak').default(0), // consecutive days with activity
  
  // Skill progression
  skillLevels: jsonb('skill_levels'), // JSON object of skill assessments
  competencyScores: jsonb('competency_scores'), // JSON object of competency metrics
  learningPath: varchar('learning_path'), // current learning path
  
  // Engagement patterns
  preferredViewingTime: varchar('preferred_viewing_time'), // time of day user is most active
  averageSessionLength: real('average_session_length').default(0),
  studyHabits: jsonb('study_habits'), // JSON object of study pattern analysis
  
  // Performance trends
  weeklyProgress: jsonb('weekly_progress'), // JSON array of weekly metrics
  monthlyProgress: jsonb('monthly_progress'), // JSON array of monthly metrics
  improvementRate: real('improvement_rate').default(0), // rate of skill improvement
  
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  uploadedVideos: many(videos),
  receivedFeedback: many(feedback, { relationName: "learnerFeedback" }),
  givenFeedback: many(feedback, { relationName: "evaluatorFeedback" }),
  progress: many(userProgress),
  sessions: many(learningSessions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  uploader: one(users, {
    fields: [videos.uploaderId],
    references: [users.id],
  }),
  feedback: many(feedback),
  sessions: many(learningSessions),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  video: one(videos, {
    fields: [feedback.videoId],
    references: [videos.id],
  }),
  evaluator: one(users, {
    fields: [feedback.evaluatorId],
    references: [users.id],
  }),
  learner: one(users, {
    fields: [feedback.learnerId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const learningSessionsRelations = relations(learningSessions, ({ one }) => ({
  user: one(users, {
    fields: [learningSessions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [learningSessions.videoId],
    references: [videos.id],
  }),
}));

export const scrapedVideosRelations = relations(scrapedVideos, ({ one }) => ({
  scrapedBy: one(users, {
    fields: [scrapedVideos.scrapedBy],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [scrapedVideos.reviewedBy],
    references: [users.id],
  }),
  approvedVideo: one(videos, {
    fields: [scrapedVideos.approvedVideoId],
    references: [videos.id],
  }),
}));

export const videoAnalyticsRelations = relations(videoAnalytics, ({ one }) => ({
  video: one(videos, {
    fields: [videoAnalytics.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoAnalytics.userId],
    references: [users.id],
  }),
}));

export const videoPerformanceRelations = relations(videoPerformance, ({ one }) => ({
  video: one(videos, {
    fields: [videoPerformance.videoId],
    references: [videos.id],
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningSessionSchema = createInsertSchema(learningSessions).omit({
  id: true,
  createdAt: true,
});

export const insertScrapedVideoSchema = createInsertSchema(scrapedVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  scrapedAt: true,
});

export const insertVideoAnalyticsSchema = createInsertSchema(videoAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoPerformanceSchema = createInsertSchema(videoPerformance).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = z.infer<typeof insertLearningSessionSchema>;
export type ScrapedVideo = typeof scrapedVideos.$inferSelect;
export type InsertScrapedVideo = z.infer<typeof insertScrapedVideoSchema>;
export type VideoAnalytics = typeof videoAnalytics.$inferSelect;
export type InsertVideoAnalytics = z.infer<typeof insertVideoAnalyticsSchema>;
export type VideoPerformance = typeof videoPerformance.$inferSelect;
export type InsertVideoPerformance = z.infer<typeof insertVideoPerformanceSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
