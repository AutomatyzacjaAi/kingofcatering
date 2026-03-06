import { useState } from "react";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";
import OrdersView from "@/components/admin/OrdersView";
import ClientsView from "@/components/admin/ClientsView";
import SettingsCompanyView from "@/components/admin/settings/SettingsCompanyView";
import SettingsOrdersView from "@/components/admin/settings/SettingsOrdersView";
import SettingsEventsView from "@/components/admin/settings/SettingsEventsView";
import SettingsCalendarView from "@/components/admin/settings/SettingsCalendarView";
import SettingsDishesView from "@/components/admin/settings/SettingsDishesView";

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-8 overflow-auto">
        {activeSection === "orders" && <OrdersView />}
        {activeSection === "clients" && <ClientsView />}
        {activeSection === "settings-company" && <SettingsCompanyView />}
        {activeSection === "settings-orders" && <SettingsOrdersView />}
        {activeSection === "settings-events" && <SettingsEventsView />}
        {activeSection === "settings-calendar" && <SettingsCalendarView />}
        {activeSection === "settings-dishes" && <SettingsDishesView />}
      </main>
    </div>
  );
};

export default Admin;
