import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";
import {
  Bell,
  ClipboardList,
  DollarSign,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Browse Cases", href: "/cases", icon: Users },
  { name: "Needy Management", href: "/needy", icon: UserPlus },
  { name: "Case Management", href: "/case-management", icon: ClipboardList },
  { name: "Donor Relations", href: "/donors", icon: Heart },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Financial", href: "/financial", icon: DollarSign },
  { name: "Requests", href: "/requests", icon: Bell },
];

const Sidebar = ({ userData }) => {
  const location = useLocation();

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="w-64">
      <div className="flex flex-col h-screen bg-white border-r border-border  fixed top-0 left-0 z-50 w-64">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">CaretakerPortal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback>
                {userData?.identities[0]?.identity_data?.full_name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userData?.identities[0]?.identity_data?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Caretaker
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
