import type { AiSkillAssessment, FeedbackGeneration, SkillProgression } from "../../shared/ai-assessment-schema";

export class AiAssessmentService {
  private openaiApiKey: string;
  
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Analyze user performance and generate AI-powered skill assessment
   */
  async assessSkillLevel(learningRecord: any): Promise<AiSkillAssessment['aiAnalysis']> {
    try {
      const prompt = this.buildSkillAssessmentPrompt(learningRecord);
      const aiResponse = await this.callOpenAI(prompt);
      
      return this.parseSkillAssessmentResponse(aiResponse, learningRecord);
    } catch (error) {
      console.error('AI skill assessment error:', error);
      return this.getFallbackAssessment(learningRecord);
    }
  }

  /**
   * Generate personalized feedback based on performance
   */
  async generatePersonalizedFeedback(data: FeedbackGeneration): Promise<string> {
    try {
      const prompt = this.buildFeedbackPrompt(data);
      const aiResponse = await this.callOpenAI(prompt);
      
      return this.parseFeedbackResponse(aiResponse);
    } catch (error) {
      console.error('AI feedback generation error:', error);
      return this.getFallbackFeedback(data.learningRecord);
    }
  }

  /**
   * Analyze skill progression over time
   */
  async analyzeSkillProgression(userId: string, skillArea: string, recentRecords: any[]): Promise<SkillProgression['aiInsights']> {
    try {
      const prompt = this.buildProgressionAnalysisPrompt(userId, skillArea, recentRecords);
      const aiResponse = await this.callOpenAI(prompt);
      
      return this.parseProgressionResponse(aiResponse);
    } catch (error) {
      console.error('AI progression analysis error:', error);
      return this.getFallbackProgression();
    }
  }

  /**
   * Generate video recommendations based on performance
   */
  async generateVideoRecommendations(learningRecord: any, availableVideos: any[]): Promise<any[]> {
    const assessment = await this.assessSkillLevel(learningRecord);
    
    // AI-driven video matching based on skill gaps
    const recommendations = availableVideos
      .filter(video => this.isVideoRelevant(video, assessment))
      .sort((a, b) => this.calculateRecommendationScore(b, assessment) - this.calculateRecommendationScore(a, assessment))
      .slice(0, 5)
      .map(video => ({
        videoId: video.id,
        title: video.title,
        reason: this.generateRecommendationReason(video, assessment),
        priority: this.calculateRecommendationScore(video, assessment),
      }));

    return recommendations;
  }

  /**
   * Calculate comprehensive skill scores
   */
  calculateSkillScores(learningRecord: any): {
    skillScore: number;
    technicalScore: number;
    speedScore: number;
    accuracyScore: number;
  } {
    const {
      completionPercentage,
      watchDuration,
      videoDuration,
      pauseCount,
      seekCount,
      replayCount,
      engagementScore,
    } = learningRecord;

    // Technical execution score (based on completion and engagement)
    const technicalScore = Math.min(100, (completionPercentage * 0.7) + (engagementScore * 0.3));

    // Speed score (efficient viewing without excessive pauses/seeks)
    const optimalWatchRatio = Math.min(1.5, watchDuration / videoDuration);
    const pausePenalty = Math.min(20, pauseCount * 2);
    const seekPenalty = Math.min(15, seekCount * 1.5);
    const speedScore = Math.max(0, 100 - pausePenalty - seekPenalty - ((optimalWatchRatio - 1) * 10));

    // Accuracy score (minimal replays and seeks indicate good understanding)
    const replayPenalty = Math.min(25, replayCount * 5);
    const accuracyScore = Math.max(0, 100 - replayPenalty - (seekCount * 2));

    // Overall skill score (weighted average)
    const skillScore = (technicalScore * 0.4) + (speedScore * 0.3) + (accuracyScore * 0.3);

    return {
      skillScore: Math.round(skillScore),
      technicalScore: Math.round(technicalScore),
      speedScore: Math.round(speedScore),
      accuracyScore: Math.round(accuracyScore),
    };
  }

  private buildSkillAssessmentPrompt(learningRecord: any): string {
    return `
      Analyze this medical suturing learning session and provide a comprehensive skill assessment:

      Session Data:
      - Video: ${learningRecord.videoTitle}
      - Skill Level: ${learningRecord.skillLevel}
      - Completion: ${learningRecord.completionPercentage}%
      - Watch Duration: ${learningRecord.watchDuration}s / ${learningRecord.videoDuration}s
      - Pauses: ${learningRecord.pauseCount}
      - Seeks: ${learningRecord.seekCount}
      - Replays: ${learningRecord.replayCount}
      - Engagement Score: ${learningRecord.engagementScore}

      Provide assessment in JSON format:
      {
        "overallProficiency": "beginner|intermediate|advanced|expert",
        "strengths": [{"area": "string", "description": "string", "score": number}],
        "improvementAreas": [{"area": "string", "description": "string", "priority": "low|medium|high|critical", "recommendedActions": ["action1", "action2"]}],
        "personalizedFeedback": {
          "summary": "Brief overall assessment",
          "detailedAnalysis": "Detailed performance analysis",
          "encouragement": "Positive reinforcement message",
          "nextSteps": ["step1", "step2", "step3"]
        }
      }
    `;
  }

