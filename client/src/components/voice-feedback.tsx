import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Save, Edit3 } from "lucide-react";

interface VoiceFeedbackProps {
  onFeedbackSaved?: (feedback: string) => void;
}

export default function VoiceFeedback({ onFeedbackSaved }: VoiceFeedbackProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Browser speech recognition as primary method
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please type your feedback manually.",
        variant: "destructive",
      });
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscription(prev => prev + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice feedback.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or type your feedback manually.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  };

  // Fallback: Record audio and send to server for transcription
  const speechToTextMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await apiRequest("POST", "/api/speech-to-text", formData);
      return await response.json();
    },
    onSuccess: (data) => {
      setTranscription(prev => prev + " " + data.transcription);
      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Transcription Failed",
        description: "Please try again or type your feedback manually.",
        variant: "destructive",
      });
    },
  });

  const startRecording = async () => {
    try {
      // Try browser speech recognition first
      const speechRecognition = initializeSpeechRecognition();
      if (speechRecognition) {
        setRecognition(speechRecognition);
        speechRecognition.start();
        return;
      }

      // Fallback to audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        speechToTextMutation.mutate(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access or type your feedback manually.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEdit = () => {
    setEditableText(transcription);
    setIsEditing(true);
  };

  const saveText = () => {
    setTranscription(editableText);
    setIsEditing(false);
  };

  const saveFeedback = () => {
    const finalText = isEditing ? editableText : transcription;
    if (!finalText.trim()) {
      toast({
        title: "No Feedback",
        description: "Please record or type some feedback before saving.",
        variant: "destructive",
      });
      return;
    }

    onFeedbackSaved?.(finalText);
    toast({
      title: "Success",
      description: "Feedback saved successfully!",
    });
    
    // Clear the feedback
    setTranscription("");
    setEditableText("");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Voice Feedback Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recording Interface */}
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
            <Button
              onClick={toggleRecording}
              disabled={speechToTextMutation.isPending}
              className={`w-16 h-16 rounded-full transition-colors ${
                isRecording 
                  ? "bg-error-red hover:bg-red-600" 
                  : "bg-spartan-green hover:bg-deep-green"
              }`}
            >
              {isRecording ? (
                <MicOff className="text-white text-xl" />
              ) : (
                <Mic className="text-white text-xl" />
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {isRecording 
                ? "Recording... Click to stop" 
                : "Click to start recording feedback"
              }
            </p>
            <p className="text-xs text-gray-500">
              Speech will be automatically transcribed
            </p>
          </div>

          {/* Transcription Area */}
          <div className="bg-gray-50 rounded-lg p-4 min-h-24">
            {isEditing ? (
              <Textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                placeholder="Edit your feedback here..."
                className="min-h-20 resize-none border-none bg-transparent p-0 focus:ring-0"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcription || (
                  <span className="italic text-gray-500">
                    Transcribed feedback will appear here...
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {transcription && !isEditing && (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Text
              </Button>
            )}
            
            {isEditing && (
              <Button
                onClick={saveText}
                variant="outline"
                className="flex-1"
              >
                Save Changes
              </Button>
            )}

            <Button
              onClick={saveFeedback}
              disabled={(!transcription && !editableText) || speechToTextMutation.isPending}
              className="flex-1 bg-spartan-green hover:bg-deep-green text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {speechToTextMutation.isPending ? "Processing..." : "Save Feedback"}
            </Button>
          </div>

          {/* Fallback Text Input */}
          {!transcription && !isRecording && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Or type your feedback manually:
              </p>
              <Textarea
                placeholder="Type your feedback here..."
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="min-h-20"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
