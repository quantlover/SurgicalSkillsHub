import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface Subtitle {
  id: string;
  timestamp: number;
  text: string;
  startTime: number;
  endTime: number;
}

interface SubtitlePanelProps {
  subtitles: Subtitle[];
  currentTime?: number;
  onTimestampClick?: (timestamp: number) => void;
}

export default function SubtitlePanel({ 
  subtitles = [], 
  currentTime = 0, 
  onTimestampClick 
}: SubtitlePanelProps) {
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  useEffect(() => {
    // Find the active subtitle based on current time
    const current = subtitles.find(
      (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
    setActiveSubtitle(current?.id || null);
  }, [currentTime, subtitles]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubtitleClick = (subtitle: Subtitle) => {
    setActiveSubtitle(subtitle.id);
    onTimestampClick?.(subtitle.startTime);
  };

  // Mock subtitles if none provided
  const mockSubtitles: Subtitle[] = subtitles.length > 0 ? subtitles : [
    {
      id: "1",
      timestamp: 165,
      text: "Begin by holding the needle driver with your dominant hand, ensuring proper grip and control. The needle should be grasped at approximately two-thirds of its length.",
      startTime: 165,
      endTime: 192
    },
    {
      id: "2",
      timestamp: 192,
      text: "Position the tissue gently with the forceps, creating adequate tension for precise needle insertion. Maintain steady pressure without excessive force.",
      startTime: 192,
      endTime: 218
    },
    {
      id: "3",
      timestamp: 218,
      text: "Insert the needle perpendicular to the skin surface, following the natural curve of the needle. This ensures optimal wound closure and minimal tissue trauma.",
      startTime: 218,
      endTime: 245
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Interactive Subtitles</CardTitle>
          <Button variant="ghost" size="sm" className="text-spartan-green hover:text-deep-green">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockSubtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              onClick={() => handleSubtitleClick(subtitle)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeSubtitle === subtitle.id
                  ? "bg-green-50 border-l-4 border-spartan-green"
                  : "bg-white border-l-4 border-gray-300 hover:bg-gray-50 hover:border-spartan-green"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-700 font-open-sans leading-relaxed flex-1">
                  {subtitle.text}
                </p>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {formatTime(subtitle.startTime)}
                </span>
              </div>
            </div>
          ))}
          
          {mockSubtitles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No subtitles available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
