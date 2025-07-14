import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Video, 
  MessageSquare, 
  Star, 
  Clock, 
  Target,
  Award,
  Calendar
} from "lucide-react";

interface ProgressTrackingProps {
  progress: any;
  userId?: string;
}

export default function ProgressTracking({ progress, userId }: ProgressTrackingProps) {
  const { data: detailedProgress } = useQuery({
    queryKey: userId ? ["/api/progress", userId] : ["/api/progress"],
    retry: false,
  });

  const currentProgress = progress || detailedProgress;

  if (!currentProgress) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spartan-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading progress data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressStats = [
    {
      label: "Videos Watched",
      value: currentProgress.videosWatched || 0,
      target: 25,
      icon: Video,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Practice Videos",
      value: currentProgress.videosUploaded || 0,
      target: 10,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Feedback Received",
      value: currentProgress.feedbackReceived || 0,
      target: 8,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getSkillLevel = (score: number) => {
    if (score >= 4.5) return { label: "Expert", color: "bg-emerald-500" };
    if (score >= 4.0) return { label: "Advanced", color: "bg-blue-500" };
    if (score >= 3.5) return { label: "Proficient", color: "bg-yellow-500" };
    if (score >= 3.0) return { label: "Intermediate", color: "bg-orange-500" };
    return { label: "Beginner", color: "bg-gray-500" };
  };

  const skillLevel = currentProgress.averageScore 
    ? getSkillLevel(currentProgress.averageScore)
    : { label: "No Data", color: "bg-gray-400" };

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-spartan-green" />
            Learning Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressStats.map((stat) => {
              const Icon = stat.icon;
              const percentage = getProgressPercentage(stat.value, stat.target);
              
              return (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{stat.label}</h3>
                      <p className="text-sm text-gray-600">
                        {stat.value} / {stat.target}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-spartan-green" />
              Current Skill Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full ${skillLevel.color} flex items-center justify-center`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{skillLevel.label}</h3>
                {currentProgress.averageScore && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(currentProgress.averageScore)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {currentProgress.averageScore.toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {!currentProgress.averageScore && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Complete practice videos and receive feedback to see your skill level.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-spartan-green" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentProgress.lastActivityAt ? (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Active</p>
                    <p className="text-xs text-gray-600">
                      {new Date(currentProgress.lastActivityAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">No Recent Activity</p>
                    <p className="text-xs text-gray-600">Start watching videos to track progress</p>
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Created</span>
                  <span className="font-medium">
                    {new Date(currentProgress.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-spartan-green" />
            Learning Goals & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Learning Goals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Video Mastery</span>
                </div>
                <p className="text-xs text-blue-800">
                  Watch all reference videos to build foundational knowledge
                </p>
                <div className="mt-2">
                  <Badge variant={currentProgress.videosWatched >= 25 ? "default" : "secondary"}>
                    {currentProgress.videosWatched >= 25 ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Practice Excellence</span>
                </div>
                <p className="text-xs text-green-800">
                  Upload practice videos to demonstrate your skills
                </p>
                <div className="mt-2">
                  <Badge variant={currentProgress.videosUploaded >= 10 ? "default" : "secondary"}>
                    {currentProgress.videosUploaded >= 10 ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Skill Development</span>
                </div>
                <p className="text-xs text-purple-800">
                  Achieve consistent high scores through expert feedback
                </p>
                <div className="mt-2">
                  <Badge variant={currentProgress.averageScore >= 4.0 ? "default" : "secondary"}>
                    {currentProgress.averageScore >= 4.0 ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Recommended Next Steps</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {currentProgress.videosWatched < 5 && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-spartan-green rounded-full"></div>
                    <span>Start with basic suturing technique videos</span>
                  </li>
                )}
                {currentProgress.videosWatched >= 5 && currentProgress.videosUploaded === 0 && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-spartan-green rounded-full"></div>
                    <span>Upload your first practice video for feedback</span>
                  </li>
                )}
                {currentProgress.videosUploaded > 0 && currentProgress.feedbackReceived === 0 && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-spartan-green rounded-full"></div>
                    <span>Wait for evaluator feedback on your submissions</span>
                  </li>
                )}
                {currentProgress.averageScore > 0 && currentProgress.averageScore < 4.0 && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-spartan-green rounded-full"></div>
                    <span>Focus on areas highlighted in your feedback</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
