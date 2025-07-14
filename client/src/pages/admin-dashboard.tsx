import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Activity, 
  UserPlus, 
  UserMinus,
  Search,
  Filter
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    retry: false,
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("POST", `/api/users/${userId}/roles`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Role assigned successfully!",
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
        description: "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("DELETE", `/api/users/${userId}/roles/${role}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Role removed successfully!",
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
        description: "Failed to remove role",
        variant: "destructive",
      });
    },
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

  const handleAssignRole = (userId: string, role: string) => {
    assignRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = (userId: string, role: string) => {
    removeRoleMutation.mutate({ userId, role });
  };

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || 
                       user.roles?.some((role: any) => role.role === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader currentRole="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-spartan-green mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.activeUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-spartan-green mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.totalVideos || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-spartan-green mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.averageScore?.toFixed(1) || "0.0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-spartan-green mr-3" />
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-success-green">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
                <div className="flex space-x-4 mt-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role-filter">Filter by Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="learner">Learner</SelectItem>
                        <SelectItem value="evaluator">Evaluator</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spartan-green mx-auto"></div>
                    </div>
                  ) : filteredUsers?.length ? (
                    filteredUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.roles?.map((role: any) => (
                              <Badge
                                key={role.role}
                                variant="secondary"
                                className="bg-spartan-green text-white"
                              >
                                {role.role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Select
                            onValueChange={(role) => handleAssignRole(user.id, role)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Add role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="learner">Learner</SelectItem>
                              <SelectItem value="evaluator">Evaluator</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            className="bg-spartan-green hover:bg-deep-green text-white"
                            disabled={assignRoleMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                          
                          {user.roles?.length > 0 && (
                            <Select
                              onValueChange={(role) => handleRemoveRole(user.id, role)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Remove role" />
                              </SelectTrigger>
                              <SelectContent>
                                {user.roles.map((role: any) => (
                                  <SelectItem key={role.role} value={role.role}>
                                    {role.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "System maintenance scheduled for tonight",
                      });
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    System Maintenance
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "Database backup initiated",
                      });
                    }}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Database Backup
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "Security audit completed",
                      });
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">User registered</p>
                    <p className="text-gray-600">2 hours ago</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Video uploaded</p>
                    <p className="text-gray-600">4 hours ago</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Feedback submitted</p>
                    <p className="text-gray-600">6 hours ago</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Role assigned</p>
                    <p className="text-gray-600">1 day ago</p>
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
