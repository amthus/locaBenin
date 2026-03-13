import { 
  Search, Heart, Calendar, MessageCircle, FileText, Bell, Settings, Wrench, Shield, 
  DollarSign, LogOut, User, Home, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const tenantSidebarItems = [
  { id: "overview", label: "Accueil", icon: LayoutDashboard },
  { id: "favorites", label: "Favoris", icon: Heart },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export const tenantQuickLinks = [
  { id: "search", label: "Rechercher", icon: Search, path: "/recherche" },
  { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
  { id: "payments", label: "Paiements", icon: DollarSign, path: "/paiements" },
  { id: "contracts", label: "Contrats", icon: FileText, path: "/contrats" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, path: "/maintenance" },
  { id: "premium", label: "Premium", icon: Shield, path: "/premium" },
];

interface TenantSidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  unreadMessages?: number;
}

export function TenantSidebar({ activeTab, setActiveTab, unreadMessages = 0 }: TenantSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-foreground text-sm">LOCABENIN</h1>
              <p className="text-xs text-muted-foreground">Locataire</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mon espace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tenantSidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    tooltip={item.label}
                    className="relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.id === "notifications" && unreadMessages > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs font-bold absolute right-2">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tenantQuickLinks.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.fullName?.charAt(0) || "L"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground">Locataire</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profil")}>
              <User className="h-4 w-4 mr-2" /> Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profil")}>
              <Settings className="h-4 w-4 mr-2" /> Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" /> Retour au site
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
