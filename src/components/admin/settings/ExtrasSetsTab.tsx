import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Search, X, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface ExtrasCategory {
  id: string;
  name: string;
  slug: string;
}

interface Extra {
  id: string;
  name: string;
  price: number;
  priceBrutto: number;
  unitLabel: string;
  extrasCategoryId: string | null;
}

interface ExtrasSetItem {
  id: string;
  extraId: string | null;
  name: string;
  sortOrder: number;
}

interface ExtrasSet {
  id: string;
  name: string;
  description: string;
  extrasCategoryId: string | null;
  minSelections: number;
  maxSelections: number;
  price: number;
  priceOnSite: number | null;
  sortOrder: number;
  items: ExtrasSetItem[];
}

type Props = {
  extrasSets: ExtrasSet[];
  extras: Extra[];
  extrasCategories: ExtrasCategory[];
  reload: () => void;
};

export function ExtrasSetsTab({ extrasSets, extras, extrasCategories, reload }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [formMin, setFormMin] = useState(1);
  const [formMax, setFormMax] = useState(3);
  const [formPrice, setFormPrice] = useState(0);
  const [formPriceOnSite, setFormPriceOnSite] = useState<number | null>(null);
  const [formItems, setFormItems] = useState<ExtrasSetItem[]>([]);

  const filtered = extrasSets.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormCategoryId(null);
    setFormMin(1); setFormMax(3); setFormPrice(0); setFormPriceOnSite(null);
    setFormItems([]);
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (s: ExtrasSet) => {
    setEditingId(s.id);
    setFormName(s.name); setFormDesc(s.description);
    setFormCategoryId(s.extrasCategoryId);
    setFormMin(s.minSelections); setFormMax(s.maxSelections);
    setFormPrice(s.price); setFormPriceOnSite(s.priceOnSite);
    setFormItems(s.items.map(i => ({ ...i })));
    setShowForm(true);
  };

  const addExtra = (extraId: string) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return;
    if (formItems.some(i => i.extraId === extraId)) {
      toast.error("Ten dodatek jest już w zestawie");
      return;
    }
    setFormItems([...formItems, {
      id: crypto.randomUUID(),
      extraId,
      name: extra.name,
      sortOrder: formItems.length,
    }]);
  };

  const removeItem = (idx: number) => {
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Podaj nazwę zestawu"); return; }
    if (formItems.length === 0) { toast.error("Dodaj przynajmniej jeden dodatek"); return; }
    setSaving(true);

    try {
      let setId = editingId;

      if (editingId) {
        await supabase.from("extras_sets").update({
          name: formName, description: formDesc,
          extras_category_id: formCategoryId,
          min_selections: formMin, max_selections: formMax,
          price: formPrice, price_on_site: formPriceOnSite,
        }).eq("id", editingId);
        await supabase.from("extras_set_items").delete().eq("set_id", editingId);
      } else {
        const { data, error } = await supabase.from("extras_sets").insert({
          name: formName, description: formDesc,
          extras_category_id: formCategoryId,
          min_selections: formMin, max_selections: formMax,
          price: formPrice, price_on_site: formPriceOnSite,
        }).select("id").single();
        if (error || !data) { toast.error("Błąd zapisu"); setSaving(false); return; }
        setId = data.id;
      }

      if (setId && formItems.length > 0) {
        await supabase.from("extras_set_items").insert(
          formItems.map((item, idx) => ({
            set_id: setId!,
            extra_id: item.extraId,
            name: item.name,
            sort_order: idx,
          }))
        );
      }

      toast.success(editingId ? "Zapisano zestaw" : "Dodano zestaw");
      resetForm();
      reload();
    } catch {
      toast.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten zestaw?")) return;
    await supabase.from("extras_set_items").delete().eq("set_id", id);
    await supabase.from("extras_sets").delete().eq("id", id);
    toast.success("Usunięto");
    reload();
  };

  // Available extras for picker (optionally filter by selected category)
  const availableExtras = extras;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj zestawu..." className="pl-9 h-9" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />Dodaj zestaw
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editingId ? "Edytuj zestaw" : "Nowy zestaw dodatków"}</h4>
              <button onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nazwa</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="np. Zestaw barowy" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Kategoria dodatków</Label>
                <Select value={formCategoryId ?? ""} onValueChange={v => setFormCategoryId(v || null)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                  <SelectContent>
                    {extrasCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Opis</Label>
              <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Krótki opis zestawu" className="h-8 text-sm" />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Min. wyborów</Label>
                <Input type="number" value={formMin} onChange={e => setFormMin(Number(e.target.value))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Max. wyborów</Label>
                <Input type="number" value={formMax} onChange={e => setFormMax(Number(e.target.value))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Cena zestawu</Label>
                <Input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Cena na sali</Label>
                <Input type="number" step="0.01" value={formPriceOnSite ?? ""} onChange={e => setFormPriceOnSite(e.target.value ? Number(e.target.value) : null)} className="h-8 text-sm" placeholder="—" />
              </div>
            </div>

            {/* Items in set */}
            <div className="space-y-2">
              <Label className="text-xs">Dodatki w zestawie ({formItems.length})</Label>
              {formItems.length > 0 && (
                <div className="space-y-1 border border-border rounded-md p-2">
                  {formItems.map((item, idx) => {
                    const extra = extras.find(e => e.id === item.extraId);
                    return (
                      <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 text-xs">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                        <span className="flex-1 font-medium">{item.name}</span>
                        {extra && <span className="text-muted-foreground">{extra.priceBrutto?.toFixed(2) ?? extra.price?.toFixed(2)} zł/{extra.unitLabel}</span>}
                        <button onClick={() => removeItem(idx)} className="p-0.5 hover:text-destructive text-muted-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Extras picker */}
              <ExtrasPicker extras={availableExtras} selectedIds={formItems.map(i => i.extraId).filter(Boolean) as string[]} onSelect={addExtra} />
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
          <p className="text-sm text-muted-foreground text-center py-8">Brak zestawów dodatków</p>
        )}
        {filtered.map(s => (
          <Card key={s.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{s.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {s.items.length} pozycji
                  </Badge>
                  {s.minSelections > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {s.minSelections}–{s.maxSelections} wyborów
                    </Badge>
                  )}
                </div>
                {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                {s.items.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {s.items.map(i => i.name).join(" · ")}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">{s.price.toFixed(2)} zł</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExtrasPicker({ extras, selectedIds, onSelect }: { extras: Extra[]; selectedIds: string[]; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const available = extras.filter(e => !selectedIds.includes(e.id) && e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj dodatku do dodania..." className="h-7 text-xs pl-8" />
      </div>
      <div className="max-h-32 overflow-y-auto space-y-0.5 border border-border rounded-md p-1">
        {available.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Brak dostępnych dodatków</p>}
        {available.map(e => (
          <button key={e.id} type="button" onClick={() => onSelect(e.id)}
            className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between hover:bg-muted transition-colors">
            <span className="font-medium">{e.name}</span>
            <span className="text-[10px] opacity-70">{e.priceBrutto?.toFixed(2) ?? e.price?.toFixed(2)} zł</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExtrasSetsTab;
