import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTenantColor } from "@/hooks/useTenantColor";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ClientOffer from "./pages/ClientOffer";
import TenantLogin from "./pages/TenantLogin";
import TenantAdmin from "./pages/TenantAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Apply tenant primary color globally
  useTenantColor();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/offer/:token" element={<ClientOffer />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/t/:slug/login" element={<TenantLogin />} />
      <Route path="/t/:slug/admin" element={<TenantAdmin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
