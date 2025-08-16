import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, BookOpen, Award, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface SkillAssessmentProps {
  watchId: string;
  userId: string;
  userRoleId: string;
  videoId: string;
  onAssessmentComplete?: (assessment: any) => void;
}

interface SkillScores {
  skillScore: number;
  technicalScore: number;
  speedScore: number;
  accuracyScore: number;
}

interface Assessment {
  overallProficiency: string;
  strengths: Array<{
    area: string;
    description: string;
    score: number;
  }>;
  improvementAreas: Array<{
    area: string;
    description: string;
    priority: string;
    recommendedActions: string[];
  }>;
  personalizedFeedback: {
    summary: string;
    detailedAnalysis: string;
    encouragement: string;
    nextSteps: string[];
  };
  recommendations: {
    videos: Array<{
      videoId: string;
      title: string;
      reason: string;
      priority: number;
    }>;
    learningPaths: Array<{
      pathName: string;
      description: string;
      estimatedDuration: string;
      difficulty: string;
    }>;
    practiceExercises: Array<{
      title: string;
      description: string;
      difficulty: string;
      estimatedTime: string;
    }>;
  };
}

export function AiSkillAssessment({ 
  watchId, 
  userId, 
  userRoleId, 
  videoId, 
  onAssessmentComplete 
}: SkillAssessmentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skillScores, setSkillScores] = useState<SkillScores | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [personalizedFeedback, setPersonalizedFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runSkillAssessment = async () => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Fetch learning record data
      const recordResponse = await fetch(`/api/learning-records/${watchId}`);
      if (!recordResponse.ok) {
        throw new Error('Failed to fetch learning record');
      }
      
      const learningRecord = await recordResponse.json();
      
      // Run AI skill assessment
      const assessmentResponse = await fetch('/api/ai-assessment/analyze-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchId,
          userId,
          userRoleId,
          videoId,
          learningRecord,
        }),
      });
      
      if (!assessmentResponse.ok) {
        throw new Error('Failed to generate skill assessment');
      }
      
      const assessmentData = await assessmentResponse.json();
      setSkillScores(assessmentData.scores);
      setAssessment(assessmentData.assessment);
      setPersonalizedFeedback(assessmentData.feedback);
      
      onAssessmentComplete?.(assessmentData);
      
    } catch (err) {
      console.error('Skill assessment error:', err);
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency.toLowerCase()) {
      case 'expert': return 'bg-green-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'beginner': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-green-600" />
          <CardTitle>AI-Powered Skill Assessment</CardTitle>
        </div>
        <CardDescription>
          Get personalized feedback and skill analysis powered by advanced AI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!skillScores && !isAnalyzing && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Get detailed insights into your suturing performance and personalized recommendations
            </p>
            <Button onClick={runSkillAssessment} size="lg">
              <Brain className="h-4 w-4 mr-2" />
              Start AI Assessment
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <Brain className="h-12 w-12 text-green-600 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analyzing Your Performance...</h3>
                <p className="text-muted-foreground">AI is processing your learning data</p>
                <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Assessment Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {skillScores && assessment && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="recommendations">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Skill Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(skillScores.skillScore)}`}>
                      {skillScores.skillScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Skill</div>
                    <Progress value={skillScores.skillScore} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(skillScores.technicalScore)}`}>
                      {skillScores.technicalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Technical</div>
                    <Progress value={skillScores.technicalScore} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(skillScores.speedScore)}`}>
                      {skillScores.speedScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Speed</div>
                    <Progress value={skillScores.speedScore} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(skillScores.accuracyScore)}`}>
                      {skillScores.accuracyScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <Progress value={skillScores.accuracyScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Proficiency Level */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Current Proficiency Level</h3>
                      <p className="text-muted-foreground">Based on AI analysis of your performance</p>
                    </div>
                    <Badge className={`${getProficiencyColor(assessment.overallProficiency)} text-white capitalize px-4 py-2 text-sm font-medium`}>
                      {assessment.overallProficiency}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">{strength.area}</h4>
                        <p className="text-sm text-muted-foreground">{strength.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Progress value={strength.score} className="flex-1" />
                          <span className="text-sm font-medium">{strength.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Improvement Areas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.improvementAreas.map((area, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{area.area}</h4>
                            <Badge variant={getPriorityColor(area.priority)} className="text-xs">
                              {area.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                        </div>
                      </div>
                      
                      {area.recommendedActions.length > 0 && (
                        <div className="ml-4 space-y-1">
                          <h5 className="text-sm font-medium text-muted-foreground">Recommended Actions:</h5>
                          <ul className="space-y-1">
                            {area.recommendedActions.map((action, actionIndex) => (
                              <li key={actionIndex} className="text-sm flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg">Personalized Feedback</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-muted-foreground">{assessment.personalizedFeedback.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Detailed Analysis</h4>
                    <p className="text-muted-foreground">{assessment.personalizedFeedback.detailedAnalysis}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Encouragement</h4>
                    <p className="text-green-700 bg-green-50 p-3 rounded-lg">{assessment.personalizedFeedback.encouragement}</p>
                  </div>

                  {personalizedFeedback && (
                    <div>
                      <h4 className="font-medium mb-2">AI-Generated Feedback</h4>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-blue-900">{personalizedFeedback}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Recommended Actions</h4>
                      <div className="space-y-2">
                        {assessment.personalizedFeedback.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {assessment.recommendations.videos.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Recommended Videos</span>
                        </h4>
                        <div className="space-y-2">
                          {assessment.recommendations.videos.map((video, index) => (
                            <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium">{video.title}</h5>
                                <p className="text-sm text-muted-foreground">{video.reason}</p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                Priority: {video.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}