import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stethoscope, LogOut } from "lucide-react";

interface NavigationHeaderProps {
  currentRole: string;
}

export default function NavigationHeader({ currentRole }: NavigationHeaderProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleRoleChange = (role: string) => {
    setLocation(`/${role}`);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <Stethoscope className="text-spartan-green text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">SuturLearn</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Selector */}
            <div className="relative">
              <Select value={currentRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-spartan-green text-white border-spartan-green hover:bg-deep-green">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner Dashboard</SelectItem>
                  <SelectItem value="evaluator">Evaluator Dashboard</SelectItem>
                  <SelectItem value="researcher">Researcher Dashboard</SelectItem>
                  <SelectItem value="admin">Admin Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl} alt={getUserDisplayName(user)} />
                <AvatarFallback className="bg-gray-300 text-gray-600">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {getUserDisplayName(user)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
