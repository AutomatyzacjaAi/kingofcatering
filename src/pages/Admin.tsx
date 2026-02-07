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

const Admin = () => {
  const [activeMenu, setActiveMenu] = useState<MenuItemId>(null);

  const handleIconClick = (id: MenuItemId) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar z ikonami */}
        <div className="w-16 min-h-screen border-r border-border bg-card flex flex-col items-center py-6 gap-2">
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
        <div className={cn(
          "w-64 min-h-screen border-r border-border bg-card transition-all duration-200",
          activeMenu ? "opacity-100" : "opacity-50"
        )}>
          {activeMenu ? (
            <div className="p-4 animate-in fade-in slide-in-from-left-2 duration-200">
              <h3 className="font-semibold text-foreground mb-4">
                {menuContent[activeMenu].title}
              </h3>
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
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Wybierz opcję
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 p-8">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                Panel administracyjny
              </CardTitle>
              <p className="text-muted-foreground">
                Zarządzaj swoimi zamówieniami i ustawieniami
              </p>
            </CardHeader>
            <CardContent>
              {activeMenu ? (
                <div className="bg-muted/20 rounded-lg p-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    {menuContent[activeMenu].title}
                  </h2>
                  <p className="text-muted-foreground">
                    Zawartość sekcji "{menuContent[activeMenu].item}" pojawi się tutaj.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/20 rounded-lg p-8 text-center text-muted-foreground">
                  Wybierz opcję z menu po lewej stronie
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
