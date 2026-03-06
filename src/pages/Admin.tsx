import { useState } from "react";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";
import OrdersView from "@/components/admin/OrdersView";
import ClientsView from "@/components/admin/ClientsView";
import SettingsView from "@/components/admin/SettingsView";

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-8 overflow-auto">
        {activeSection === "orders" && <OrdersView />}
        {activeSection === "clients" && <ClientsView />}
        {activeSection === "settings" && <SettingsView />}
      </main>
    </div>
  );
};

export default Admin;
