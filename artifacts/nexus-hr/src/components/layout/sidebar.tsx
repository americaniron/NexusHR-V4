import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, UserCircle, CheckSquare, GitMerge, MessageSquare, BarChart, Plug, CreditCard, Settings, HelpCircle, LogOut, PanelLeftClose, PanelLeft, Clapperboard, Store } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect } from "react";

const navigation = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Talent Hub", href: "/marketplace", icon: Store },
  { name: "My Workforce", href: "/team", icon: UserCircle },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Workflows", href: "/workflows", icon: GitMerge },
  { name: "Conversations", href: "/conversations", icon: MessageSquare },
  { name: "Video Studio", href: "/video-studio", icon: Clapperboard, isNew: true },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { sidebar, toggleSidebar, setLastVisitedPath } = useAppStore();
  const collapsed = sidebar.collapsed;

  useEffect(() => {
    if (location !== "/") {
      setLastVisitedPath(location);
    }
  }, [location, setLastVisitedPath]);

  return (
    <div className={cn(
      "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-sidebar-border justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-9 w-9 object-contain shrink-0" />
          {!collapsed && <span className="text-lg font-bold text-sidebar-foreground tracking-tight">NexsusHR</span>}
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={toggleSidebar}>
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-2" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && (
                  <span className="flex items-center gap-2 flex-1">
                    {item.name}
                    {"isNew" in item && item.isNew && (
                      <Badge variant="default" className="h-4 px-1 text-[9px] leading-none bg-primary text-primary-foreground">NEW</Badge>
                    )}
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-sidebar-border shrink-0">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                {user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        )}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground p-2"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
}
