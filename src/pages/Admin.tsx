import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");
  const { isAuthenticated, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} onLogout={logout} />
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

export default Admin;
