import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "locataire" | "proprietaire" | "admin";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  locataire: "/tableau-de-bord",
  proprietaire: "/espace-proprietaire",
  admin: "/ctrl-panel-x",
};

async function fetchUserProfile(supabaseUser: SupabaseUser): Promise<UserProfile> {
  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", supabaseUser.id)
    .single();

  // Fetch role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supabaseUser.id)
    .single();

  const role = (roleData?.role as UserRole) || "locataire";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    fullName: profile?.full_name || supabaseUser.user_metadata?.full_name || "",
    role,
    avatarUrl: profile?.avatar_url || undefined,
    phone: profile?.phone || undefined,
    isVerified: profile?.is_verified || false,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        // Use setTimeout to avoid deadlock with Supabase client
        setTimeout(async () => {
          try {
            const profile = await fetchUserProfile(newSession.user);
            setUser(profile);
          } catch {
            setUser(null);
          }
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        try {
          const profile = await fetchUserProfile(existingSession.user);
          setUser(profile);
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole, phone?: string) => {
    // Block admin self-registration — admin role is assigned manually only
    const safeRole: UserRole = role === "admin" ? "locataire" : role;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: safeRole, phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const getDashboardPath = () => user ? ROLE_DASHBOARDS[user.role] : "/connexion";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session && !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
