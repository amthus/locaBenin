import { 
  Home, Eye, DollarSign, Star, TrendingUp, BarChart3, Calendar, MessageCircle, 
  FileText, Wrench, Shield, LogOut, User, Building, Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ownerSidebarItems = [
  { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
  { id: "performance", label: "Performance", icon: Eye },
  { id: "revenue", label: "Revenus", icon: DollarSign },
  { id: "properties", label: "Mes biens", icon: Home },
  { id: "activity", label: "Activité", icon: Calendar },
];

export const ownerQuickLinks = [
  { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
  { id: "contracts", label: "Contrats", icon: FileText, path: "/contrats" },
  { id: "payments", label: "Paiements", icon: DollarSign, path: "/paiements" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, path: "/maintenance" },
  { id: "publish", label: "Nouvelle annonce", icon: Plus, path: "/publier" },
  { id: "premium", label: "Premium", icon: Shield, path: "/premium" },
];

interface OwnerSidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export function OwnerSidebar({ activeTab, setActiveTab }: OwnerSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Building className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-foreground text-sm">LOCABENIN</h1>
              <p className="text-xs text-muted-foreground">Propriétaire</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tableau de bord</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ownerSidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
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

        <SidebarGroup>
          <SidebarGroupLabel>Accès rapide</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ownerQuickLinks.map((item) => (
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
                  {user?.fullName?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground">Propriétaire</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profil")}>
              <User className="h-4 w-4 mr-2" /> Mon profil
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
