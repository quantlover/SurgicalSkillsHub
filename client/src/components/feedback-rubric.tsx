import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import VoiceFeedback from "./voice-feedback";
import { Star, Save, FileText } from "lucide-react";

const feedbackSchema = z.object({
  needleControl: z.number().min(1).max(5),
  sutureSpacing: z.number().min(1).max(5),
  knotSecurity: z.number().min(1).max(5),
  overallTechnique: z.number().min(1).max(5),
  textFeedback: z.string().min(10, "Feedback must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackRubricProps {
  videoId: string;
  learnerId: string;
  onFeedbackSubmitted?: (feedback: any) => void;
}

export default function FeedbackRubric({ 
  videoId, 
  learnerId, 
  onFeedbackSubmitted 
}: FeedbackRubricProps) {
  const { toast } = useToast();
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      needleControl: 3,
      sutureSpacing: 3,
      knotSecurity: 3,
      overallTechnique: 3,
      textFeedback: "",
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData & { voiceTranscription?: string }) => {
      const overallScore = (data.needleControl + data.sutureSpacing + data.knotSecurity + data.overallTechnique) / 4;
      
      const feedbackData = {
        videoId,
        learnerId,
        overallScore,
        needleControl: data.needleControl,
        sutureSpacing: data.sutureSpacing,
        knotSecurity: data.knotSecurity,
        overallTechnique: data.overallTechnique,
        textFeedback: data.textFeedback,
        voiceTranscription: data.voiceTranscription,
      };

      const response = await apiRequest("POST", "/api/feedback", feedbackData);
      return await response.json();
    },
    onSuccess: (feedback) => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/pending"] });
      onFeedbackSubmitted?.(feedback);
      form.reset();
      setVoiceFeedback("");
      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
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
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<FeedbackFormData>) => {
      // In a real implementation, you would save this as a draft
      // For now, we'll just store it locally
      localStorage.setItem(`draft_${videoId}`, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      setIsDraft(true);
      toast({
        title: "Draft Saved",
        description: "Your feedback has been saved as a draft.",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedbackMutation.mutate({
      ...data,
      voiceTranscription: voiceFeedback,
    });
  };

  const saveDraft = () => {
    const currentData = form.getValues();
    saveDraftMutation.mutate({
      ...currentData,
      textFeedback: currentData.textFeedback || voiceFeedback,
    });
  };

  const handleVoiceFeedbackSaved = (feedback: string) => {
    setVoiceFeedback(feedback);
    // Append to existing text feedback
    const currentText = form.getValues("textFeedback");
    const newText = currentText ? `${currentText}\n\n${feedback}` : feedback;
    form.setValue("textFeedback", newText);
  };

  const RubricButton = ({ 
    value, 
    currentValue, 
    onClick 
  }: { 
    value: number; 
    currentValue: number; 
    onClick: () => void; 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`feedback-rubric-button ${value <= currentValue ? 'active' : ''}`}
    >
      {value}
    </button>
  );

  const criteria = [
    { name: "needleControl", label: "Needle Control", description: "Precision and control of needle handling" },
    { name: "sutureSpacing", label: "Suture Spacing", description: "Consistency and appropriateness of suture spacing" },
    { name: "knotSecurity", label: "Knot Security", description: "Quality and security of knot tying" },
    { name: "overallTechnique", label: "Overall Technique", description: "General technical proficiency" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Feedback Rubric</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Technical Skill Assessment */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Technical Skill Assessment</h3>
                <div className="space-y-4">
                  {criteria.map((criterion) => (
                    <FormField
                      key={criterion.name}
                      control={form.control}
                      name={criterion.name as keyof FeedbackFormData}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm text-gray-700">
                                {criterion.label}
                              </FormLabel>
                              <p className="text-xs text-gray-500">{criterion.description}</p>
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <RubricButton
                                  key={value}
                                  value={value}
                                  currentValue={field.value as number}
                                  onClick={() => field.onChange(value)}
                                />
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Overall Performance */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Overall Performance</h3>
                <FormField
                  control={form.control}
                  name="textFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide detailed feedback on technique, areas for improvement, and commendations..."
                          className="min-h-32 focus:ring-2 focus:ring-spartan-green focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending}
                  className="flex-1 bg-spartan-green hover:bg-deep-green text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </div>

              {isDraft && (
                <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  <Star className="w-4 h-4 inline mr-1 text-yellow-600" />
                  Draft saved. You can continue editing and submit when ready.
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Voice Feedback Component */}
      <VoiceFeedback onFeedbackSaved={handleVoiceFeedbackSaved} />
    </div>
  );
}
