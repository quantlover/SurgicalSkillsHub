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
  ExternalLink
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

  // Get scraping status
  const { data: scrapingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/scrape/status'],
    retry: false
  });

  // Comprehensive scraping mutation
  const allPlatformsScrapeMutation = useMutation({
    mutationFn: async () => {
      // Simulate progress updates
      const updateProgress = setInterval(() => {
        setScrapingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      try {
        const result = await apiRequest('/api/scrape/all', {
          method: 'POST',
          body: JSON.stringify({})
        });
        clearInterval(updateProgress);
        setScrapingProgress(100);
        return result;
      } catch (error) {
        clearInterval(updateProgress);
        throw error;
      }
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
                    
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      Videos have been successfully added to the library and are available for learners
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

            {/* Supported Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Featured Medical Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {presetChannels.map((channel, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Youtube className="h-3 w-3 text-blue-600" />
                      <span>{channel.name}</span>
                    </div>
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
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Play className="mr-2 h-4 w-4" />
                  View Video Library
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit SURGhub
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}