import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import VideoPlayer from "@/components/video-player";
import FeedbackRubric from "@/components/feedback-rubric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, User, Star, MessageSquare, History } from "lucide-react";

export default function EvaluatorDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: pendingVideos, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/feedback/pending"],
    retry: false,
  });

  const { data: feedbackHistory } = useQuery({
    queryKey: ["/api/feedback", { evaluatorId: "current" }],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spartan-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="evaluator" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Pending Reviews</CardTitle>
                <Badge variant="secondary" className="bg-warning-orange text-white">
                  {pendingVideos?.length || 0} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spartan-green mx-auto"></div>
                  </div>
                ) : pendingVideos?.length ? (
                  pendingVideos.map((video: any) => (
                    <div
                      key={video.id}
                      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedVideo?.id === video.id ? "border-spartan-green bg-green-50" : ""
                      }`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{video.title}</h3>
                          <p className="text-sm text-gray-600">
                            Submitted {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">New</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            Duration: {Math.floor((video.duration || 0) / 60)}:
                            {String((video.duration || 0) % 60).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="w-4 h-4 mr-1" />
                          <span>Category: {video.suturingType || "General"}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-spartan-green hover:bg-deep-green text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideo(video);
                          }}
                        >
                          Review Video
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle skip functionality
                          }}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending reviews</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {selectedVideo ? "Provide Feedback" : "Select Video to Review"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVideo ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <VideoPlayer video={selectedVideo} />
                  </div>

                  {/* Feedback Form */}
                  <FeedbackRubric
                    videoId={selectedVideo.id}
                    learnerId={selectedVideo.uploaderId}
                    onFeedbackSubmitted={(feedback) => {
                      toast({
                        title: "Success",
                        description: "Feedback submitted successfully!",
                      });
                      setSelectedVideo(null);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select a video from the pending reviews to provide feedback
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <History className="w-5 h-5 mr-2" />
              Feedback History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackHistory?.length ? (
                feedbackHistory.map((feedback: any) => (
                  <div key={feedback.id} className="border-l-4 border-spartan-green pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        Video Review #{feedback.id.slice(-6)}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {feedback.textFeedback || feedback.voiceTranscription}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (feedback.overallScore || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        Score: {feedback.overallScore}/5
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        Learner ID: {feedback.learnerId.slice(-6)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No feedback history yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
