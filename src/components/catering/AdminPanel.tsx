import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Users, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItemId = "dashboard" | "analytics" | "settings" | "users" | "more" | null;

const sidebarItems = [
  { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
  { id: "analytics" as const, icon: BarChart3, label: "Statystyki" },
  { id: "settings" as const, icon: Settings, label: "Ustawienia" },
  { id: "users" as const, icon: Users, label: "Użytkownicy" },
  { id: "more" as const, icon: MoreHorizontal, label: "Więcej" },
];

const menuContent: Record<Exclude<MenuItemId, null>, { title: string; item: string }> = {
  dashboard: { title: "Panel główny", item: "Przegląd zamówień" },
  analytics: { title: "Statystyki", item: "Raport sprzedaży" },
  settings: { title: "Ustawienia", item: "Konfiguracja systemu" },
  users: { title: "Użytkownicy", item: "Lista klientów" },
  more: { title: "Więcej opcji", item: "Eksport danych" },
};

export function AdminPanel() {
  const [activeMenu, setActiveMenu] = useState<MenuItemId>(null);

  const handleIconClick = (id: MenuItemId) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <Card className="border-0 shadow-none bg-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">
          Panel administracyjny
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Zarządzaj swoimi zamówieniami
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Sidebar z ikonami */}
          <div className="flex flex-col gap-2 py-2 border-r border-border pr-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleIconClick(item.id)}
                className={cn(
                  "p-3 rounded-lg transition-all duration-200",
                  "hover:bg-muted/50",
                  activeMenu === item.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground"
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Menu rozwijane */}
          <div className="flex-1 min-w-[200px]">
            {activeMenu ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground">
                    {menuContent[activeMenu].title}
                  </h3>
                </div>
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group">
                    <span className="text-sm text-foreground">
                      {menuContent[activeMenu].item}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
                Wybierz opcję z menu
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
