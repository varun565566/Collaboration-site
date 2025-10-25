import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Video,
  PenTool,
  Kanban,
  MessageCircle,
  Users,
  Settings,
  ChevronLeft,
  Home,
  LogOut,
  Shield,
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: "dashboard", label: "Dashboard", icon: Home, color: "workspace" },
  { id: "documents", label: "Documents", icon: FileText, color: "docs" },
  { id: "video", label: "Video Calls", icon: Video, color: "video" },
  { id: "whiteboard", label: "Whiteboard", icon: PenTool, color: "whiteboard" },
  { id: "tasks", label: "Task Boards", icon: Kanban, color: "tasks" },
  { id: "chat", label: "Team Chat", icon: MessageCircle, color: "chat" },
];

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
      
      // Fetch user role from user_roles table
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setUserRole(data?.role || 'developer'));
    }
  }, [user]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Collaboration Suite</h2>
                <p className="text-xs text-muted-foreground">Remote Team Hub</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {modules.map((module) => {
          const isActive = activeModule === module.id;
          return (
            <Button
              key={module.id}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onModuleChange(module.id)}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isCollapsed && "justify-center px-2",
                isActive && "bg-secondary shadow-custom-sm"
              )}
            >
              <module.icon
                className={cn(
                  "w-4 h-4",
                  isActive && `text-${module.color}`
                )}
              />
              {!isCollapsed && (
                <span className="font-medium">{module.label}</span>
              )}
            </Button>
          );
        })}

        {/* Admin Dashboard Link - Only show for admins */}
        {userRole === 'admin' && (
          <Button
            variant={activeModule === "admin" ? "secondary" : "ghost"}
            onClick={() => window.location.href = '/admin'}
            className={cn(
              "w-full justify-start gap-3 h-10",
              isCollapsed && "justify-center px-2",
              activeModule === "admin" && "bg-secondary shadow-custom-sm"
            )}
          >
            <Shield
              className={cn(
                "w-4 h-4",
                activeModule === "admin" && "text-red-500"
              )}
            />
            {!isCollapsed && (
              <span className="font-medium">Admin Dashboard</span>
            )}
          </Button>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-primary text-white text-xs">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                <Badge variant="secondary" className="text-xs bg-video/10 text-video">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {userRole || 'developer'}
              </p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={signOut}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};