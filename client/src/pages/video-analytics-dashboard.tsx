import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import NavigationHeader from "@/components/navigation-header";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Play,
  SkipForward,
  Users,
  Target,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Download,
  Filter
} from "lucide-react";

interface VideoMetrics {
  id: string;
  title: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  category: string;
  difficulty: string;
}

interface UserEngagement {
  date: string;
  views: number;
  completions: number;
  watchTime: number;
}

interface LearningProgress {
  skill: string;
  progress: number;
  improvement: number;
}

export default function VideoAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('views');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Demo data - in production this would come from the analytics API
  const videoMetrics: VideoMetrics[] = [
    {
      id: '1',
      title: 'Basic Suturing Techniques',
      totalViews: 1247,
      uniqueViewers: 892,
      averageWatchTime: 485,
      completionRate: 78.5,
      engagementScore: 85,
      category: 'Fundamental Skills',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      title: 'Advanced Knot Tying',
      totalViews: 934,
      uniqueViewers: 743,
      averageWatchTime: 632,
      completionRate: 68.2,
      engagementScore: 72,
      category: 'Advanced Techniques',
      difficulty: 'Advanced'
    },
    {
      id: '3',
      title: 'Surgical Instrument Handling',
      totalViews: 1456,
      uniqueViewers: 1098,
      averageWatchTime: 398,
      completionRate: 82.1,
      engagementScore: 88,
      category: 'Fundamental Skills',
      difficulty: 'Intermediate'
    },
    {
      id: '4',
      title: 'Plastic Surgery Suturing',
      totalViews: 567,
      uniqueViewers: 445,
      averageWatchTime: 712,
      completionRate: 58.3,
      engagementScore: 65,
      category: 'Specialized Procedures',
      difficulty: 'Expert'
    }
  ];

  const engagementData: UserEngagement[] = [
    { date: 'Mon', views: 245, completions: 189, watchTime: 12400 },
    { date: 'Tue', views: 298, completions: 234, watchTime: 15600 },
    { date: 'Wed', views: 187, completions: 143, watchTime: 9800 },
    { date: 'Thu', views: 321, completions: 267, watchTime: 18900 },
    { date: 'Fri', views: 276, completions: 198, watchTime: 14200 },
    { date: 'Sat', views: 156, completions: 112, watchTime: 8100 },
    { date: 'Sun', views: 203, completions: 167, watchTime: 11300 }
  ];

  const learningProgress: LearningProgress[] = [
    { skill: 'Basic Suturing', progress: 85, improvement: 12 },
    { skill: 'Knot Tying', progress: 72, improvement: 8 },
    { skill: 'Instrument Handling', progress: 91, improvement: 15 },
    { skill: 'Wound Assessment', progress: 68, improvement: 5 },
    { skill: 'Sterile Technique', progress: 79, improvement: 9 }
  ];

  const categoryDistribution = [
    { name: 'Fundamental Skills', value: 45, color: '#10B981' },
    { name: 'Advanced Techniques', value: 30, color: '#3B82F6' },
    { name: 'Specialized Procedures', value: 20, color: '#8B5CF6' },
    { name: 'Case Studies', value: 5, color: '#F59E0B' }
  ];

  const topPerformingVideos = videoMetrics
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleExportReport = async () => {
    try {
      // Prepare comprehensive report data
      const reportData = {
        generatedAt: new Date().toISOString(),
        timeframe: selectedTimeframe,
        summary: {
          totalViews: videoMetrics.reduce((sum, video) => sum + video.totalViews, 0),
          averageCompletionRate: (videoMetrics.reduce((sum, video) => sum + video.completionRate, 0) / videoMetrics.length).toFixed(1),
          averageWatchTime: Math.round(videoMetrics.reduce((sum, video) => sum + video.averageWatchTime, 0) / videoMetrics.length),
          uniqueLearners: videoMetrics.reduce((sum, video) => sum + video.uniqueViewers, 0)
        },
        videoPerformance: videoMetrics.map(video => ({
          title: video.title,
          category: video.category,
          difficulty: video.difficulty,
          totalViews: video.totalViews,
          uniqueViewers: video.uniqueViewers,
          averageWatchTime: formatDuration(video.averageWatchTime),
          completionRate: `${video.completionRate}%`,
          engagementScore: video.engagementScore
        })),
        engagementTrends: engagementData,
        learningProgress: learningProgress,
        topPerformingVideos: topPerformingVideos.slice(0, 5).map((video, index) => ({
          rank: index + 1,
          title: video.title,
          engagementScore: video.engagementScore,
          views: formatNumber(video.totalViews),
          completionRate: `${video.completionRate}%`
        })),
        insights: [
          {
            type: "Performance",
            message: "Videos in the 'Fundamental Skills' category show 23% higher completion rates than average."
          },
          {
            type: "Optimization",
            message: "Videos between 8-12 minutes show the highest completion rates."
          },
          {
            type: "Learning Path",
            message: "Students who complete basic suturing first have 34% better performance in advanced techniques."
          }
        ]
      };

      // Generate CSV content
      const csvContent = generateCSVReport(reportData);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `video_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also generate JSON report
      const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json;charset=utf-8;' });
      const jsonLink = document.createElement('a');
      const jsonUrl = URL.createObjectURL(jsonBlob);
      jsonLink.setAttribute('href', jsonUrl);
      jsonLink.setAttribute('download', `video_analytics_report_${new Date().toISOString().split('T')[0]}.json`);
      jsonLink.style.visibility = 'hidden';
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const generateCSVReport = (data: any) => {
    let csv = '';
    
    // Header
    csv += `Video Analytics Report\n`;
    csv += `Generated: ${new Date(data.generatedAt).toLocaleDateString()}\n`;
    csv += `Timeframe: ${data.timeframe}\n\n`;
    
    // Summary
    csv += `SUMMARY\n`;
    csv += `Total Views,${data.summary.totalViews}\n`;
    csv += `Average Completion Rate,${data.summary.averageCompletionRate}%\n`;
    csv += `Average Watch Time,${formatDuration(data.summary.averageWatchTime)}\n`;
    csv += `Unique Learners,${data.summary.uniqueLearners}\n\n`;
    
    // Video Performance
    csv += `VIDEO PERFORMANCE\n`;
    csv += `Title,Category,Difficulty,Total Views,Unique Viewers,Avg Watch Time,Completion Rate,Engagement Score\n`;
    data.videoPerformance.forEach((video: any) => {
      csv += `"${video.title}","${video.category}","${video.difficulty}",${video.totalViews},${video.uniqueViewers},"${video.averageWatchTime}","${video.completionRate}",${video.engagementScore}\n`;
    });
    
    csv += `\nTOP PERFORMING VIDEOS\n`;
    csv += `Rank,Title,Engagement Score,Views,Completion Rate\n`;
    data.topPerformingVideos.forEach((video: any) => {
      csv += `${video.rank},"${video.title}",${video.engagementScore},"${video.views}","${video.completionRate}"\n`;
    });
    
    // Engagement Trends
    csv += `\nENGAGEMENT TRENDS\n`;
    csv += `Day,Views,Completions,Watch Time (seconds)\n`;
    data.engagementTrends.forEach((day: any) => {
      csv += `${day.date},${day.views},${day.completions},${day.watchTime}\n`;
    });
    
    // Learning Progress
    csv += `\nLEARNING PROGRESS\n`;
    csv += `Skill,Progress %,Improvement %\n`;
    data.learningProgress.forEach((skill: any) => {
      csv += `"${skill.skill}",${skill.progress},${skill.improvement}\n`;
    });
    
    // Insights
    csv += `\nKEY INSIGHTS\n`;
    csv += `Type,Message\n`;
    data.insights.forEach((insight: any) => {
      csv += `"${insight.type}","${insight.message}"\n`;
    });
    
    return csv;
  };

  const handleExportIndividualRecords = async () => {
    try {
      // Fetch individual learning records from API
      const response = await fetch('/api/learning-records/export');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', errorText);
        throw new Error(`Failed to fetch learning records: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Invalid response format:', responseText);
        throw new Error('Invalid response format - expected JSON');
      }
      
      const learningRecords = await response.json();
      console.log('Fetched learning records:', learningRecords);
      
      // Generate comprehensive CSV with individual records
      const csvContent = generateIndividualRecordsCSV(learningRecords);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `individual_learning_records_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export individual learning records. Please try again.');
    }
  };

  const generateIndividualRecordsCSV = (records: any[]) => {
    let csv = '';
    
    // Header
    csv += `Individual Learning Records Export\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n`;
    csv += `Total Records: ${records.length}\n\n`;
    
    // Column headers
    csv += `Watch ID,User ID,User Role ID,Video ID,Video Title,Session Start,Session End,Watch Duration (sec),Video Duration (sec),Completion %,Completed,Pause Count,Seek Count,Replay Count,Max Progress %,Skill Level,Learning Path,Device Type,Browser,Screen Resolution,Access Method,Engagement Score,Pre-Assessment,Post-Assessment,Difficulty Rating,Satisfaction Rating\n`;
    
    // Data rows
    records.forEach((record: any) => {
      const sessionDuration = record.sessionEndTime 
        ? Math.round((new Date(record.sessionEndTime).getTime() - new Date(record.sessionStartTime).getTime()) / 1000)
        : 'In Progress';
      
      csv += `"${record.watchId}","${record.userId}","${record.userRoleId}","${record.videoId}","${record.videoTitle || 'N/A'}","${new Date(record.sessionStartTime).toLocaleString()}","${record.sessionEndTime ? new Date(record.sessionEndTime).toLocaleString() : 'In Progress'}",${record.watchDuration},${record.videoDuration},${record.completionPercentage},"${record.isCompleted}",${record.pauseCount},${record.seekCount},${record.replayCount},${record.maxProgressReached},"${record.skillLevel || 'N/A'}","${record.learningPath || 'N/A'}","${record.deviceType}","${record.browserInfo}","${record.screenResolution}","${record.accessMethod}",${record.engagementScore || 0},${record.preAssessmentScore || 'N/A'},${record.postAssessmentScore || 'N/A'},${record.difficultyRating || 'N/A'},${record.satisfactionRating || 'N/A'}\n`;
    });
    
    return csv;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="researcher" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Video Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive video performance metrics and learning analytics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportReport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportIndividualRecords} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Individual Records
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(videoMetrics.reduce((sum, video) => sum + video.totalViews, 0))}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.3%</span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(videoMetrics.reduce((sum, video) => sum + video.completionRate, 0) / videoMetrics.length).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+5.7%</span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(Math.round(videoMetrics.reduce((sum, video) => sum + video.averageWatchTime, 0) / videoMetrics.length))}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">-2.1%</span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Learners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(videoMetrics.reduce((sum, video) => sum + video.uniqueViewers, 0))}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8.9%</span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="engagement">Engagement Analytics</TabsTrigger>
            <TabsTrigger value="performance">Video Performance</TabsTrigger>
            <TabsTrigger value="learning">Learning Progress</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Engagement Analytics */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Engagement Trends</CardTitle>
                  <CardDescription>Views, completions, and watch time over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="completions" stackId="1" stroke="#10B981" fill="#10B981" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Category Distribution</CardTitle>
                  <CardDescription>Breakdown of views by content category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Watch Time Analytics</CardTitle>
                <CardDescription>Total watch time and user engagement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="watchTime" stroke="#8B5CF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fundamental">Fundamental Skills</SelectItem>
                  <SelectItem value="advanced">Advanced Techniques</SelectItem>
                  <SelectItem value="specialized">Specialized Procedures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Video Performance Metrics</CardTitle>
                <CardDescription>Detailed analytics for all video content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoMetrics.map((video) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{video.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                            <Badge variant="outline" className="text-xs">{video.difficulty}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{video.engagementScore}</div>
                          <div className="text-xs text-gray-500">Engagement Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Total Views</div>
                          <div className="font-medium">{formatNumber(video.totalViews)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Unique Viewers</div>
                          <div className="font-medium">{formatNumber(video.uniqueViewers)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg Watch Time</div>
                          <div className="font-medium">{formatDuration(video.averageWatchTime)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Completion Rate</div>
                          <div className="font-medium">{video.completionRate}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Progress */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Development Progress</CardTitle>
                  <CardDescription>Overall progress across different suturing skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={learningProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Videos</CardTitle>
                  <CardDescription>Videos with highest engagement scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformingVideos.map((video, index) => (
                      <div key={video.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-spartan-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{video.title}</div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(video.totalViews)} views • {video.completionRate}% completion
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-spartan-green">{video.engagementScore}</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Improvement Trends</CardTitle>
                <CardDescription>Month-over-month improvement in different skills</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={learningProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="improvement" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Insights
                  </CardTitle>
                  <CardDescription>AI-driven analysis of video performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Strong Engagement Trend</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Videos in the "Fundamental Skills" category show 23% higher completion rates than average. Consider expanding this content area.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Optimal Video Length</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Videos between 8-12 minutes show the highest completion rates. Consider breaking longer content into segments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Learning Path Optimization</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Students who complete basic suturing first have 34% better performance in advanced techniques.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>Data-driven suggestions for improvement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">High Priority</h4>
                        <p className="text-sm text-gray-600">
                          "Plastic Surgery Suturing" has a 58% completion rate. Add interactive elements or split into shorter segments.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Medium Priority</h4>
                        <p className="text-sm text-gray-600">
                          Peak viewing times are 2-4 PM and 7-9 PM. Schedule live sessions during these hours.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Quick Win</h4>
                        <p className="text-sm text-gray-600">
                          Add practice exercises after "Basic Suturing Techniques" to increase retention by an estimated 15%.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>Machine learning insights on learning outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-spartan-green mb-2">87%</div>
                    <div className="text-sm text-gray-600">Predicted completion rate for new learners</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">3.2x</div>
                    <div className="text-sm text-gray-600">Skill improvement with guided practice</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">92%</div>
                    <div className="text-sm text-gray-600">Accuracy of performance predictions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}