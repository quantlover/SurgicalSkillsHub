import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Calendar, Database } from "lucide-react";

const exportSchema = z.object({
  includeMetadata: z.boolean().default(true),
  includeFeedback: z.boolean().default(true),
  includeProgress: z.boolean().default(false),
  includeTrajectories: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(["csv", "excel", "json"]).default("csv"),
});

type ExportFormData = z.infer<typeof exportSchema>;

export default function DataExport() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      includeMetadata: true,
      includeFeedback: true,
      includeProgress: false,
      includeTrajectories: false,
      format: "csv",
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (data: ExportFormData) => {
      setIsExporting(true);
      
      const exportOptions = {
        includeMetadata: data.includeMetadata,
        includeFeedback: data.includeFeedback,
        includeProgress: data.includeProgress,
        includeTrajectories: data.includeTrajectories,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      const response = await apiRequest("POST", "/api/export", exportOptions);
      const exportData = await response.json();
      
      // Convert data to selected format and download
      const downloadData = formatExportData(exportData, data.format);
      downloadFile(downloadData, `suturlearn_export_${new Date().toISOString().split('T')[0]}.${data.format}`);
      
      return exportData;
    },
    onSuccess: () => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully!",
      });
    },
    onError: (error) => {
      setIsExporting(false);
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
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatExportData = (data: any, format: string) => {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "csv":
        return convertToCSV(data);
      case "excel":
        // For simplicity, return CSV format for Excel (in a real app, use a library like SheetJS)
        return convertToCSV(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const convertToCSV = (data: any) => {
    const csvSections = [];

    if (data.videos) {
      csvSections.push("Videos\n" + arrayToCSV(data.videos));
    }
    if (data.feedback) {
      csvSections.push("Feedback\n" + arrayToCSV(data.feedback));
    }
    if (data.userProgress) {
      csvSections.push("User Progress\n" + arrayToCSV(data.userProgress));
    }
    if (data.learningSessions) {
      csvSections.push("Learning Sessions\n" + arrayToCSV(data.learningSessions));
    }

    return csvSections.join("\n\n");
  };

  const arrayToCSV = (array: any[]) => {
    if (array.length === 0) return "";
    
    const headers = Object.keys(array[0]);
    const csvRows = [
      headers.join(","),
      ...array.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSubmit = (data: ExportFormData) => {
    exportMutation.mutate(data);
  };

  const dataTypes = [
    { 
      key: "includeMetadata", 
      label: "Video metadata", 
      description: "Video titles, descriptions, upload dates, and categories" 
    },
    { 
      key: "includeFeedback", 
      label: "Feedback scores", 
      description: "Evaluator feedback, scores, and rubric assessments" 
    },
    { 
      key: "includeProgress", 
      label: "User progress data", 
      description: "Learning progress, completion rates, and milestones" 
    },
    { 
      key: "includeTrajectories", 
      label: "Learning trajectories", 
      description: "Session data, viewing patterns, and learning paths" 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Data Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Data to Export</Label>
              {dataTypes.map((dataType) => (
                <FormField
                  key={dataType.key}
                  control={form.control}
                  name={dataType.key as keyof ExportFormData}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          {dataType.label}
                        </FormLabel>
                        <p className="text-xs text-gray-500">
                          {dataType.description}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Date Range Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Date Range (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Export Format */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Export Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Export Button */}
            <Button
              type="submit"
              disabled={isExporting}
              className="w-full bg-spartan-green hover:bg-deep-green text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Export Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Export Instructions</p>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• Select the data types you want to include in your export</li>
                <li>• Optionally set a date range to filter the data</li>
                <li>• Choose your preferred format (CSV for spreadsheets, JSON for programming)</li>
                <li>• Large exports may take a few minutes to process</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
