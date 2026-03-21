import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  source_type: "dish" | "bundle" | "bundle_variant" | "configurable_set" | "extra";
  source_id: string;
  parent_name?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (items: CatalogItem[]) => void;
}

const ProductPickerDialog = ({ open, onClose, onAdd }: Props) => {
  const [search, setSearch] = useState("");
  const [dishes, setDishes] = useState<CatalogItem[]>([]);
  const [bundles, setBundles] = useState<CatalogItem[]>([]);
  const [sets, setSets] = useState<CatalogItem[]>([]);
  const [extras, setExtras] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allItems, setAllItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchAll();
    setSelected(new Set());
    setSearch("");
  }, [open]);

  const fetchAll = async () => {
    const [dishesRes, bundlesRes, variantsRes, setsRes, extrasRes] = await Promise.all([
      supabase.from("dishes").select("id, name, description, price_brutto, unit_label").order("name"),
      supabase.from("bundles").select("id, name, description, price_brutto").order("name"),
      supabase.from("bundle_variants").select("id, name, description, price, bundle_id, bundles(name)").order("name"),
      supabase.from("configurable_sets").select("id, name, description, price_per_person").order("name"),
      supabase.from("extras").select("id, name, description, price, unit_label").order("name"),
    ]);

    const d: CatalogItem[] = (dishesRes.data || []).map((r: any) => ({
      id: `dish-${r.id}`, name: r.name, description: r.description || "",
      price: r.price_brutto || 0, unit_label: r.unit_label || "szt.",
      source_type: "dish", source_id: r.id,
    }));

    const b: CatalogItem[] = (bundlesRes.data || []).map((r: any) => ({
      id: `bundle-${r.id}`, name: r.name, description: r.description || "",
      price: r.price_brutto || 0, unit_label: "szt.",
      source_type: "bundle", source_id: r.id,
    }));

    const bv: CatalogItem[] = (variantsRes.data || []).map((r: any) => ({
      id: `bv-${r.id}`, name: r.name, description: r.description || "",
      price: r.price || 0, unit_label: "szt.",
      source_type: "bundle_variant", source_id: r.id,
      parent_name: (r as any).bundles?.name,
    }));

    const s: CatalogItem[] = (setsRes.data || []).map((r: any) => ({
      id: `set-${r.id}`, name: r.name, description: r.description || "",
      price: r.price_per_person || 0, unit_label: "os.",
      source_type: "configurable_set", source_id: r.id,
    }));

    const e: CatalogItem[] = (extrasRes.data || []).map((r: any) => ({
      id: `extra-${r.id}`, name: r.name, description: r.description || "",
      price: r.price || 0, unit_label: r.unit_label || "szt.",
      source_type: "extra", source_id: r.id,
    }));

    setDishes(d);
    setBundles([...b, ...bv]);
    setSets(s);
    setExtras(e);
    setAllItems([...d, ...b, ...bv, ...s, ...e]);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const items = allItems.filter((i) => selected.has(i.id));
    onAdd(items);
    onClose();
  };

  const filterItems = (items: CatalogItem[]) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  };

  const renderList = (items: CatalogItem[]) => {
    const filtered = filterItems(items);
    if (filtered.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">Brak wyników</p>;
    return (
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              selected.has(item.id) ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.name}
                {item.parent_name && <span className="text-muted-foreground"> ({item.parent_name})</span>}
              </p>
              {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
            </div>
            <span className="text-sm font-medium text-primary whitespace-nowrap">
              {item.price.toFixed(2)} zł/{item.unit_label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Dodaj pozycje z katalogu</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj produktów..."
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="dishes" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="dishes" className="flex-1">Dania ({dishes.length})</TabsTrigger>
            <TabsTrigger value="bundles" className="flex-1">Pakiety ({bundles.length})</TabsTrigger>
            <TabsTrigger value="sets" className="flex-1">Zestawy ({sets.length})</TabsTrigger>
            <TabsTrigger value="extras" className="flex-1">Dodatki ({extras.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="dishes" className="flex-1 overflow-hidden">{renderList(dishes)}</TabsContent>
          <TabsContent value="bundles" className="flex-1 overflow-hidden">{renderList(bundles)}</TabsContent>
          <TabsContent value="sets" className="flex-1 overflow-hidden">{renderList(sets)}</TabsContent>
          <TabsContent value="extras" className="flex-1 overflow-hidden">{renderList(extras)}</TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Wybrano: {selected.size}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Anuluj</Button>
            <Button onClick={handleAdd} disabled={selected.size === 0}>
              <Plus className="w-4 h-4 mr-1" /> Dodaj ({selected.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPickerDialog;
export type { CatalogItem };
