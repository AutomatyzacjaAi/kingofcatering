import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Save, GripVertical, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import ProductPickerDialog, { type CatalogItem } from "./ProductPickerDialog";

interface OfferItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  sort_order: number;
  source_type: string | null;
  source_id: string | null;
}

interface OfferSection {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  items: OfferItem[];
}

interface OfferData {
  id: string;
  token: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  event_name: string;
  event_date_start: string | null;
  event_date_end: string | null;
  status: string;
  notes: string;
}

interface Selection {
  item_id: string;
  selected: boolean;
  quantity: number;
  notes: string;
}

interface Props {
  offerId: string;
  onBack: () => void;
}

const AdminOfferEditor = ({ offerId, onBack }: Props) => {
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [sections, setSections] = useState<OfferSection[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSectionIdx, setPickerSectionIdx] = useState<number>(-1);

  // Editable offer fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [eventName, setEventName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchOffer();
  }, [offerId]);

  const fetchOffer = async () => {
    setLoading(true);
    const { data: offerData } = await supabase
      .from("dedicated_offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (!offerData) { setLoading(false); return; }

    setOffer(offerData);
    setClientName(offerData.client_name);
    setClientEmail(offerData.client_email || "");
    setClientPhone(offerData.client_phone || "");
    setClientCompany(offerData.client_company || "");
    setEventName(offerData.event_name || "");
    setDateStart(offerData.event_date_start || "");
    setDateEnd(offerData.event_date_end || "");
    setNotes(offerData.notes || "");

    const { data: secs } = await supabase
      .from("dedicated_offer_sections")
      .select("*, dedicated_offer_items(*)")
      .eq("offer_id", offerId)
      .order("sort_order");

    const formatted = (secs || []).map((s: any) => ({
      ...s,
      items: (s.dedicated_offer_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }));
    setSections(formatted);

    const { data: existingSel } = await supabase
      .from("dedicated_offer_selections")
      .select("*")
      .eq("offer_id", offerId);

    const selMap: Record<string, Selection> = {};
    (existingSel || []).forEach((s: any) => {
      selMap[s.item_id] = { item_id: s.item_id, selected: s.selected, quantity: s.quantity, notes: s.notes };
    });
    setSelections(selMap);
    setLoading(false);
  };

  // Section management
  const addSection = () => {
    setSections([...sections, {
      id: `new-${crypto.randomUUID()}`,
      name: "",
      icon: "🍽️",
      sort_order: sections.length,
      items: [],
    }]);
  };

  const updateSection = (idx: number, field: string, value: string) => {
    const updated = [...sections];
    (updated[idx] as any)[field] = value;
    setSections(updated);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  // Item management
  const openPickerForSection = (sectionIdx: number) => {
    setPickerSectionIdx(sectionIdx);
    setPickerOpen(true);
  };

  const handlePickerAdd = (items: CatalogItem[]) => {
    if (pickerSectionIdx < 0) return;
    const updated = [...sections];
    const section = updated[pickerSectionIdx];
    const startOrder = section.items.length;
    const newItems: OfferItem[] = items.map((item, i) => ({
      id: `new-${crypto.randomUUID()}`,
      name: item.name,
      description: item.description,
      price: item.price,
      unit_label: item.unit_label,
      sort_order: startOrder + i,
      source_type: item.source_type,
      source_id: item.source_id,
    }));
    section.items = [...section.items, ...newItems];
    setSections(updated);
  };

  const addManualItem = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].items.push({
      id: `new-${crypto.randomUUID()}`,
      name: "",
      description: "",
      price: 0,
      unit_label: "szt.",
      sort_order: updated[sectionIdx].items.length,
      source_type: null,
      source_id: null,
    });
    setSections(updated);
  };

  const updateItem = (sectionIdx: number, itemIdx: number, field: string, value: any) => {
    const updated = [...sections];
    (updated[sectionIdx].items[itemIdx] as any)[field] = value;
    setSections(updated);
  };

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].items = updated[sectionIdx].items.filter((_, i) => i !== itemIdx);
    setSections(updated);
  };

  // Selection management (admin can toggle/set quantities like client)
  const toggleItem = (itemId: string) => {
    setSelections((prev) => {
      const existing = prev[itemId] || { item_id: itemId, selected: false, quantity: 1, notes: "" };
      return { ...prev, [itemId]: { ...existing, selected: !existing.selected } };
    });
  };

  const updateQuantity = (itemId: string, qty: number) => {
    setSelections((prev) => {
      const existing = prev[itemId] || { item_id: itemId, selected: true, quantity: 1, notes: "" };
      return { ...prev, [itemId]: { ...existing, quantity: Math.max(0, qty), selected: qty > 0 } };
    });
  };

  // Save everything
  const handleSave = async () => {
    if (!offer) return;
    setSaving(true);

    // 1. Update offer metadata
    await supabase.from("dedicated_offers").update({
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_company: clientCompany,
      event_name: eventName,
      event_date_start: dateStart || null,
      event_date_end: dateEnd || null,
      notes,
    }).eq("id", offer.id);

    // 2. Delete old sections (cascade deletes items)
    await supabase.from("dedicated_offer_sections").delete().eq("offer_id", offer.id);

    // 3. Re-insert sections and items
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const { data: newSec } = await supabase
        .from("dedicated_offer_sections")
        .insert({ offer_id: offer.id, name: sec.name, icon: sec.icon, sort_order: si })
        .select("id")
        .single();

      if (newSec && sec.items.length > 0) {
        const items = sec.items.map((item, ii) => ({
          section_id: newSec.id,
          name: item.name,
          description: item.description,
          price: item.price,
          unit_label: item.unit_label,
          sort_order: ii,
          source_type: item.source_type,
          source_id: item.source_id,
        }));
        await supabase.from("dedicated_offer_items").insert(items);
      }
    }

    // 4. Re-fetch to get real IDs, then save selections
    const { data: newSecs } = await supabase
      .from("dedicated_offer_sections")
      .select("*, dedicated_offer_items(*)")
      .eq("offer_id", offer.id)
      .order("sort_order");

    // Build a mapping from old item source to new item IDs
    // For selections, we need to re-map if items were recreated
    // Actually: delete old selections, rebuild with new item IDs
    await supabase.from("dedicated_offer_selections").delete().eq("offer_id", offer.id);

    // Re-insert selections based on new item IDs
    // We map by name+price as identifier since items were recreated
    const newItemsMap = new Map<string, string>();
    (newSecs || []).forEach((s: any) => {
      (s.dedicated_offer_items || []).forEach((item: any) => {
        newItemsMap.set(`${item.name}|${item.price}`, item.id);
      });
    });

    // Also map old selections by old item's name+price
    const oldItemsInfo = new Map<string, { name: string; price: number }>();
    sections.forEach((s) => {
      s.items.forEach((item) => {
        oldItemsInfo.set(item.id, { name: item.name, price: item.price });
      });
    });

    const selectionsToInsert: any[] = [];
    Object.entries(selections).forEach(([oldItemId, sel]) => {
      if (!sel.selected && sel.quantity <= 0) return;
      const info = oldItemsInfo.get(oldItemId);
      if (!info) return;
      const newItemId = newItemsMap.get(`${info.name}|${info.price}`);
      if (!newItemId) return;
      selectionsToInsert.push({
        offer_id: offer.id,
        item_id: newItemId,
        selected: sel.selected,
        quantity: sel.quantity,
        notes: sel.notes,
      });
    });

    if (selectionsToInsert.length > 0) {
      await supabase.from("dedicated_offer_selections").insert(selectionsToInsert);
    }

    toast.success("Oferta zapisana");
    setSaving(false);
    // Re-fetch to get fresh data with real IDs
    await fetchOffer();
  };

  const copyLink = () => {
    if (!offer) return;
    const url = `${window.location.origin}/offer/${offer.token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link skopiowany");
  };

  const selectedTotal = sections.reduce((total, section) => {
    return total + section.items.reduce((sTotal, item) => {
      const sel = selections[item.id];
      if (sel?.selected) return sTotal + item.price * sel.quantity;
      return sTotal;
    }, 0);
  }, 0);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Ładowanie...</p></div>;
  }

  if (!offer) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Oferta nie znaleziona</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Edycja oferty</h1>
            <p className="text-sm text-muted-foreground font-mono">/offer/{offer.token}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-1" /> Kopiuj link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/offer/${offer.token}`} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" /> Podgląd klienta
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>

      {/* Client info (collapsible card) */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Dane klienta i wydarzenia</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Imię i nazwisko</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Firma</Label>
              <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Telefon</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Nazwa wydarzenia</Label>
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Od</Label>
                <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Do</Label>
                <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs">Notatki wewnętrzne</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-16" />
          </div>
        </CardContent>
      </Card>

      {/* Sections - admin view like client but editable */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Sekcje oferty</h2>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="w-4 h-4 mr-1" /> Dodaj sekcję
          </Button>
        </div>

        {sections.map((section, si) => (
          <div key={section.id} className="space-y-3">
            {/* Section header - editable */}
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Input
                value={section.icon}
                onChange={(e) => updateSection(si, "icon", e.target.value)}
                className="w-14 text-center"
              />
              <Input
                value={section.name}
                onChange={(e) => updateSection(si, "name", e.target.value)}
                placeholder="Nazwa sekcji"
                className="flex-1 font-semibold"
              />
              <Button variant="ghost" size="icon" onClick={() => removeSection(si)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            {/* Items - like client view but with edit controls */}
            <div className="space-y-2 ml-6">
              {section.items.map((item, ii) => {
                const sel = selections[item.id];
                const isSelected = sel?.selected || false;

                return (
                  <Card
                    key={item.id}
                    className={`transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(si, ii, "name", e.target.value)}
                              className="font-medium h-8 text-sm"
                              placeholder="Nazwa pozycji"
                            />
                            {item.source_type && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {item.source_type === "dish" ? "Danie" :
                                 item.source_type === "bundle" ? "Pakiet" :
                                 item.source_type === "bundle_variant" ? "Wariant" :
                                 item.source_type === "configurable_set" ? "Zestaw" :
                                 item.source_type === "extra" ? "Dodatek" : ""}
                              </Badge>
                            )}
                          </div>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(si, ii, "description", e.target.value)}
                            className="h-7 text-xs text-muted-foreground"
                            placeholder="Opis (opcjonalnie)"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <Input
                              type="number"
                              min={1}
                              value={sel?.quantity || 1}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                              className="w-16 h-8 text-center text-sm"
                            />
                          )}
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(si, ii, "price", Number(e.target.value))}
                            className="w-20 h-8 text-right text-sm"
                            step="0.01"
                          />
                          <Input
                            value={item.unit_label}
                            onChange={(e) => updateItem(si, ii, "unit_label", e.target.value)}
                            className="w-14 h-8 text-center text-xs"
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(si, ii)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openPickerForSection(si)} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Z katalogu
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addManualItem(si)} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Ręcznie
                </Button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Brak sekcji. Dodaj pierwszą sekcję oferty.</p>
            <Button variant="outline" size="sm" onClick={addSection}>
              <Plus className="w-4 h-4 mr-1" /> Dodaj sekcję
            </Button>
          </div>
        )}
      </div>

      {/* Footer with total */}
      <Card className="sticky bottom-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Suma wybranych pozycji:</p>
            <p className="text-xl font-bold text-foreground">{selectedTotal.toFixed(2)} zł</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Zapisywanie..." : "Zapisz ofertę"}
          </Button>
        </CardContent>
      </Card>

      <ProductPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handlePickerAdd}
      />
    </div>
  );
};

export default AdminOfferEditor;
