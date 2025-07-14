import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, Search, Settings } from "lucide-react";

interface RoleSelectorProps {
  currentRole: string;
  userRoles?: string[];
  className?: string;
}

export default function RoleSelector({ 
  currentRole, 
  userRoles = ["learner"], 
  className = "" 
}: RoleSelectorProps) {
  const [location, setLocation] = useLocation();

  const roleConfig = {
    learner: {
      label: "Learner Dashboard",
      icon: GraduationCap,
      color: "bg-spartan-green",
      description: "Access video library and track progress",
    },
    evaluator: {
      label: "Evaluator Dashboard", 
      icon: User,
      color: "bg-medical-teal",
      description: "Review videos and provide feedback",
    },
    researcher: {
      label: "Researcher Dashboard",
      icon: Search,
      color: "bg-purple-600",
      description: "Export data and view analytics",
    },
    admin: {
      label: "Admin Dashboard",
      icon: Settings,
      color: "bg-gray-700",
      description: "Manage users and system settings",
    },
  };

  const handleRoleChange = (role: string) => {
    if (userRoles.includes(role)) {
      setLocation(`/${role}`);
    }
  };

  const getCurrentRoleConfig = () => {
    return roleConfig[currentRole as keyof typeof roleConfig] || roleConfig.learner;
  };

  const availableRoles = Object.entries(roleConfig).filter(([role]) => 
    userRoles.includes(role)
  );

  return (
    <div className={`relative ${className}`}>
      <Select value={currentRole} onValueChange={handleRoleChange}>
        <SelectTrigger className={`${getCurrentRoleConfig().color} text-white border-0 hover:opacity-90 transition-opacity`}>
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = getCurrentRoleConfig().icon;
              return <Icon className="w-4 h-4" />;
            })()}
            <SelectValue placeholder="Select role" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-80">
          {availableRoles.map(([role, config]) => {
            const Icon = config.icon;
            const isCurrentRole = role === currentRole;
            const isAvailable = userRoles.includes(role);
            
            return (
              <SelectItem 
                key={role} 
                value={role}
                disabled={!isAvailable}
                className="p-4 focus:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {config.label}
                      </span>
                      {isCurrentRole && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {!isAvailable && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          No Access
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
          
          {availableRoles.length === 1 && (
            <div className="p-4 text-sm text-gray-500 border-t">
              Contact your administrator to request access to additional roles.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