  private buildFeedbackPrompt(data: FeedbackGeneration): string {
    return `
      Generate personalized feedback for a medical suturing student:

      Learning Record:
      - Completion: ${data.learningRecord.completionPercentage}%
      - Engagement: ${data.learningRecord.engagementScore}
      - Pauses: ${data.learningRecord.pauseCount}
      - Current Skill Level: ${data.learningRecord.skillLevel}

      User Profile:
      - Experience: ${data.userProfile.experienceLevel}
      - Learning Goals: ${data.userProfile.learningGoals.join(', ')}
      - Learning Style: ${data.userProfile.preferredLearningStyle}

      Provide encouraging, constructive feedback that:
      1. Acknowledges effort and progress
      2. Identifies specific areas of improvement
      3. Provides actionable next steps
      4. Maintains motivation and confidence
      
      Keep feedback professional but supportive, medical education appropriate.
    `;
  }

  private buildProgressionAnalysisPrompt(userId: string, skillArea: string, recentRecords: any[]): string {
    const performanceData = recentRecords.map(record => 
      `Session: ${record.completionPercentage}% completion, ${record.engagementScore} engagement`
    ).join('\n');

    return `
      Analyze skill progression for medical suturing training:

      Skill Area: ${skillArea}
      Recent Performance:
      ${performanceData}

      Provide analysis in JSON format:
      {
        "learningVelocity": "rapid|steady|slow|stagnant",
        "strengthAreas": ["area1", "area2"],
        "challengeAreas": ["area1", "area2"],
        "personalizedTips": ["tip1", "tip2", "tip3"]
      }
    `;
  }

