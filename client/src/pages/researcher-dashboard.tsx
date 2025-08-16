import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import DataExport from "@/components/data-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Download, 
  FileText, 
  Archive, 
  Users, 
  Video, 
  MessageSquare, 
  TrendingUp,
  Database,
  Shield
} from "lucide-react";

export default function ResearcherDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useDemoAuth();
  const [complianceSettings, setComplianceSettings] = useState({
    dataAnonymization: true,
    hipaaCompliance: true,
    dataEncryption: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spartan-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleBatchOperation = async (operation: string) => {
    try {
      toast({
        title: "Processing",
        description: `Initiating ${operation}...`,
      });
      
      // Here you would implement actual batch operations
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Success",
          description: `${operation} completed successfully!`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to complete ${operation}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="researcher" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Export Tools */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Data Export & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export Controls */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Export Data</h3>
                    <DataExport />
                  </div>
                  
                  {/* Analytics Preview */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Analytics Overview</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-spartan-green">
                            {analyticsLoading ? "..." : analytics?.totalVideos || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total Videos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-spartan-green">
                            {analyticsLoading ? "..." : analytics?.activeUsers || 0}
                          </div>
                          <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-spartan-green">
                            {analyticsLoading ? "..." : analytics?.averageScore?.toFixed(1) || "0.0"}
                          </div>
                          <div className="text-sm text-gray-600">Avg. Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-spartan-green">
                            {analyticsLoading ? "..." : `${(analytics?.completionRate || 0).toFixed(0)}%`}
                          </div>
                          <div className="text-sm text-gray-600">Completion Rate</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Chart Placeholder */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Learning Progress Trend
                      </h4>
                      <div className="h-32 bg-white rounded border flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">
                            Chart visualization would appear here
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Insights */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Research Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Video className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">Video Analysis</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Most common technique: Simple interrupted sutures
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">Feedback Patterns</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Needle control is the most improved skill
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-900">User Engagement</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Peak learning hours: 2-4 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Batch Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={() => handleBatchOperation("Download All Videos")}
                    className="w-full bg-spartan-green hover:bg-deep-green text-white justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Videos
                    <Badge variant="secondary" className="ml-auto">
                      {analytics?.totalVideos || 0} files
                    </Badge>
                  </Button>
                  
                  <Button
                    onClick={() => handleBatchOperation("Export User Data")}
                    className="w-full bg-medical-teal hover:bg-opacity-90 text-white justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export User Data
                    <Badge variant="secondary" className="ml-auto">
                      {analytics?.activeUsers || 0} users
                    </Badge>
                  </Button>
                  
                  <Button
                    onClick={() => handleBatchOperation("Archive Old Data")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Old Data
                    <Badge variant="secondary" className="ml-auto">
                      2+ years
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Data Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Data anonymization</span>
                    <Switch
                      checked={complianceSettings.dataAnonymization}
                      onCheckedChange={(checked) =>
                        setComplianceSettings(prev => ({
                          ...prev,
                          dataAnonymization: checked
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">HIPAA compliance</span>
                    <Switch
                      checked={complianceSettings.hipaaCompliance}
                      onCheckedChange={(checked) =>
                        setComplianceSettings(prev => ({
                          ...prev,
                          hipaaCompliance: checked
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Data encryption</span>
                    <Switch
                      checked={complianceSettings.dataEncryption}
                      onCheckedChange={(checked) =>
                        setComplianceSettings(prev => ({
                          ...prev,
                          dataEncryption: checked
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Video metadata</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Complete
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">User progress</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Complete
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Feedback data</p>
                      <p className="text-xs text-gray-500">Processing...</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      In Progress
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
