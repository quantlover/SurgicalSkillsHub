import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AnalyticsTrackerProps {
  videoId: string;
  userId: string;
  userRole: string; // 'learner', 'evaluator', 'researcher', 'admin'
  videoDuration: number;
  skillLevel?: string;
  learningPath?: string;
  onAnalyticsUpdate?: (data: any) => void;
}

interface LearningRecordData {
  watchId: string;
  videoId: string;
  userId: string;
  userRoleId: string;
  sessionStartTime: string;
  sessionEndTime?: string;
  watchDuration: number;
  videoDuration: number;
  completionPercentage: number;
  isCompleted: boolean;
  pauseCount: number;
  pauseTimestamps: number[];
  seekCount: number;
  seekEvents: Array<{ from: number; to: number; timestamp: number }>;
  replayCount: number;
  playbackSpeed: number;
  speedChanges: Array<{ speed: number; timestamp: number }>;
  maxProgressReached: number;
  progressCheckpoints: Array<{ percentage: number; timestamp: number }>;
  timeToCompletion?: number;
  viewingPattern: any;
  learningObjectives?: string[];
  skillLevel?: string;
  learningPath?: string;
  deviceType: string;
  browserInfo: string;
  screenResolution: string;
  accessMethod: string;
  referrerPage?: string;
  engagementScore: number;
}

export function AnalyticsTracker({ 
  videoId, 
  userId, 
  userRole,
  videoDuration, 
  skillLevel = 'intermediate',
  learningPath,
  onAnalyticsUpdate 
}: AnalyticsTrackerProps) {
  // Generate unique IDs for this learning session
  const sessionIds = useRef(generateLearningRecordIds(userId, userRole));
  
  const [sessionData, setSessionData] = useState<LearningRecordData>({
    watchId: sessionIds.current.watchId,
    videoId,
    userId,
    userRoleId: sessionIds.current.userRoleId,
    sessionStartTime: new Date().toISOString(),
    watchDuration: 0,
    videoDuration,
    completionPercentage: 0,
    isCompleted: false,
    pauseCount: 0,
    pauseTimestamps: [],
    seekCount: 0,
    seekEvents: [],
    replayCount: 0,
    playbackSpeed: 1.0,
    speedChanges: [],
    maxProgressReached: 0,
    progressCheckpoints: [],
    viewingPattern: {},
    skillLevel,
    learningPath,
    deviceType: getDeviceType(),
    browserInfo: getBrowserInfo(),
    screenResolution: getScreenResolution(),
    accessMethod: getAccessMethod(),
    referrerPage: document.referrer || undefined,
    engagementScore: 0
  });

  const watchStartTime = useRef<number>(Date.now());
  const lastPosition = useRef<number>(0);
  const trackingInterval = useRef<NodeJS.Timeout>();

  // Mutation to save learning record data
  const saveLearningRecord = useMutation({
    mutationFn: async (data: LearningRecordData) => {
      return apiRequest('/api/learning-records', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      onAnalyticsUpdate?.(data);
    }
  });

  // Generate unique learning record IDs
  function generateLearningRecordIds(userId: string, role: string) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const watchId = `W${timestamp}${random}`.toUpperCase();
    
    // Generate role-specific user sub-ID
    const userIdHash = hashString(userId).substring(0, 5);
    const rolePrefixes: { [key: string]: string } = {
      'learner': '1L',
      'evaluator': '1E', 
      'researcher': '1R',
      'admin': '1A'
    };
    const prefix = rolePrefixes[role.toLowerCase()] || '1U';
    const userRoleId = `${prefix}${userIdHash}`;
    
    return { watchId, userRoleId };
  }

  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  // Device type detection
  function getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet') || userAgent.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  // Browser information detection
  function getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Screen resolution detection
  function getScreenResolution(): string {
    return `${screen.width}x${screen.height}`;
  }

  // Access method detection
  function getAccessMethod(): string {
    if (document.referrer.includes('search')) return 'search';
    if (document.referrer.includes('recommendation')) return 'recommendation';
    if (document.referrer.includes('assignment')) return 'assignment';
    return 'direct';
  }

  // Track video progress
  const trackProgress = (currentTime: number) => {
    const progressPercentage = Math.round((currentTime / videoDuration) * 100);
    const watchDelta = Math.min(currentTime - lastPosition.current, 2); // Cap at 2 seconds to prevent seeking skew
    
    if (watchDelta > 0) {
      setSessionData(prev => ({
        ...prev,
        watchDuration: prev.watchDuration + watchDelta,
        completionPercentage: progressPercentage,
        maxProgressReached: Math.max(prev.maxProgressReached, progressPercentage),
        isCompleted: progressPercentage >= 90 // Consider 90% as completed
      }));
    }
    
    lastPosition.current = currentTime;
  };

  // Track pause event
  const trackPause = (currentTime: number) => {
    setSessionData(prev => ({
      ...prev,
      pauseCount: prev.pauseCount + 1,
      pauseTimestamps: [...prev.pauseTimestamps, currentTime]
    }));
  };

  // Track seek event
  const trackSeek = (fromTime: number, toTime: number) => {
    const seekEvent = {
      from: fromTime,
      to: toTime,
      timestamp: Date.now()
    };
    
    setSessionData(prev => ({
      ...prev,
      seekCount: prev.seekCount + 1,
      seekEvents: [...prev.seekEvents, seekEvent]
    }));
    
    // If seeking backwards significantly, consider it a replay
    if (toTime < fromTime - 10) {
      setSessionData(prev => ({
        ...prev,
        replayCount: prev.replayCount + 1
      }));
    }
  };

  // Track playback speed change
  const trackPlaybackSpeedChange = (speed: number) => {
    const speedChange = {
      speed,
      timestamp: Date.now()
    };
    
    setSessionData(prev => ({
      ...prev,
      playbackSpeed: speed,
      speedChanges: [...prev.speedChanges, speedChange]
    }));
  };

  // Track progress checkpoints
  const trackProgressCheckpoint = (percentage: number) => {
    const checkpoint = {
      percentage,
      timestamp: Date.now()
    };
    
    setSessionData(prev => ({
      ...prev,
      progressCheckpoints: [...prev.progressCheckpoints, checkpoint]
    }));
  };

  // Calculate engagement score
  const calculateEngagementScore = (data: LearningRecordData): number => {
    const completionWeight = data.completionPercentage * 0.4;
    const watchTimeWeight = Math.min((data.watchDuration / data.videoDuration) * 100, 100) * 0.3;
    const engagementWeight = Math.max(0, 20 - (data.pauseCount * 2)) * 0.2;
    const progressWeight = data.maxProgressReached * 0.1;
    
    return Math.min(100, completionWeight + watchTimeWeight + engagementWeight + progressWeight);
  };

  // Save analytics data periodically and on events
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData.watchDuration > 0) {
        saveAnalytics.mutate({
          ...sessionData,
          viewEndTime: new Date().toISOString()
        });
      }
    }, 30000); // Save every 30 seconds

    trackingInterval.current = interval;
    return () => clearInterval(interval);
  }, [sessionData]);

  // Save analytics on component unmount (when user leaves video)
  useEffect(() => {
    return () => {
      if (sessionData.watchDuration > 0) {
        saveAnalytics.mutate({
          ...sessionData,
          viewEndTime: new Date().toISOString()
        });
      }
    };
  }, []);

  // Expose tracking functions for video player to use
  useEffect(() => {
    // Attach to window for video player access
    (window as any).videoAnalytics = {
      trackProgress,
      trackPause,
      trackSeek,
      trackPlaybackSpeedChange,
      getCurrentData: () => sessionData
    };

    return () => {
      delete (window as any).videoAnalytics;
    };
  }, [sessionData]);

  return null; // This is a tracking component, no UI needed
}

