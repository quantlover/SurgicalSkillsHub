import type { Express } from "express";
import { createServer } from "http";

export function registerSimpleRoutes(app: Express) {
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