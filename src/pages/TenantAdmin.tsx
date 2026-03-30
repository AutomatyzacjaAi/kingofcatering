import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";
import OrdersView from "@/components/admin/OrdersView";
import ClientsView from "@/components/admin/ClientsView";
import DedicatedOffersView from "@/components/admin/DedicatedOffersView";
import ReportsView from "@/components/admin/ReportsView";
import SettingsCompanyView from "@/components/admin/settings/SettingsCompanyView";
import SettingsOrdersView from "@/components/admin/settings/SettingsOrdersView";
import SettingsEventsView from "@/components/admin/settings/SettingsEventsView";
import SettingsCalendarView from "@/components/admin/settings/SettingsCalendarView";
import SettingsDishesView from "@/components/admin/settings/SettingsDishesView";
import SettingsFormView from "@/components/admin/settings/SettingsFormView";
import SettingsDeliveryView from "@/components/admin/settings/SettingsDeliveryView";
import { Loader2 } from "lucide-react";

const TenantAdmin = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/t/${slug}/login`, { replace: true });
        return;
      }

      // Verify user belongs to this tenant
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        navigate(`/t/${slug}/login`, { replace: true });
        return;
      }

      // Verify tenant slug matches
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id, is_active")
        .eq("id", (profile as any).tenant_id)
        .eq("slug", slug)
        .single();

      if (!tenant || !(tenant as any).is_active) {
        await supabase.auth.signOut();
        navigate(`/t/${slug}/login`, { replace: true });
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate(`/t/${slug}/login`, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [slug, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-auto">
        {activeSection === "orders" && <OrdersView />}
        {activeSection === "clients" && <ClientsView />}
        {activeSection === "dedicated-offers" && <DedicatedOffersView />}
        {activeSection === "reports" && <ReportsView />}
        {activeSection === "settings-company" && <SettingsCompanyView />}
        {activeSection === "settings-orders" && <SettingsOrdersView />}
        {activeSection === "settings-events" && <SettingsEventsView />}
        {activeSection === "settings-calendar" && <SettingsCalendarView />}
        {activeSection === "settings-dishes" && <SettingsDishesView />}
        {activeSection === "settings-form" && <SettingsFormView />}
        {activeSection === "settings-delivery" && <SettingsDeliveryView />}
      </main>
    </div>
  );
};

export default TenantAdmin;
