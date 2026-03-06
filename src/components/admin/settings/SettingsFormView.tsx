import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Pencil, icons } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

type LucideIconName = keyof typeof icons;

// ===== TYPES =====
interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIconName;
}

interface EventType {
  id: string;
  name: string;
  icon: LucideIconName;
  allowedCategoryIds: string[];
}

// ===== MOCK DATA =====
const defaultCategories: ProductCategory[] = [
  { id: "patery", name: "Patery", description: "Gotowe kompozycje na każdą okazję", icon: "Salad" },
  { id: "mini", name: "Mini", description: "Małe przekąski z wieloma wariantami", icon: "Cookie" },
  { id: "zestawy", name: "Zestawy", description: "Pełne menu do konfiguracji", icon: "UtensilsCrossed" },
];

const defaultEvents: EventType[] = [
  { id: "1", name: "Wesele", icon: "Heart", allowedCategoryIds: ["patery", "mini", "zestawy"] },
  { id: "2", name: "Konferencja", icon: "Presentation", allowedCategoryIds: ["patery", "mini", "zestawy"] },
  { id: "3", name: "Urodziny", icon: "Gift", allowedCategoryIds: ["patery", "mini"] },
  { id: "4", name: "Spotkanie firmowe", icon: "Briefcase", allowedCategoryIds: ["patery", "zestawy"] },
  { id: "5", name: "Impreza", icon: "Music", allowedCategoryIds: ["patery", "mini"] },
  { id: "6", name: "Inne", icon: "CalendarDays", allowedCategoryIds: ["patery", "mini", "zestawy"] },
];

// ===== ICON PICKER (reused) =====
const popularIcons: LucideIconName[] = [
  "Salad", "Cookie", "UtensilsCrossed", "Pizza", "Sandwich", "Soup",
  "Beef", "Fish", "Egg", "Apple", "CakeSlice", "Candy",
  "Wine", "Coffee", "GlassWater", "Drumstick", "Popcorn", "Cherry",
];

const IconPickerSmall = ({ value, onChange }: { value: LucideIconName; onChange: (v: LucideIconName) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const CurrentIcon = icons[value];

  const allIcons = search.trim()
    ? (Object.keys(icons) as LucideIconName[]).filter((n) => n.toLowerCase().includes(search.toLowerCase())).slice(0, 30)
    : popularIcons;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors", open && "bg-muted ring-1 ring-primary")}
      >
        <CurrentIcon className="w-4 h-4 text-foreground" />
      </button>
      {open && (
        <div className="absolute top-11 left-0 z-50 w-64 bg-popover border border-border rounded-xl shadow-lg p-3 space-y-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj ikony..." className="h-8 text-xs" autoFocus />
          <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
            {allIcons.map((name) => {
              const Icon = icons[name];
              return (
                <button key={name} type="button" onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                  className={cn("w-8 h-8 rounded-md flex items-center justify-center hover:bg-accent transition-colors", value === name && "bg-primary text-primary-foreground")}
                  title={name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          {allIcons.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Brak wyników</p>}
        </div>
      )}
    </div>
  );
};

// ===== MAIN =====
const SettingsFormView = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(defaultCategories);
  const [events, setEvents] = useState<EventType[]>(defaultEvents);

  // New category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<LucideIconName>("Salad");

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setCategories([...categories, { id, name: newCatName.trim(), description: newCatDesc.trim(), icon: newCatIcon }]);
    setNewCatName("");
    setNewCatDesc("");
    setNewCatIcon("Salad");
    setShowCatForm(false);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    // Also remove from events
    setEvents(events.map((e) => ({ ...e, allowedCategoryIds: e.allowedCategoryIds.filter((cid) => cid !== id) })));
  };

  const toggleCategoryForEvent = (eventId: string, categoryId: string) => {
    setEvents(events.map((e) => {
      if (e.id !== eventId) return e;
      const has = e.allowedCategoryIds.includes(categoryId);
      return {
        ...e,
        allowedCategoryIds: has
          ? e.allowedCategoryIds.filter((cid) => cid !== categoryId)
          : [...e.allowedCategoryIds, categoryId],
      };
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Formularz</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj kategoriami produktów i ich dostępnością dla rodzajów wydarzeń</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Kategorie produktów</CardTitle>
                <CardDescription>Dodawaj i zarządzaj kategoriami widocznymi w formularzu zamówienia</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCatForm(!showCatForm)}>
                <Plus className="w-4 h-4 mr-1" />
                Dodaj kategorię
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showCatForm && (
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-start gap-3">
                  <IconPickerSmall value={newCatIcon} onChange={setNewCatIcon} />
                  <div className="flex-1 space-y-2">
                    <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nazwa kategorii" />
                    <Input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} placeholder="Krótki opis (opcjonalnie)" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCategory} disabled={!newCatName.trim()}>Dodaj</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCatForm(false)}>Anuluj</Button>
                </div>
              </div>
            )}

            {categories.map((cat) => {
              const CatIcon = icons[cat.icon];
              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <CatIcon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cat.name}</p>
                    {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                  </div>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Event → Category mapping */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategorie dla rodzajów wydarzeń</CardTitle>
            <CardDescription>Określ, które kategorie produktów są widoczne dla danego typu wydarzenia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => {
                const EventIcon = icons[event.icon];
                return (
                  <div key={event.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <EventIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{event.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isChecked = event.allowedCategoryIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs font-medium",
                              isChecked
                                ? "bg-accent border-primary/30 text-accent-foreground"
                                : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleCategoryForEvent(event.id, cat.id)}
                              className="w-3.5 h-3.5"
                            />
                            {cat.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto">Zapisz zmiany</Button>
      </div>
    </div>
  );
};

export default SettingsFormView;
