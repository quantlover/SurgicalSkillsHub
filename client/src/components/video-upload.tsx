import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, Upload, Video, CheckCircle, AlertCircle } from "lucide-react";

const videoUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(["practice", "reference"]),
  suturingType: z.string().optional(),
});

type VideoUploadFormData = z.infer<typeof videoUploadSchema>;

interface VideoUploadProps {
  onUploadComplete?: (video: any) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const form = useForm<VideoUploadFormData>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "practice",
      suturingType: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: VideoUploadFormData & { file: File }) => {
      const formData = new FormData();
      formData.append("video", data.file);
      formData.append("title", data.title);
      formData.append("category", data.category);
      
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.suturingType) {
        formData.append("suturingType", data.suturingType);
      }

      // Simulate upload progress
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/videos");
        xhr.setRequestHeader("credentials", "include");
        xhr.send(formData);
      });
    },
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      onUploadComplete?.(video);
      form.reset();
      setSelectedFile(null);
      setUploadProgress(0);
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
    },
    onError: (error) => {
      setUploadProgress(0);
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
        title: "Upload Failed",
        description: "Please try again or check your file format.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VideoUploadFormData) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ ...data, file: selectedFile });
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 500MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title if empty
    if (!form.getValues("title")) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", fileName);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const suturingTypes = [
    { value: "simple_interrupted", label: "Simple Interrupted" },
    { value: "running", label: "Running Suture" },
    { value: "mattress_horizontal", label: "Horizontal Mattress" },
    { value: "mattress_vertical", label: "Vertical Mattress" },
    { value: "subcuticular", label: "Subcuticular" },
    { value: "purse_string", label: "Purse String" },
    { value: "figure_eight", label: "Figure-of-Eight" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload Practice Video</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-spartan-green bg-green-50"
                  : selectedFile
                  ? "border-success-green bg-green-50"
                  : "border-gray-300 hover:border-spartan-green"
              }`}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-success-green mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CloudUpload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your video file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <Button
                      type="button"
                      className="bg-spartan-green hover:bg-deep-green text-white"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "video/*";
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files && files.length > 0) {
                            handleFileSelect(files[0]);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supported formats: MP4, MOV, AVI (Max 500MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Uploading...
                  </span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Video Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter video title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="practice">Practice Video</SelectItem>
                        <SelectItem value="reference">Reference Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suturingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suturing Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select suturing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suturingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the video content, techniques demonstrated, or any specific notes..."
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="w-full bg-spartan-green hover:bg-deep-green text-white"
            >
              {uploadMutation.isPending ? (
                <>
                  <Video className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
