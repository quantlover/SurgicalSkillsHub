import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { nanoid } from 'nanoid';
import { ScrapedVideo } from './video-scraper.js';

export interface ProcessedVideo {
  id: string;
  originalId: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  filePath: string;
  fileSize: number;
  format: string;
  resolution: string;
  platform: string;
  category: 'reference' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  instructor?: string;
  institution?: string;
  dateProcessed: Date;
  sourceUrl: string;
}

export class VideoProcessorService {
  private uploadsDir = path.join(process.cwd(), 'uploads');
  private thumbnailsDir = path.join(this.uploadsDir, 'thumbnails');

  constructor() {
    // Ensure directories exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.thumbnailsDir)) {
      fs.mkdirSync(this.thumbnailsDir, { recursive: true });
    }
  }

  /**
   * Process a scraped video - download, convert, extract metadata
   */
  async processVideo(scrapedVideo: ScrapedVideo): Promise<ProcessedVideo | null> {
    try {
      console.log(`Processing video: ${scrapedVideo.title}`);

      // Download thumbnail
      const thumbnailPath = await this.downloadThumbnail(scrapedVideo);

      // For YouTube videos, we'll use the stream URL directly
      // For other platforms, we might need different handling
      let filePath: string;
      let fileSize: number;
      let duration: number;
      let resolution: string;

      if (scrapedVideo.platform === 'YouTube') {
        // For YouTube, we store the stream URL and metadata, not the actual file
        filePath = scrapedVideo.videoUrl;
        fileSize = 0; // Unknown for streaming URLs
        duration = scrapedVideo.duration;
        resolution = 'Variable'; // YouTube adaptive streaming
      } else {
        // For other platforms, attempt to download and process
        const downloadResult = await this.downloadAndProcessVideo(scrapedVideo);
        if (!downloadResult) return null;
        
        filePath = downloadResult.filePath;
        fileSize = downloadResult.fileSize;
        duration = downloadResult.duration;
        resolution = downloadResult.resolution;
      }

      const processedVideo: ProcessedVideo = {
        id: nanoid(),
        originalId: scrapedVideo.id,
        title: scrapedVideo.title,
        description: scrapedVideo.description,
        duration,
        thumbnailUrl: thumbnailPath || scrapedVideo.thumbnailUrl,
        filePath,
        fileSize,
        format: scrapedVideo.platform === 'YouTube' ? 'stream' : 'mp4',
        resolution,
        platform: scrapedVideo.platform,
        category: scrapedVideo.category,
        difficulty: scrapedVideo.difficulty,
        tags: scrapedVideo.tags,
        instructor: scrapedVideo.instructor,
        institution: scrapedVideo.institution,
        dateProcessed: new Date(),
        sourceUrl: scrapedVideo.sourceUrl
      };

      console.log(`Successfully processed: ${processedVideo.title}`);
      return processedVideo;

    } catch (error) {
      console.error(`Error processing video ${scrapedVideo.title}:`, error);
      return null;
    }
  }

  /**
   * Download thumbnail image
   */
  private async downloadThumbnail(scrapedVideo: ScrapedVideo): Promise<string | null> {
    if (!scrapedVideo.thumbnailUrl) return null;

    try {
      const response = await fetch(scrapedVideo.thumbnailUrl);
      if (!response.ok) return null;

      const buffer = await response.buffer();
      const extension = this.getImageExtension(scrapedVideo.thumbnailUrl);
      const filename = `${nanoid()}.${extension}`;
      const thumbnailPath = path.join(this.thumbnailsDir, filename);

      fs.writeFileSync(thumbnailPath, buffer);
      return `/uploads/thumbnails/${filename}`;

    } catch (error) {
      console.warn(`Failed to download thumbnail for ${scrapedVideo.title}:`, error);
      return null;
    }
  }

  /**
   * Download and process video file (for non-YouTube sources)
   */
  private async downloadAndProcessVideo(scrapedVideo: ScrapedVideo): Promise<{
    filePath: string;
    fileSize: number;
    duration: number;
    resolution: string;
  } | null> {
    // This is a placeholder for actual video download and processing
    // In a real implementation, you would:
    // 1. Download the video file
    // 2. Convert it to a standard format (MP4)
    // 3. Extract metadata (duration, resolution)
    // 4. Optimize for web streaming

    console.log(`Video download not implemented for platform: ${scrapedVideo.platform}`);
    
    // Return placeholder data for demo
    return {
      filePath: scrapedVideo.videoUrl,
      fileSize: 0,
      duration: scrapedVideo.duration || 300, // 5 minutes default
      resolution: '720p'
    };
  }

  /**
   * Extract video metadata using basic file operations
   */
  private async extractVideoMetadata(filePath: string): Promise<{
    duration: number;
    resolution: string;
    format: string;
    fileSize: number;
  }> {
    try {
      const stats = fs.statSync(filePath);
      return {
        duration: 300, // Default duration
        resolution: '720p',
        format: 'mp4',
        fileSize: stats.size
      };
    } catch (error) {
      return {
        duration: 300,
        resolution: '720p',
        format: 'mp4',
        fileSize: 0
      };
    }
  }

  /**
   * Generate basic thumbnail placeholder
   */
  private async generateThumbnail(videoPath: string): Promise<string> {
    // For now, return a placeholder path
    // In a full implementation, you would use ffmpeg or similar
    return '/uploads/thumbnails/placeholder.jpg';
  }

  /**
   * Placeholder for video optimization
   */
  private async optimizeVideoForWeb(inputPath: string): Promise<string> {
    // For now, return the input path
    // In a full implementation, you would convert the video
    return inputPath;
  }

  /**
   * Process multiple videos in batch
   */
  async processVideoBatch(scrapedVideos: ScrapedVideo[]): Promise<ProcessedVideo[]> {
    const processedVideos: ProcessedVideo[] = [];
    const maxConcurrent = 3; // Process 3 videos at a time

    for (let i = 0; i < scrapedVideos.length; i += maxConcurrent) {
      const batch = scrapedVideos.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(video => this.processVideo(video));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          processedVideos.push(result.value);
        } else {
          console.error(`Failed to process video ${batch[index].title}:`, result.status === 'rejected' ? result.reason : 'Unknown error');
        }
      });

      // Add delay between batches to avoid overwhelming the system
      if (i + maxConcurrent < scrapedVideos.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return processedVideos;
  }

  // Helper methods
  private getImageExtension(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }

  /**
   * Clean up old processed files
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const directories = [this.uploadsDir, this.thumbnailsDir];

    for (const dir of directories) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    }
  }
}