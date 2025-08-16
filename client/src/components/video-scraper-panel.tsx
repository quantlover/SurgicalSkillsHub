import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Database
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

export default function VideoScraperPanel() {
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

  // YouTube scraping mutation
  const youtubeScrapeMutation = useMutation({
    mutationFn: async (data: { channelId: string; maxVideos: number }) => {
      return await apiRequest('/api/scrape/youtube', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setLastScrapingResult(data);
      toast({
        title: "YouTube Scraping Complete",
        description: `Successfully scraped ${data.count} videos from YouTube`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "YouTube Scraping Failed",
        description: error.message || "Failed to scrape YouTube channel",
        variant: "destructive"
      });
    }
  });

  // SURGhub scraping mutation
  const surghubScrapeMutation = useMutation({
    mutationFn: async (data: { maxVideos: number }) => {
      return await apiRequest('/api/scrape/surghub', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setLastScrapingResult(data);
      toast({
        title: "SURGhub Scraping Complete",
        description: `Successfully scraped ${data.count} videos from SURGhub`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "SURGhub Scraping Failed",
        description: error.message || "Failed to scrape SURGhub",
        variant: "destructive"
      });
    }
  });

  // MEDtube scraping mutation
  const medtubeScrapeMutation = useMutation({
    mutationFn: async (data: { maxVideos: number }) => {
      return await apiRequest('/api/scrape/medtube', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setLastScrapingResult(data);
      toast({
        title: "MEDtube Scraping Complete",
        description: `Successfully scraped ${data.count} videos from MEDtube`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "MEDtube Scraping Failed",
        description: error.message || "Failed to scrape MEDtube",
        variant: "destructive"
      });
    }
  });

  // Comprehensive scraping mutation
  const allPlatformsScrapeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/scrape/all', {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      setLastScrapingResult(data);
      toast({
        title: "Comprehensive Scraping Complete",
        description: `Successfully scraped ${data.count} videos from all platforms`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Comprehensive Scraping Failed",
        description: error.message || "Failed to scrape all platforms",
        variant: "destructive"
      });
    }
  });

  const handleScraping = () => {
    setScrapingProgress(0);
    setLastScrapingResult(null);

    switch (selectedPlatform) {
      case 'youtube':
        if (!youtubeChannelId.trim()) {
          toast({
            title: "Missing Channel ID",
            description: "Please enter a YouTube channel ID",
            variant: "destructive"
          });
          return;
        }
        youtubeScrapeMutation.mutate({ channelId: youtubeChannelId, maxVideos });
        break;
      case 'surghub':
        surghubScrapeMutation.mutate({ maxVideos });
        break;
      case 'medtube':
        medtubeScrapeMutation.mutate({ maxVideos });
        break;
      case 'all':
      default:
        allPlatformsScrapeMutation.mutate();
        break;
    }
  };

  const isAnyScrapingInProgress = 
    youtubeScrapeMutation.isPending || 
    surghubScrapeMutation.isPending || 
    medtubeScrapeMutation.isPending || 
    allPlatformsScrapeMutation.isPending;

  // Preset YouTube channels for medical education
  const presetChannels = [
    { id: 'UCbx7vOmIKJJUrBWGHMSFsWA', name: 'Medical Creations' },
    { id: 'UCqJ-Xo29CKyLTjn6z2XwYAw', name: 'Armando Hasudungan' },
    { id: 'UCG5akm13dt-hhNnqIFoOmMA', name: 'MedCram' },
    { id: 'UCqgLOGYh4_tH_iIkO9rJ4Zw', name: 'Osmosis' },
    { id: 'UCklOFIqjDk7bCvU3rJxgwJw', name: 'The Suture Buddy' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Video Scraping Control Panel
          </CardTitle>
          <CardDescription>
            Scrape educational videos from medical platforms including YouTube, SURGhub, and MEDtube
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Source Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform to scrape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    All Platforms (Comprehensive)
                  </div>
                </SelectItem>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube Medical Channels
                  </div>
                </SelectItem>
                <SelectItem value="surghub">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    SURGhub (UN Global Surgery)
                  </div>
                </SelectItem>
                <SelectItem value="medtube">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    MEDtube Professional Network
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* YouTube-specific controls */}
          {selectedPlatform === 'youtube' && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="channelId">YouTube Channel ID</Label>
                <Input
                  id="channelId"
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  placeholder="e.g., UCbx7vOmIKJJUrBWGHMSFsWA"
                />
              </div>
              
              {/* Preset channels */}
              <div className="space-y-2">
                <Label>Quick Select Medical Channels:</Label>
                <div className="flex flex-wrap gap-2">
                  {presetChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setYoutubeChannelId(channel.id)}
                      className="text-xs"
                    >
                      {channel.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Max videos control */}
          <div className="space-y-2">
            <Label htmlFor="maxVideos">Maximum Videos to Scrape</Label>
            <Select value={maxVideos.toString()} onValueChange={(value) => setMaxVideos(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 videos</SelectItem>
                <SelectItem value="10">10 videos</SelectItem>
                <SelectItem value="20">20 videos</SelectItem>
                <SelectItem value="50">50 videos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scraping progress */}
          {isAnyScrapingInProgress && (
            <div className="space-y-2">
              <Label>Scraping Progress</Label>
              <Progress value={scrapingProgress} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Scraping in progress... This may take several minutes.
              </div>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={handleScraping}
            disabled={isAnyScrapingInProgress}
            className="w-full"
            size="lg"
          >
            {isAnyScrapingInProgress ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Scraping {selectedPlatform === 'all' ? 'All Platforms' : selectedPlatform.toUpperCase()}...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Scraping {selectedPlatform === 'all' ? 'All Platforms' : selectedPlatform.toUpperCase()}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Scraping Status */}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="default" className="mb-2">
                    <Youtube className="mr-1 h-3 w-3" />
                    YouTube
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {scrapingStatus.platforms?.youtube || 'Available'}
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="default" className="mb-2">
                    <Video className="mr-1 h-3 w-3" />
                    SURGhub
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {scrapingStatus.platforms?.surghub || 'Available'}
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="default" className="mb-2">
                    <Database className="mr-1 h-3 w-3" />
                    MEDtube
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {scrapingStatus.platforms?.medtube || 'Available'}
                  </div>
                </div>
              </div>
              
              {scrapingStatus.supportedChannels && (
                <div>
                  <Label className="text-sm font-medium">Supported YouTube Channels:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scrapingStatus.supportedChannels.map((channel: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Unable to load platform status
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Scraping Results */}
      {lastScrapingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Last Scraping Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Videos Scraped:</span>
                <Badge variant="default">{lastScrapingResult.count}</Badge>
              </div>
              
              {lastScrapingResult.platforms && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Platform Breakdown:</Label>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>YouTube:</span>
                      <span>{lastScrapingResult.platforms.youtube}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SURGhub:</span>
                      <span>{lastScrapingResult.platforms.surghub}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MEDtube:</span>
                      <span>{lastScrapingResult.platforms.medtube}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                Scraped videos have been added to the video library and are available for learners and evaluators.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}