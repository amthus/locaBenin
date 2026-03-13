import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AIAssistant from "@/components/AIAssistant";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import PropertyDetail from "./pages/PropertyDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PublishPage from "./pages/PublishPage";
import DashboardTenant from "./pages/DashboardTenant";
import DashboardOwner from "./pages/DashboardOwner";
import MessagesPage from "./pages/MessagesPage";
import ContractsPage from "./pages/ContractsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PremiumPage from "./pages/PremiumPage";
import LegalPage from "./pages/LegalPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import HelpCenterPage from "./pages/HelpCenterPage";
import MaintenancePage from "./pages/MaintenancePage";
import AdminPage from "./pages/AdminPage";
import CommunityPage from "./pages/CommunityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/recherche" element={<SearchPage />} />
              <Route path="/bien/:id" element={<PropertyDetail />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<RegisterPage />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/juridique" element={<LegalPage />} />
              <Route path="/a-propos" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/aide" element={<HelpCenterPage />} />
              <Route path="/communaute" element={<CommunityPage />} />

              {/* Protected: any authenticated user */}
              <Route path="/publier" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/contrats" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
              <Route path="/paiements" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />

              {/* Protected: role-specific dashboards */}
              <Route path="/tableau-de-bord" element={<ProtectedRoute allowedRoles={["locataire"]}><DashboardTenant /></ProtectedRoute>} />
              <Route path="/espace-proprietaire" element={<ProtectedRoute allowedRoles={["proprietaire"]}><DashboardOwner /></ProtectedRoute>} />

              {/* Hidden admin route — admin only */}
              <Route path="/ctrl-panel-x" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIAssistant />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
