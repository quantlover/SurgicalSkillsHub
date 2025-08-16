import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import VideoPlayer from "@/components/video-player";
import SubtitlePanel from "@/components/subtitle-panel";
import VoiceFeedback from "@/components/voice-feedback";
import VideoUpload from "@/components/video-upload";
import ProgressTracking from "@/components/progress-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Upload, MessageSquare, TrendingUp, Star, Clock, Tag } from "lucide-react";

export default function LearnerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState("video-library");
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
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos", { category: "reference" }],
    retry: false,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const { data: recentFeedback } = useQuery({
    queryKey: ["/api/feedback"],
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

  const tabs = [
    { id: "video-library", label: "Video Library", icon: Play },
    { id: "upload-videos", label: "Upload Videos", icon: Upload },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="learner" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "text-white bg-spartan-green"
                      : "text-gray-600 hover:text-spartan-green"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 inline" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            {activeTab === "video-library" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {selectedVideo ? selectedVideo.title : "Select a Video to Begin"}
                  </CardTitle>
                  {selectedVideo && (
                    <p className="text-gray-600">
                      Duration: {Math.floor((selectedVideo.duration || 0) / 60)}:
                      {String((selectedVideo.duration || 0) % 60).padStart(2, "0")}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedVideo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <VideoPlayer video={selectedVideo} />
                      <SubtitlePanel 
                        subtitles={selectedVideo.subtitles || []}
                        onTimestampClick={(timestamp) => {
                          // Handle subtitle click to jump to timestamp
                          console.log("Jump to timestamp:", timestamp);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Choose a video from the library to start learning
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "upload-videos" && (
              <VideoUpload onUploadComplete={(video) => {
                toast({
                  title: "Success",
                  description: "Video uploaded successfully!",
                });
              }} />
            )}

            {activeTab === "feedback" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentFeedback?.length ? (
                      recentFeedback.map((feedback: any) => (
                        <div key={feedback.id} className="border-l-4 border-spartan-green pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              Video Feedback #{feedback.id.slice(-6)}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {feedback.textFeedback || feedback.voiceTranscription}
                          </p>
                          <div className="flex items-center space-x-2">
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
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No feedback received yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "progress" && (
              <ProgressTracking progress={userProgress} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Library */}
            {activeTab === "video-library" && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videosLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spartan-green mx-auto"></div>
                      </div>
                    ) : videos?.length ? (
                      videos.map((video: any) => (
                        <div
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedVideo?.id === video.id
                              ? "border-spartan-green bg-green-50"
                              : "border-gray-200 hover:border-spartan-green"
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 mb-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>
                                {Math.floor((video.duration || 0) / 60)}:
                                {String((video.duration || 0) % 60).padStart(2, "0")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              <span>{video.suturingType || "General"}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No videos available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Videos Watched</span>
                    <span className="text-sm font-semibold text-spartan-green">
                      {userProgress?.videosWatched || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Practice Videos</span>
                    <span className="text-sm font-semibold text-spartan-green">
                      {userProgress?.videosUploaded || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Feedback Received</span>
                    <span className="text-sm font-semibold text-spartan-green">
                      {userProgress?.feedbackReceived || 0}
                    </span>
                  </div>
                  {userProgress?.averageScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="text-sm font-semibold text-spartan-green">
                        {userProgress.averageScore.toFixed(1)}/5
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Voice Feedback Tool */}
            <VoiceFeedback />
          </div>
        </div>
      </div>
    </div>
  );
}