// Hook for easy analytics integration
export function useVideoAnalytics(videoId: string, userId: string, videoDuration: number) {
  const [analyticsData, setAnalyticsData] = useState<VideoAnalyticsData | null>(null);

  return {
    AnalyticsTracker: () => (
      <AnalyticsTracker
        videoId={videoId}
        userId={userId}
        videoDuration={videoDuration}
        onAnalyticsUpdate={setAnalyticsData}
      />
    ),
    analyticsData
  };
}

// Enhanced video player wrapper with analytics
interface VideoPlayerWithAnalyticsProps {
  videoId: string;
  userId: string;
  src: string;
  duration: number;
  onAnalyticsUpdate?: (data: any) => void;
  className?: string;
}

export function VideoPlayerWithAnalytics({
  videoId,
  userId,
  src,
  duration,
  onAnalyticsUpdate,
  className = "w-full h-auto"
}: VideoPlayerWithAnalyticsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Time update handler
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      (window as any).videoAnalytics?.trackProgress(time);
    };

    // Pause handler
    const handlePause = () => {
      setIsPlaying(false);
      (window as any).videoAnalytics?.trackPause();
    };

    // Play handler
    const handlePlay = () => {
      setIsPlaying(true);
    };

    // Seeking handler
    const handleSeeking = () => {
      const newTime = video.currentTime;
      (window as any).videoAnalytics?.trackSeek(currentTime, newTime);
    };

    // Rate change handler
    const handleRateChange = () => {
      (window as any).videoAnalytics?.trackPlaybackSpeedChange(video.playbackRate);
    };

    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('ratechange', handleRateChange);
    };
  }, [currentTime]);

  return (
    <div className="relative">
      <AnalyticsTracker
        videoId={videoId}
        userId={userId}
        videoDuration={duration}
        onAnalyticsUpdate={onAnalyticsUpdate}
      />
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls
        preload="metadata"
      />
      
      {/* Analytics overlay for debugging (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Progress: {Math.round((currentTime / duration) * 100)}%</div>
          <div>Status: {isPlaying ? 'Playing' : 'Paused'}</div>
        </div>
      )}
    </div>
  );
}