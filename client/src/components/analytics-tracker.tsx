import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AnalyticsTrackerProps {
  videoId: string;
  userId: string;
  videoDuration: number;
  onAnalyticsUpdate?: (data: any) => void;
}

interface VideoAnalyticsData {
  videoId: string;
  userId: string;
  viewStartTime: string;
  viewEndTime?: string;
  watchDuration: number;
  completionPercentage: number;
  isCompleted: boolean;
  pauseCount: number;
  seekCount: number;
  replayCount: number;
  playbackSpeed: number;
  maxProgressReached: number;
  deviceType: string;
  accessMethod: string;
  referrerPage?: string;
}

export function AnalyticsTracker({ 
  videoId, 
  userId, 
  videoDuration, 
  onAnalyticsUpdate 
}: AnalyticsTrackerProps) {
  const [sessionData, setSessionData] = useState<VideoAnalyticsData>({
    videoId,
    userId,
    viewStartTime: new Date().toISOString(),
    watchDuration: 0,
    completionPercentage: 0,
    isCompleted: false,
    pauseCount: 0,
    seekCount: 0,
    replayCount: 0,
    playbackSpeed: 1.0,
    maxProgressReached: 0,
    deviceType: getDeviceType(),
    accessMethod: getAccessMethod(),
    referrerPage: document.referrer || undefined
  });

  const watchStartTime = useRef<number>(Date.now());
  const lastPosition = useRef<number>(0);
  const trackingInterval = useRef<NodeJS.Timeout>();

  // Mutation to save analytics data
  const saveAnalytics = useMutation({
    mutationFn: async (data: VideoAnalyticsData) => {
      return apiRequest('/api/video-analytics', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      onAnalyticsUpdate?.(data);
    }
  });

  // Device type detection
  function getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet') || userAgent.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  // Access method detection
  function getAccessMethod(): string {
    if (document.referrer.includes('search')) return 'search';
    if (document.referrer.includes('recommendation')) return 'recommendation';
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
  const trackPause = () => {
    setSessionData(prev => ({
      ...prev,
      pauseCount: prev.pauseCount + 1
    }));
  };

  // Track seek event
  const trackSeek = (fromTime: number, toTime: number) => {
    setSessionData(prev => ({
      ...prev,
      seekCount: prev.seekCount + 1
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
    setSessionData(prev => ({
      ...prev,
      playbackSpeed: speed
    }));
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