import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiSkillAssessment } from '@/components/ai-skill-assessment';
import { Link } from 'wouter';
import { Brain, TrendingUp, Award, Target, BookOpen, Users, BarChart3, Lightbulb, Zap, ChevronRight, ArrowLeft, Home, Stethoscope } from 'lucide-react';

export default function AiSkillDashboard() {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [skillProgressions, setSkillProgressions] = useState<any[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);

  useEffect(() => {
    // Load demo data for skill progressions and assessments
    setSkillProgressions([
      {
        skillArea: 'Basic Suturing',
        currentLevel: { name: 'Intermediate', score: 75, description: 'Solid foundation with room for advancement' },
        progression: [
          { date: '2025-08-10', score: 60, milestone: 'Completed basic techniques' },
          { date: '2025-08-13', score: 70, milestone: 'Improved speed and accuracy' },
          { date: '2025-08-16', score: 75, milestone: 'Current level' },
        ],
        trend: 'improving',
        nextTarget: 85,
      },
      {
        skillArea: 'Advanced Knot Tying',
        currentLevel: { name: 'Beginner', score: 45, description: 'Building foundational skills' },
        progression: [
          { date: '2025-08-12', score: 35, milestone: 'Started advanced training' },
          { date: '2025-08-15', score: 40, milestone: 'First successful complex knot' },
          { date: '2025-08-16', score: 45, milestone: 'Current level' },
        ],
        trend: 'steady',
        nextTarget: 60,
      },
      {
        skillArea: 'Surgical Instrument Handling',
        currentLevel: { name: 'Advanced', score: 88, description: 'Near expert proficiency' },
        progression: [
          { date: '2025-08-08', score: 80, milestone: 'Achieved advanced level' },
          { date: '2025-08-14', score: 85, milestone: 'Refined technique precision' },
          { date: '2025-08-16', score: 88, milestone: 'Current level' },
        ],
        trend: 'excellent',
        nextTarget: 95,
      }
    ]);

    setRecentAssessments([
      {
        id: '1',
        watchId: 'W1ABC23456',
        videoTitle: 'Basic Suturing Techniques',
        date: '2025-08-16',
        overallScore: 82,
        proficiency: 'intermediate',
        keyStrength: 'Learning Engagement',
        keyImprovement: 'Technique Efficiency'
      },
      {
        id: '2',
        watchId: 'W2DEF78901',
        videoTitle: 'Advanced Knot Tying',
        date: '2025-08-15',
        overallScore: 67,
        proficiency: 'beginner',
        keyStrength: 'Persistence',
        keyImprovement: 'Speed Optimization'
      },
      {
        id: '3',
        watchId: 'W3GHI34567',
        videoTitle: 'Surgical Instrument Handling',
        date: '2025-08-14',
        overallScore: 91,
        proficiency: 'advanced',
        keyStrength: 'Technical Precision',
        keyImprovement: 'Consistency'
      }
    ]);

    setOverallStats({
      totalAssessments: 15,
      averageScore: 78,
      skillTrend: 'improving',
      strongestArea: 'Surgical Instrument Handling',
      growthArea: 'Advanced Knot Tying',
      recommendationsCompleted: 8,
      nextMilestone: 'Intermediate to Advanced Transition'
    });
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProficiencyBadgeVariant = (proficiency: string) => {
    switch (proficiency.toLowerCase()) {
      case 'expert': return 'default';
      case 'advanced': return 'secondary';
      case 'intermediate': return 'outline';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'excellent': return <Award className="h-4 w-4 text-green-600" />;
      case 'steady': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Stethoscope className="text-green-600 h-6 w-6" />
                <span className="font-semibold text-gray-900">SutureLearn</span>
                <span className="text-gray-400">|</span>
                <Brain className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">AI Skills</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <Link href="/learner">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2 sm:space-x-3">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <span>AI-Powered Skill Assessment</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Personalized feedback and intelligent skill progression tracking
            </p>
          </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm px-2 py-2">Assessments</TabsTrigger>
            <TabsTrigger value="progression" className="text-xs sm:text-sm px-2 py-2">Progression</TabsTrigger>
            <TabsTrigger value="live-assessment" className="text-xs sm:text-sm px-2 py-2">Live AI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            {overallStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Average Score</p>
                        <p className={`text-lg sm:text-2xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
                          {overallStats.averageScore}%
                        </p>
                      </div>
                      <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Assessments</p>
                        <p className="text-lg sm:text-2xl font-bold">{overallStats.totalAssessments}</p>
                      </div>
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Strongest Area</p>
                        <p className="text-xs sm:text-sm font-semibold text-green-700">{overallStats.strongestArea}</p>
                      </div>
                      <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Growth Area</p>
                        <p className="text-xs sm:text-sm font-semibold text-orange-700">{overallStats.growthArea}</p>
                      </div>
                      <Target className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>AI-Generated Insights</span>
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your learning patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Key Strengths</span>
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Consistent engagement and focus during learning sessions</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Strong completion rates indicating persistence</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Excellent technical execution in instrument handling</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span>Growth Opportunities</span>
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Focus on smooth, continuous technique execution</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Reduce reliance on frequent pauses and replays</span>
                      </li>
                      <li className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Build speed and confidence in advanced techniques</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Assessments</CardTitle>
                <CardDescription>
                  View detailed analysis from your recent learning sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{assessment.videoTitle}</h3>
                          <Badge variant={getProficiencyBadgeVariant(assessment.proficiency)} className="capitalize">
                            {assessment.proficiency}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Score: <span className={`font-medium ${getScoreColor(assessment.overallScore)}`}>{assessment.overallScore}%</span></span>
                          <span>Date: {assessment.date}</span>
                          <span>Watch ID: {assessment.watchId}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="text-green-600">✓ {assessment.keyStrength}</span>
                          <span className="text-orange-600">⚡ Focus: {assessment.keyImprovement}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRecord(assessment)}
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progression" className="space-y-6">
            <div className="grid gap-6">
              {skillProgressions.map((progression, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {getTrendIcon(progression.trend)}
                          <span>{progression.skillArea}</span>
                        </CardTitle>
                        <CardDescription>
                          {progression.currentLevel.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {progression.currentLevel.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress to Next Level</span>
                        <span className="text-sm text-gray-600">
                          {progression.currentLevel.score}% / {progression.nextTarget}%
                        </span>
                      </div>
                      <Progress 
                        value={(progression.currentLevel.score / progression.nextTarget) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Progress</h4>
                      <div className="space-y-2">
                        {progression.progression.slice(-3).map((point: any, pointIndex: number) => (
                          <div key={pointIndex} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{point.date}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{point.score}%</span>
                              {point.milestone && (
                                <Badge variant="outline" className="text-xs">
                                  {point.milestone}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live-assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Run Live AI Assessment</CardTitle>
                <CardDescription>
                  Get immediate feedback on a specific learning session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select onValueChange={(value) => {
                    const record = recentAssessments.find(a => a.watchId === value);
                    setSelectedRecord(record);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a learning session to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentAssessments.map((assessment) => (
                        <SelectItem key={assessment.watchId} value={assessment.watchId}>
                          {assessment.videoTitle} - {assessment.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedRecord && (
                    <AiSkillAssessment
                      watchId={selectedRecord.watchId}
                      userId="user-dev-123"
                      userRoleId="1L12345"
                      videoId="video-basic-suturing"
                      onAssessmentComplete={(data) => {
                        console.log('Assessment completed:', data);
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}