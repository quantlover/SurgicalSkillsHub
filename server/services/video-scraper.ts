import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export interface ScrapedVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  sourceUrl: string;
  platform: string;
  category: 'reference' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  instructor?: string;
  institution?: string;
  datePublished?: Date;
}

export class VideoScraperService {
  private uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Scrape videos from YouTube medical education channels
   */
  async scrapeYouTubeChannel(channelId: string, maxVideos: number = 10): Promise<ScrapedVideo[]> {
    const videos: ScrapedVideo[] = [];
    
    try {
      // Get channel videos using puppeteer
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      await page.goto(`https://www.youtube.com/channel/${channelId}/videos`, {
        waitUntil: 'networkidle2'
      });

      // Wait for videos to load
      await page.waitForSelector('ytd-rich-item-renderer', { timeout: 10000 });

      // Extract video links
      const videoLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('ytd-rich-item-renderer a#video-title-link'));
        return links.slice(0, 10).map(link => ({
          url: (link as HTMLAnchorElement).href,
          title: (link as HTMLAnchorElement).textContent?.trim() || ''
        }));
      });

      await browser.close();

      // Process each video
      for (const link of videoLinks.slice(0, maxVideos)) {
        try {
          const videoInfo = await this.getYouTubeVideoInfo(link.url);
          if (videoInfo) {
            videos.push(videoInfo);
          }
        } catch (error) {
          console.warn(`Failed to process video ${link.url}:`, error);
        }
      }

    } catch (error) {
      console.error('Error scraping YouTube channel:', error);
    }

    return videos;
  }

  /**
   * Get detailed information about a YouTube video using web scraping
   */
  private async getYouTubeVideoInfo(videoUrl: string): Promise<ScrapedVideo | null> {
    try {
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (!videoId) return null;

      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      await page.goto(videoUrl, { waitUntil: 'networkidle2' });
      
      // Extract video information from the page
      const videoInfo = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string');
        const descriptionElement = document.querySelector('#description yt-formatted-string');
        const channelElement = document.querySelector('ytd-channel-name yt-formatted-string');
        const durationElement = document.querySelector('.ytp-time-duration');
        
        return {
          title: titleElement?.textContent?.trim() || '',
          description: descriptionElement?.textContent?.trim() || '',
          channel: channelElement?.textContent?.trim() || '',
          duration: durationElement?.textContent?.trim() || '0:00'
        };
      });

      await browser.close();

      // Parse duration to seconds
      const durationParts = videoInfo.duration.split(':').map(Number);
      const duration = durationParts.length === 2 ? 
        durationParts[0] * 60 + durationParts[1] : 
        durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];

      const video: ScrapedVideo = {
        id: nanoid(),
        title: videoInfo.title,
        description: videoInfo.description,
        duration: duration || 300, // Default 5 minutes if parsing fails
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoUrl: videoUrl, // Store YouTube URL for embedding
        sourceUrl: videoUrl,
        platform: 'YouTube',
        category: this.categorizeVideo(videoInfo.title, videoInfo.description),
        difficulty: this.assessDifficulty(videoInfo.title, videoInfo.description),
        tags: this.extractTags(videoInfo.title, videoInfo.description),
        instructor: videoInfo.channel,
        datePublished: new Date()
      };

      return video;
    } catch (error) {
      console.error('Error getting YouTube video info:', error);
      return null;
    }
  }

  /**
   * Scrape videos from SURGhub (UN Global Surgery Learning Hub)
   */
  async scrapeSURGhub(maxVideos: number = 10): Promise<ScrapedVideo[]> {
    const videos: ScrapedVideo[] = [];
    
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      // Navigate to SURGhub suture courses
      await page.goto('https://www.surghub.org/courses', {
        waitUntil: 'networkidle2'
      });

      // Search for suture-related courses
      await page.waitForSelector('input[type="search"]', { timeout: 10000 });
      await page.type('input[type="search"]', 'suture');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(3000);

      // Extract course information
      const courses = await page.evaluate(() => {
        const courseElements = Array.from(document.querySelectorAll('.course-card, .course-item'));
        return courseElements.slice(0, 10).map(element => {
          const titleElement = element.querySelector('h3, .course-title, .title');
          const linkElement = element.querySelector('a');
          const descElement = element.querySelector('.description, .course-description');
          
          return {
            title: titleElement?.textContent?.trim() || '',
            url: linkElement?.getAttribute('href') || '',
            description: descElement?.textContent?.trim() || ''
          };
        });
      });

      await browser.close();

      // Process each course
      for (const course of courses.slice(0, maxVideos)) {
        if (course.url && course.title) {
          const video: ScrapedVideo = {
            id: nanoid(),
            title: course.title,
            description: course.description,
            duration: 0, // Will be updated when video is processed
            thumbnailUrl: '', // Will be extracted from course page
            videoUrl: course.url.startsWith('http') ? course.url : `https://www.surghub.org${course.url}`,
            sourceUrl: course.url.startsWith('http') ? course.url : `https://www.surghub.org${course.url}`,
            platform: 'SURGhub',
            category: 'reference',
            difficulty: this.assessDifficulty(course.title, course.description),
            tags: this.extractTags(course.title, course.description),
            institution: 'UN Global Surgery Learning Hub'
          };
          
          videos.push(video);
        }
      }

    } catch (error) {
      console.error('Error scraping SURGhub:', error);
    }

    return videos;
  }

  /**
   * Scrape videos from MEDtube.net
   */
  async scrapeMEDtube(maxVideos: number = 10): Promise<ScrapedVideo[]> {
    const videos: ScrapedVideo[] = [];
    
    try {
      // Note: MEDtube requires professional verification, so we'll scrape public listings
      const response = await fetch('https://medtube.net/search?q=suture&type=video', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $('.video-item, .search-result').slice(0, maxVideos).each((index, element) => {
        const $el = $(element);
        const title = $el.find('.title, .video-title, h3').text().trim();
        const description = $el.find('.description, .excerpt').text().trim();
        const thumbnailUrl = $el.find('img').attr('src') || '';
        const videoUrl = $el.find('a').attr('href') || '';

        if (title && videoUrl) {
          const video: ScrapedVideo = {
            id: nanoid(),
            title,
            description,
            duration: 0,
            thumbnailUrl: thumbnailUrl.startsWith('http') ? thumbnailUrl : `https://medtube.net${thumbnailUrl}`,
            videoUrl: videoUrl.startsWith('http') ? videoUrl : `https://medtube.net${videoUrl}`,
            sourceUrl: videoUrl.startsWith('http') ? videoUrl : `https://medtube.net${videoUrl}`,
            platform: 'MEDtube',
            category: 'reference',
            difficulty: this.assessDifficulty(title, description),
            tags: this.extractTags(title, description),
            institution: 'MEDtube Professional Network'
          };
          
          videos.push(video);
        }
      });

    } catch (error) {
      console.error('Error scraping MEDtube:', error);
    }

    return videos;
  }

  /**
   * Get videos from predefined high-quality YouTube medical channels
   */
  async scrapePresetMedicalChannels(): Promise<ScrapedVideo[]> {
    const medicalChannels = [
      'UCbx7vOmIKJJUrBWGHMSFsWA', // Medical Creations
      'UCqJ-Xo29CKyLTjn6z2XwYAw', // Armando Hasudungan  
      'UCG5akm13dt-hhNnqIFoOmMA', // MedCram
      'UCqgLOGYh4_tH_iIkO9rJ4Zw', // Osmosis
      'UCklOFIqjDk7bCvU3rJxgwJw'  // The Suture Buddy
    ];

    const allVideos: ScrapedVideo[] = [];

    for (const channelId of medicalChannels) {
      try {
        const videos = await this.scrapeYouTubeChannel(channelId, 5);
        allVideos.push(...videos);
      } catch (error) {
        console.warn(`Failed to scrape channel ${channelId}:`, error);
      }
    }

    return allVideos;
  }

  /**
   * Scrape all available platforms
   */
  async scrapeAllPlatforms(): Promise<ScrapedVideo[]> {
    console.log('Starting comprehensive video scraping...');
    
    const allVideos: ScrapedVideo[] = [];

    try {
      // Scrape YouTube medical channels
      console.log('Scraping YouTube medical channels...');
      const youtubeVideos = await this.scrapePresetMedicalChannels();
      allVideos.push(...youtubeVideos);
      console.log(`Found ${youtubeVideos.length} YouTube videos`);

      // Scrape SURGhub
      console.log('Scraping SURGhub...');
      const surghubVideos = await this.scrapeSURGhub(10);
      allVideos.push(...surghubVideos);
      console.log(`Found ${surghubVideos.length} SURGhub videos`);

      // Scrape MEDtube
      console.log('Scraping MEDtube...');
      const medtubeVideos = await this.scrapeMEDtube(10);
      allVideos.push(...medtubeVideos);
      console.log(`Found ${medtubeVideos.length} MEDtube videos`);

    } catch (error) {
      console.error('Error in comprehensive scraping:', error);
    }

    console.log(`Total videos scraped: ${allVideos.length}`);
    return allVideos;
  }

  // Helper methods
  private extractYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  private categorizeVideo(title: string, description: string): 'reference' | 'practice' {
    const practiceKeywords = ['practice', 'training', 'exercise', 'hands-on', 'tutorial'];
    const text = (title + ' ' + description).toLowerCase();
    
    return practiceKeywords.some(keyword => text.includes(keyword)) ? 'practice' : 'reference';
  }

  private assessDifficulty(title: string, description: string): 'beginner' | 'intermediate' | 'advanced' {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('basic') || text.includes('beginner') || text.includes('introduction')) {
      return 'beginner';
    } else if (text.includes('advanced') || text.includes('complex') || text.includes('expert')) {
      return 'advanced';
    }
    
    return 'intermediate';
  }

  private extractTags(title: string, description: string): string[] {
    const text = (title + ' ' + description).toLowerCase();
    const medicalTags = [
      'suturing', 'suture', 'stitching', 'wound closure', 'surgical technique',
      'knot tying', 'interrupted suture', 'continuous suture', 'mattress suture',
      'subcuticular', 'instrument handling', 'medical training', 'surgery',
      'plastic surgery', 'general surgery', 'emergency medicine'
    ];
    
    return medicalTags.filter(tag => text.includes(tag));
  }
}