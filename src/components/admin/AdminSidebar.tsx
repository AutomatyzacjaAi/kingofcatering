import { ClipboardList, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSection = "orders" | "clients" | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navItems: { id: AdminSection; icon: typeof ClipboardList; label: string }[] = [
  { id: "orders", icon: ClipboardList, label: "Zamówienia" },
  { id: "clients", icon: Users, label: "Klienci" },
  { id: "settings", icon: Settings, label: "Ustawienia" },
];

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <aside className="w-56 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">KC</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm leading-tight">King of Catering</h2>
            <p className="text-muted-foreground text-xs">Panel administracyjny</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeSection === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" />
          Wyloguj
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
