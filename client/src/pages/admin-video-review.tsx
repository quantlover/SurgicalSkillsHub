import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { 
  CheckCircle, 
  X, 
  Clock, 
  Video, 
  Youtube, 
  Database,
  ExternalLink,
  Eye,
  MessageSquare
} from "lucide-react";

interface PendingVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  platform: string;
  instructor?: string;
  institution?: string;
  scrapedAt: string;
  videoUrl: string;
  sourceUrl: string;
}

export default function AdminVideoReview() {
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<PendingVideo | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processingReview, setProcessingReview] = useState(false);

  // Demo data - in production this would come from the database
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([
    {
      id: "1",
      title: "Basic Suturing Techniques for Medical Students",
      description: "Learn fundamental suturing techniques including simple interrupted, running, and mattress sutures.",
      duration: 720,
      platform: "YouTube",
      instructor: "Medical Creations",
      scrapedAt: "2024-08-16T10:30:00Z",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      sourceUrl: "https://www.youtube.com/watch?v=example1"
    },
    {
      id: "2", 
      title: "Advanced Surgical Knot Tying",
      description: "Master advanced knot tying techniques for surgical procedures.",
      duration: 900,
      platform: "YouTube",
      instructor: "Armando Hasudungan",
      scrapedAt: "2024-08-16T10:31:00Z",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      sourceUrl: "https://www.youtube.com/watch?v=example2"
    },
    {
      id: "3",
      title: "Global Surgery Training: Suturing in Resource-Limited Settings",
      description: "Effective suturing techniques adapted for resource-limited surgical environments.",
      duration: 1200,
      platform: "SURGhub",
      institution: "UN Global Surgery Learning Hub",
      scrapedAt: "2024-08-16T10:32:00Z",
      videoUrl: "https://www.surghub.org/course/suturing-techniques",
      sourceUrl: "https://www.surghub.org/course/suturing-techniques"
    },
    {
      id: "4",
      title: "Plastic Surgery Suturing Techniques",
      description: "Aesthetic and functional suturing techniques for plastic surgery procedures.",
      duration: 1440,
      platform: "MEDtube",
      institution: "MEDtube Professional Network",
      scrapedAt: "2024-08-16T10:33:00Z",
      videoUrl: "https://medtube.net/video/plastic-surgery-suturing",
      sourceUrl: "https://medtube.net/video/plastic-surgery-suturing"
    }
  ]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return <Youtube className="h-4 w-4 text-blue-600" />;
      case 'SURGhub':
        return <Video className="h-4 w-4 text-green-600" />;
      case 'MEDtube':
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!selectedVideo) return;

    setProcessingReview(true);

    // Simulate review processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove from pending list
    setPendingVideos(videos => videos.filter(v => v.id !== selectedVideo.id));

    toast({
      title: action === 'approve' ? "Video Approved" : "Video Rejected",
      description: action === 'approve' 
        ? `"${selectedVideo.title}" has been approved and added to the student library`
        : `"${selectedVideo.title}" has been rejected and removed from review queue`,
      variant: action === 'approve' ? "default" : "destructive"
    });

    setSelectedVideo(null);
    setReviewNotes("");
    setProcessingReview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Video Review Center</h1>
            <p className="text-gray-600 mt-2">
              Review and approve scraped videos before they become available to students
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {pendingVideos.length} videos pending review
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Videos List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Pending Video Reviews
                </CardTitle>
                <CardDescription>
                  Videos scraped from medical education platforms awaiting approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm">No videos pending review at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingVideos.map((video) => (
                      <div
                        key={video.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedVideo?.id === video.id
                            ? 'border-spartan-green bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedVideo(video)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getPlatformIcon(video.platform)}
                              <h3 className="font-medium text-gray-900">{video.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {formatDuration(video.duration)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {video.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Platform: {video.platform}</span>
                              {video.instructor && <span>By: {video.instructor}</span>}
                              {video.institution && <span>From: {video.institution}</span>}
                              <span>Scraped: {formatDate(video.scrapedAt)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(video.sourceUrl, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {selectedVideo ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review Video
                  </CardTitle>
                  <CardDescription>
                    Evaluate this video for educational quality and appropriateness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{selectedVideo.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedVideo.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform:</span>
                        <span>{selectedVideo.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span>{formatDuration(selectedVideo.duration)}</span>
                      </div>
                      {selectedVideo.instructor && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Instructor:</span>
                          <span>{selectedVideo.instructor}</span>
                        </div>
                      )}
                      {selectedVideo.institution && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Institution:</span>
                          <span>{selectedVideo.institution}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="review-notes" className="text-sm font-medium">
                      Review Notes (Optional)
                    </Label>
                    <Textarea
                      id="review-notes"
                      placeholder="Add any notes about this video's quality, relevance, or concerns..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleReviewAction('approve')}
                      disabled={processingReview}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {processingReview ? 'Processing...' : 'Approve for Students'}
                    </Button>
                    <Button
                      onClick={() => handleReviewAction('reject')}
                      disabled={processingReview}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {processingReview ? 'Processing...' : 'Reject Video'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3" />
                    Click on the external link icon to preview the video
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <Video className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">Select a video to review</p>
                    <p className="text-sm">Choose a video from the list to start the review process</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Approve if:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                    <li>Content is educationally accurate</li>
                    <li>Video quality is clear and audible</li>
                    <li>Demonstrates proper techniques</li>
                    <li>Appropriate for medical students</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Reject if:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
                    <li>Contains medical inaccuracies</li>
                    <li>Poor video/audio quality</li>
                    <li>Inappropriate content</li>
                    <li>Copyright concerns</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}