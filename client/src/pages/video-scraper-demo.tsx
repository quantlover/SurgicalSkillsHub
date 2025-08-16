import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Play, 
  Search, 
  Globe, 
  Youtube, 
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Zap,
  ExternalLink,
  BarChart3
} from "lucide-react";

interface ScrapingResult {
  success: boolean;
  count: number;
  videos: any[];
  platforms?: {
    youtube: number;
    surghub: number;
    medtube: number;
  };
}

export default function VideoScraperDemo() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [youtubeChannelId, setYoutubeChannelId] = useState<string>('');
  const [maxVideos, setMaxVideos] = useState<number>(10);
  const [scrapingProgress, setScrapingProgress] = useState<number>(0);
  const [lastScrapingResult, setLastScrapingResult] = useState<ScrapingResult | null>(null);

  // Mock scraping status for demo
  const scrapingStatus = {
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
  };
  const statusLoading = false;

  // Comprehensive scraping mutation with demo data
  const allPlatformsScrapeMutation = useMutation({
    mutationFn: async () => {
      // Simulate progress updates
      const updateProgress = setInterval(() => {
        setScrapingProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      // Simulate realistic scraping delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      clearInterval(updateProgress);
      setScrapingProgress(100);

      // Store scraped videos in database for admin review
      const scrapedVideosToStore = [
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

      // Store scraped videos for admin review (demo simulation)
      console.log('Storing', scrapedVideosToStore.length, 'videos for admin review');
      // In production, these would be stored in the database for admin approval

      const demoResult = {
        success: true,
        count: scrapedVideosToStore.length,
        videos: scrapedVideosToStore,
        platforms: {
          youtube: scrapedVideosToStore.filter(v => v.platform === 'YouTube').length,
          surghub: scrapedVideosToStore.filter(v => v.platform === 'SURGhub').length,
          medtube: scrapedVideosToStore.filter(v => v.platform === 'MEDtube').length
        },
        message: 'Videos discovered and queued for admin review'
      };

      return demoResult;
    },
    onSuccess: (data) => {
      setLastScrapingResult(data);
      toast({
        title: "Video Scraping Complete!",
        description: `Successfully scraped ${data.count} videos from medical education platforms`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setTimeout(() => setScrapingProgress(0), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape video platforms",
        variant: "destructive"
      });
      setScrapingProgress(0);
    }
  });

  const handleComprehensiveScraping = () => {
    setScrapingProgress(0);
    setLastScrapingResult(null);
    allPlatformsScrapeMutation.mutate();
  };

  // Individual channel scraping mutation
  const channelScrapeMutation = useMutation({
    mutationFn: async (channelName: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const channelVideos = {
        success: true,
        count: 3,
        videos: [
          {
            id: `channel-${channelName}-1`,
            title: `${channelName}: Suturing Fundamentals`,
            description: `Essential suturing techniques from ${channelName}`,
            duration: 600,
            platform: 'YouTube',
            instructor: channelName
          },
          {
            id: `channel-${channelName}-2`,
            title: `${channelName}: Advanced Techniques`,
            description: `Advanced surgical techniques from ${channelName}`,
            duration: 900,
            platform: 'YouTube',
            instructor: channelName
          },
          {
            id: `channel-${channelName}-3`,
            title: `${channelName}: Clinical Applications`,
            description: `Real-world applications from ${channelName}`,
            duration: 720,
            platform: 'YouTube',
            instructor: channelName
          }
        ],
        platforms: { youtube: 3, surghub: 0, medtube: 0 }
      };

      return channelVideos;
    },
    onSuccess: (data, channelName) => {
      setLastScrapingResult(data);
      toast({
        title: "Channel Scraping Complete!",
        description: `Successfully scraped ${data.count} videos from ${channelName}`,
        variant: "default"
      });
    },
    onError: (error: any, channelName) => {
      toast({
        title: "Channel Scraping Failed",
        description: `Failed to scrape videos from ${channelName}`,
        variant: "destructive"
      });
    }
  });

  const handleChannelScrape = (channelName: string) => {
    setLastScrapingResult(null);
    channelScrapeMutation.mutate(channelName);
  };

  const handleQuickLinkAction = (action: string) => {
    switch (action) {
      case 'video-library':
        toast({
          title: "Video Library",
          description: "Redirecting to main video library...",
          variant: "default"
        });
        // In a real app, this would navigate to the video library
        break;
      case 'surghub':
        window.open('https://www.surghub.org', '_blank');
        toast({
          title: "External Link",
          description: "Opening SURGhub in a new tab",
          variant: "default"
        });
        break;
      case 'admin-dashboard':
        window.location.href = '/admin/video-review';
        break;
      case 'video-review':
        window.location.href = '/admin/video-review';
        break;
      default:
        break;
    }
  };

  // Preset YouTube channels for medical education
  const presetChannels = [
    { id: 'UCbx7vOmIKJJUrBWGHMSFsWA', name: 'Medical Creations' },
    { id: 'UCqJ-Xo29CKyLTjn6z2XwYAw', name: 'Armando Hasudungan' },
    { id: 'UCG5akm13dt-hhNnqIFoOmMA', name: 'MedCram' },
    { id: 'UCqgLOGYh4_tH_iIkO9rJ4Zw', name: 'Osmosis' },
    { id: 'UCklOFIqjDk7bCvU3rJxgwJw', name: 'The Suture Buddy' }
  ];

  const isScrapingInProgress = allPlatformsScrapeMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Medical Video Scraper</h1>
            <p className="text-gray-600 mt-2">
              Automatically discover and import educational videos from top medical platforms
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Scraping Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-spartan-green" />
                  Quick Start: Comprehensive Medical Video Scraping
                </CardTitle>
                <CardDescription>
                  One-click solution to scrape high-quality suturing and surgical videos from multiple platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Youtube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-blue-900">YouTube</div>
                    <div className="text-sm text-blue-600">Medical Channels</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Video className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-900">SURGhub</div>
                    <div className="text-sm text-green-600">UN Global Surgery</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-purple-900">MEDtube</div>
                    <div className="text-sm text-purple-600">Professional Network</div>
                  </div>
                </div>

                {/* Scraping Progress */}
                {isScrapingInProgress && (
                  <div className="space-y-3">
                    <Label>Scraping Progress</Label>
                    <Progress value={scrapingProgress} className="w-full" />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Discovering videos from medical education platforms...
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={handleComprehensiveScraping}
                  disabled={isScrapingInProgress}
                  className="w-full bg-spartan-green hover:bg-spartan-green/90"
                  size="lg"
                >
                  {isScrapingInProgress ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Scraping Medical Videos...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Start Comprehensive Scraping
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  This will search for suturing, surgical techniques, and medical training videos
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {lastScrapingResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Scraping Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Videos Discovered:</span>
                      <Badge variant="default" className="bg-spartan-green text-white">
                        {lastScrapingResult.count}
                      </Badge>
                    </div>
                    
                    {lastScrapingResult.platforms && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Platform Breakdown:</Label>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>YouTube:</span>
                            <span className="font-medium">{lastScrapingResult.platforms.youtube}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SURGhub:</span>
                            <span className="font-medium">{lastScrapingResult.platforms.surghub}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>MEDtube:</span>
                            <span className="font-medium">{lastScrapingResult.platforms.medtube}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                        <Clock className="h-4 w-4" />
                        Videos have been queued for admin review before being made available to learners
                      </div>
                      <div className="text-xs text-gray-600 pl-6">
                        Admin can approve/reject these videos from the admin dashboard
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Platform Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusLoading ? (
                  <div className="text-center py-4">Loading platform status...</div>
                ) : scrapingStatus ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">YouTube</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {scrapingStatus.platforms?.youtube || 'Ready'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-green-600" />
                          <span className="text-sm">SURGhub</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {scrapingStatus.platforms?.surghub || 'Ready'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">MEDtube</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {scrapingStatus.platforms?.medtube || 'Ready'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Unable to load platform status
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Medical Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Featured Medical Channels</CardTitle>
                <CardDescription className="text-xs">
                  Click to scrape videos from individual channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {presetChannels.map((channel, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => handleChannelScrape(channel.name)}
                      disabled={channelScrapeMutation.isPending}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Youtube className="h-3 w-3 text-blue-600" />
                        <span>{channel.name}</span>
                        {channelScrapeMutation.isPending ? (
                          <Clock className="h-3 w-3 animate-spin ml-auto" />
                        ) : (
                          <Download className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  These channels specialize in suturing techniques, surgical training, and medical education.
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Links</CardTitle>
                <CardDescription className="text-xs">
                  Navigate to related sections and external resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleQuickLinkAction('video-library')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  View Video Library
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleQuickLinkAction('surghub')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit SURGhub
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleQuickLinkAction('video-review')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Review Scraped Videos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleQuickLinkAction('admin-dashboard')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/analytics'}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Video Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}