  private async callOpenAI(prompt: string): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert medical education AI assistant specializing in surgical skill assessment and personalized feedback for suturing techniques.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseSkillAssessmentResponse(aiResponse: string, learningRecord: any): AiSkillAssessment['aiAnalysis'] {
    try {
      const parsed = JSON.parse(aiResponse);
      const scores = this.calculateSkillScores(learningRecord);
      
      return {
        skillScore: scores.skillScore,
        technicalScore: scores.technicalScore,
        speedScore: scores.speedScore,
        accuracyScore: scores.accuracyScore,
        overallProficiency: parsed.overallProficiency,
        strengths: parsed.strengths || [],
        improvementAreas: parsed.improvementAreas || [],
        personalizedFeedback: parsed.personalizedFeedback,
        recommendations: {
          videos: [],
          learningPaths: [],
          practiceExercises: [],
        },
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackAssessment(learningRecord);
    }
  }

  private parseFeedbackResponse(aiResponse: string): string {
    // Extract clean feedback text from AI response
    return aiResponse.replace(/```json|```/g, '').trim();
  }

  private parseProgressionResponse(aiResponse: string): SkillProgression['aiInsights'] {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        learningVelocity: parsed.learningVelocity || 'steady',
        strengthAreas: parsed.strengthAreas || [],
        challengeAreas: parsed.challengeAreas || [],
        personalizedTips: parsed.personalizedTips || [],
      };
    } catch (error) {
      return this.getFallbackProgression();
    }
  }

  private getFallbackAssessment(learningRecord: any): AiSkillAssessment['aiAnalysis'] {
    const scores = this.calculateSkillScores(learningRecord);
    
    return {
      skillScore: scores.skillScore,
      technicalScore: scores.technicalScore,
      speedScore: scores.speedScore,
      accuracyScore: scores.accuracyScore,
      overallProficiency: this.determineProficiencyLevel(scores.skillScore),
      strengths: this.generateFallbackStrengths(learningRecord),
      improvementAreas: this.generateFallbackImprovements(learningRecord),
      personalizedFeedback: {
        summary: `You completed ${learningRecord.completionPercentage}% of the video with an engagement score of ${learningRecord.engagementScore}.`,
        detailedAnalysis: this.generateFallbackAnalysis(learningRecord),
        encouragement: 'Keep practicing! Every session brings you closer to mastering these essential surgical skills.',
        nextSteps: this.generateFallbackNextSteps(learningRecord),
      },
      recommendations: {
        videos: [],
        learningPaths: [],
        practiceExercises: [],
      },
    };
  }

  private getFallbackFeedback(learningRecord: any): string {
    const completion = learningRecord.completionPercentage;
    const engagement = learningRecord.engagementScore;
    
    if (completion >= 80 && engagement >= 70) {
      return 'Excellent work! You demonstrated strong engagement and completed most of the learning material. Your focus and attention to detail are evident. Continue building on this solid foundation.';
    } else if (completion >= 60) {
      return 'Good progress! You\'re making steady advancement in your learning. Consider reviewing the sections where you paused frequently to reinforce key concepts.';
    } else {
      return 'You\'re on the right track! Learning complex surgical techniques takes time and practice. Don\'t hesitate to replay difficult sections and take notes on key techniques.';
    }
  }

  private getFallbackProgression(): SkillProgression['aiInsights'] {
    return {
      learningVelocity: 'steady',
      strengthAreas: ['attention to detail', 'learning engagement'],
      challengeAreas: ['technique consistency', 'speed optimization'],
      personalizedTips: [
        'Practice regularly to build muscle memory',
        'Focus on one technique at a time before moving to complex procedures',
        'Review theoretical concepts alongside practical demonstrations',
      ],
    };
  }

  private determineProficiencyLevel(score: number): 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (score >= 90) return 'expert';
    if (score >= 80) return 'advanced';
    if (score >= 60) return 'intermediate';
    if (score >= 40) return 'beginner';
    return 'novice';
  }

  private generateFallbackStrengths(learningRecord: any): Array<{area: string, description: string, score: number}> {
    const strengths = [];
    
    if (learningRecord.completionPercentage >= 80) {
      strengths.push({
        area: 'Persistence',
        description: 'You consistently work through material to completion',
        score: 85,
      });
    }
    
    if (learningRecord.pauseCount <= 3) {
      strengths.push({
        area: 'Focus',
        description: 'You maintain attention throughout the learning session',
        score: 80,
      });
    }
    
    if (learningRecord.engagementScore >= 70) {
      strengths.push({
        area: 'Engagement',
        description: 'You actively participate in the learning process',
        score: learningRecord.engagementScore,
      });
    }
    
    return strengths;
  }

  private generateFallbackImprovements(learningRecord: any): Array<{area: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical', recommendedActions: string[]}> {
    const improvements = [];
    
    if (learningRecord.completionPercentage < 60) {
      improvements.push({
        area: 'Content Completion',
        description: 'Focus on completing more of the video content',
        priority: 'high' as const,
        recommendedActions: [
          'Set dedicated learning time blocks',
          'Remove distractions during study sessions',
          'Break longer videos into smaller segments',
        ],
      });
    }
    
    if (learningRecord.pauseCount > 10) {
      improvements.push({
        area: 'Learning Flow',
        description: 'Too many pauses may indicate difficulty following content',
        priority: 'medium' as const,
        recommendedActions: [
          'Review prerequisite material first',
          'Take notes while watching',
          'Use closed captions if available',
        ],
      });
    }
    
    if (learningRecord.replayCount > 3) {
      improvements.push({
        area: 'Concept Retention',
        description: 'Multiple replays suggest need for reinforcement',
        priority: 'medium' as const,
        recommendedActions: [
          'Practice active recall techniques',
          'Create summary notes after each session',
          'Discuss concepts with peers or mentors',
        ],
      });
    }
    
    return improvements;
  }

  private generateFallbackAnalysis(learningRecord: any): string {
    const parts = [];
    
    if (learningRecord.completionPercentage >= 80) {
      parts.push('You demonstrated good completion rates, showing commitment to learning.');
    }
    
    if (learningRecord.pauseCount <= 5) {
      parts.push('Your viewing pattern suggests good focus and understanding.');
    } else {
      parts.push('Frequent pauses indicate areas that may need additional review.');
    }
    
    if (learningRecord.engagementScore >= 70) {
      parts.push('Your engagement metrics show active participation in the learning process.');
    }
    
    return parts.join(' ') || 'Continue practicing to develop your surgical skills systematically.';
  }

  private generateFallbackNextSteps(learningRecord: any): string[] {
    const steps = [];
    
    if (learningRecord.completionPercentage < 100) {
      steps.push('Complete the remaining sections of this video');
    }
    
    if (learningRecord.pauseCount > 5) {
      steps.push('Review sections where you paused frequently');
    }
    
    steps.push('Practice the techniques demonstrated in a controlled environment');
    steps.push('Seek feedback from instructors or experienced practitioners');
    
    if (learningRecord.skillLevel === 'beginner') {
      steps.push('Master basic suturing patterns before progressing to complex techniques');
    }
    
    return steps;
  }

  private isVideoRelevant(video: any, assessment: AiSkillAssessment['aiAnalysis']): boolean {
    // Basic relevance scoring - in production, this would be more sophisticated
    return video.category === 'reference' || video.suturingType;
  }

  private calculateRecommendationScore(video: any, assessment: AiSkillAssessment['aiAnalysis']): number {
    let score = 50; // Base score
    
    // Prioritize videos that address improvement areas
    assessment.improvementAreas.forEach(area => {
      if (video.title.toLowerCase().includes(area.area.toLowerCase())) {
        score += 20;
      }
    });
    
    // Consider skill level matching
    if (video.difficulty === assessment.overallProficiency) {
      score += 15;
    }
    
    return score;
  }

  private generateRecommendationReason(video: any, assessment: AiSkillAssessment['aiAnalysis']): string {
    const improvementAreas = assessment.improvementAreas.map(area => area.area).join(', ');
    return `Recommended to address: ${improvementAreas}`;
  }
}