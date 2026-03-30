import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, Search, X, Loader2, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface Dish {
  id: string;
  name: string;
  priceBrutto: number;
}

interface MenuGroupItem {
  id: string;
  dishId: string | null;
  name: string;
  sortOrder: number;
}

interface MenuGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  items: MenuGroupItem[];
}

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  priceOnSite: number | null;
  isConfigurable: boolean;
  icon: string;
  sortOrder: number;
  groups: MenuGroup[];
}

type Props = {
  menus: Menu[];
  dishes: Dish[];
  reload: () => void;
};

export function MenusTab({ menus, dishes, reload }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formPriceOnSite, setFormPriceOnSite] = useState<number | null>(null);
  const [formConfigurable, setFormConfigurable] = useState(false);
  const [formIcon, setFormIcon] = useState("📋");
  const [formGroups, setFormGroups] = useState<MenuGroup[]>([]);

  const filtered = menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormPrice(0); setFormPriceOnSite(null);
    setFormConfigurable(false); setFormIcon("📋");
    setFormGroups([]);
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (m: Menu) => {
    setEditingId(m.id);
    setFormName(m.name); setFormDesc(m.description);
    setFormPrice(m.price); setFormPriceOnSite(m.priceOnSite);
    setFormConfigurable(m.isConfigurable); setFormIcon(m.icon);
    setFormGroups(m.groups.map(g => ({
      ...g,
      items: g.items.map(i => ({ ...i })),
    })));
    setShowForm(true);
  };

  const addGroup = () => {
    setFormGroups([...formGroups, {
      id: crypto.randomUUID(),
      name: "",
      minSelections: 1,
      maxSelections: 1,
      sortOrder: formGroups.length,
      items: [],
    }]);
  };

  const removeGroup = (idx: number) => {
    setFormGroups(formGroups.filter((_, i) => i !== idx));
  };

  const updateGroup = (idx: number, updates: Partial<MenuGroup>) => {
    setFormGroups(formGroups.map((g, i) => i === idx ? { ...g, ...updates } : g));
  };

  const addDishToGroup = (groupIdx: number, dish: Dish) => {
    const group = formGroups[groupIdx];
    if (group.items.some(i => i.dishId === dish.id)) {
      toast.error("To danie jest już w tej grupie");
      return;
    }
    updateGroup(groupIdx, {
      items: [...group.items, {
        id: crypto.randomUUID(),
        dishId: dish.id,
        name: dish.name,
        sortOrder: group.items.length,
      }],
    });
  };

  const removeItemFromGroup = (groupIdx: number, itemIdx: number) => {
    const group = formGroups[groupIdx];
    updateGroup(groupIdx, {
      items: group.items.filter((_, i) => i !== itemIdx),
    });
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Podaj nazwę menu"); return; }
    if (formGroups.length === 0) { toast.error("Dodaj przynajmniej jedną grupę"); return; }
    if (formGroups.some(g => g.items.length === 0)) { toast.error("Każda grupa musi mieć przynajmniej jedną pozycję"); return; }
    setSaving(true);

    try {
      let menuId = editingId;

      if (editingId) {
        await supabase.from("menus" as any).update({
          name: formName, description: formDesc,
          price: formPrice, price_on_site: formPriceOnSite,
          is_configurable: formConfigurable, icon: formIcon,
        } as any).eq("id", editingId);

        // Delete old groups (cascade deletes items)
        await supabase.from("menu_groups" as any).delete().eq("menu_id", editingId);
      } else {
        const { data, error } = await supabase.from("menus" as any).insert({
          name: formName, description: formDesc,
          price: formPrice, price_on_site: formPriceOnSite,
          is_configurable: formConfigurable, icon: formIcon,
        } as any).select("id").single();
        if (error || !data) { toast.error("Błąd zapisu"); setSaving(false); return; }
        menuId = (data as any).id;
      }

      // Insert groups + items
      for (let gi = 0; gi < formGroups.length; gi++) {
        const g = formGroups[gi];
        const { data: gData } = await supabase.from("menu_groups" as any).insert({
          menu_id: menuId,
          name: g.name,
          min_selections: formConfigurable ? g.minSelections : g.items.length,
          max_selections: formConfigurable ? g.maxSelections : g.items.length,
          sort_order: gi,
        } as any).select("id").single();

        if (gData && g.items.length > 0) {
          await supabase.from("menu_group_items" as any).insert(
            g.items.map((item, ii) => ({
              group_id: (gData as any).id,
              dish_id: item.dishId,
              name: item.name,
              sort_order: ii,
            }))
          );
        }
      }

      toast.success(editingId ? "Zapisano menu" : "Dodano menu");
      resetForm();
      reload();
    } catch {
      toast.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć to menu?")) return;
    await supabase.from("menus" as any).delete().eq("id", id);
    toast.success("Usunięto");
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj menu..." className="pl-9 h-9" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />Dodaj menu
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editingId ? "Edytuj menu" : "Nowe menu"}</h4>
              <button onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nazwa</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="np. Menu nr 1" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Ikona</Label>
                <Input value={formIcon} onChange={e => setFormIcon(e.target.value)} className="h-8 text-sm w-20" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Opis</Label>
              <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Krótki opis menu" className="h-8 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Cena</Label>
                <Input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Cena na sali</Label>
                <Input type="number" step="0.01" value={formPriceOnSite ?? ""} onChange={e => setFormPriceOnSite(e.target.value ? Number(e.target.value) : null)} className="h-8 text-sm" placeholder="—" />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={formConfigurable} onCheckedChange={setFormConfigurable} />
                <Label className="text-xs">{formConfigurable ? "Konfigurowalne" : "Stałe"}</Label>
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Grupy ({formGroups.length})</Label>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addGroup}>
                  <Plus className="w-3 h-3 mr-1" />Dodaj grupę
                </Button>
              </div>

              {formGroups.map((group, gi) => (
                <div key={group.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={group.name} onChange={e => updateGroup(gi, { name: e.target.value })}
                      placeholder="np. Zupa, Danie główne, Deser" className="h-7 text-xs flex-1" />
                    {formConfigurable && (
                      <>
                        <div className="flex items-center gap-1">
                          <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Min</Label>
                          <Input type="number" value={group.minSelections} onChange={e => updateGroup(gi, { minSelections: Number(e.target.value) })} className="h-7 w-14 text-xs" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Max</Label>
                          <Input type="number" value={group.maxSelections} onChange={e => updateGroup(gi, { maxSelections: Number(e.target.value) })} className="h-7 w-14 text-xs" />
                        </div>
                      </>
                    )}
                    <button onClick={() => removeGroup(gi)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Items in group */}
                  {group.items.length > 0 && (
                    <div className="space-y-0.5 ml-5">
                      {group.items.map((item, ii) => (
                        <div key={item.id} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 text-xs">
                          <span className="flex-1">{item.name}</span>
                          <button onClick={() => removeItemFromGroup(gi, ii)} className="p-0.5 text-muted-foreground hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dish picker for this group */}
                  <div className="ml-5">
                    <GroupDishPicker
                      dishes={dishes}
                      selectedIds={group.items.map(i => i.dishId).filter(Boolean) as string[]}
                      onSelect={(dish) => addDishToGroup(gi, dish)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>Anuluj</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {editingId ? "Zapisz" : "Dodaj"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-8">Brak menu — dodaj pierwsze</p>
        )}
        {filtered.map(m => (
          <Card key={m.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="p-0.5 text-muted-foreground">
                  {expandedId === m.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <span className="text-lg">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.name}</span>
                    <Badge variant={m.isConfigurable ? "default" : "secondary"} className="text-[10px]">
                      {m.isConfigurable ? "Konfigurowalne" : "Stałe"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {m.groups.length} grup · {m.groups.reduce((s, g) => s + g.items.length, 0)} pozycji
                    </Badge>
                  </div>
                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">{m.price.toFixed(2)} zł</span>
                {m.priceOnSite != null && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">na sali: {m.priceOnSite.toFixed(2)} zł</span>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(m)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded view */}
              {expandedId === m.id && (
                <div className="mt-3 ml-10 space-y-2">
                  {m.groups.map(g => (
                    <div key={g.id}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {g.name}
                        {m.isConfigurable && <span className="ml-1 font-normal">({g.minSelections}–{g.maxSelections} wyborów)</span>}
                      </p>
                      <div className="ml-3 space-y-0.5 mt-1">
                        {g.items.map(item => (
                          <p key={item.id} className="text-xs text-foreground">• {item.name}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GroupDishPicker({ dishes, selectedIds, onSelect }: { dishes: { id: string; name: string; priceBrutto: number }[]; selectedIds: string[]; onSelect: (dish: { id: string; name: string; priceBrutto: number }) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const available = dishes.filter(d => !selectedIds.includes(d.id) && d.name.toLowerCase().includes(search.toLowerCase()));

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3 mr-1" />Dodaj pozycję z katalogu
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj dania..." className="h-6 text-[10px] pl-6" autoFocus />
        </div>
        <button onClick={() => { setOpen(false); setSearch(""); }} className="p-0.5 text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-0.5 border border-border rounded p-1">
        {available.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-1">Brak dań</p>}
        {available.map(d => (
          <button key={d.id} type="button"
            onClick={() => { onSelect(d); }}
            className="w-full text-left px-2 py-1 rounded text-[10px] flex items-center justify-between hover:bg-muted transition-colors">
            <span>{d.name}</span>
            <span className="opacity-60">{d.priceBrutto.toFixed(2)} zł</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenusTab;
