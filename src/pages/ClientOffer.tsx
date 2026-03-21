import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CalendarDays, Check, Save } from "lucide-react";

interface OfferItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  sort_order: number;
}

interface OfferSection {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  items: OfferItem[];
}

interface Offer {
  id: string;
  token: string;
  client_name: string;
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

const ClientOffer = () => {
  const { token } = useParams<{ token: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [sections, setSections] = useState<OfferSection[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchOffer();
  }, [token]);

  const fetchOffer = async () => {
    const { data: offerData } = await supabase
      .from("dedicated_offers")
      .select("*")
      .eq("token", token)
      .single();

    if (!offerData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setOffer(offerData);

    // Mark as viewed if draft/sent
    if (offerData.status === "draft" || offerData.status === "sent") {
      await supabase.from("dedicated_offers").update({ status: "viewed" }).eq("id", offerData.id);
    }

    // Fetch sections with items
    const { data: secs } = await supabase
      .from("dedicated_offer_sections")
      .select("*, dedicated_offer_items(*)")
      .eq("offer_id", offerData.id)
      .order("sort_order");

    const formattedSections = (secs || []).map((s: any) => ({
      ...s,
      items: (s.dedicated_offer_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }));
    setSections(formattedSections);

    // Fetch existing selections
    const { data: existingSelections } = await supabase
      .from("dedicated_offer_selections")
      .select("*")
      .eq("offer_id", offerData.id);

    const selMap: Record<string, Selection> = {};
    (existingSelections || []).forEach((s: any) => {
      selMap[s.item_id] = { item_id: s.item_id, selected: s.selected, quantity: s.quantity, notes: s.notes };
    });
    setSelections(selMap);
    setLoading(false);
  };

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

  const handleSave = async () => {
    if (!offer) return;
    setSaving(true);

    // Delete existing selections and re-insert
    await supabase.from("dedicated_offer_selections").delete().eq("offer_id", offer.id);

    const toInsert = Object.values(selections).filter((s) => s.selected || s.quantity > 0);
    if (toInsert.length > 0) {
      await supabase.from("dedicated_offer_selections").insert(
        toInsert.map((s) => ({
          offer_id: offer.id,
          item_id: s.item_id,
          selected: s.selected,
          quantity: s.quantity,
          notes: s.notes,
        }))
      );
    }

    toast.success("Wybory zostały zapisane!");
    setSaving(false);
  };

  const selectedTotal = sections.reduce((total, section) => {
    return total + section.items.reduce((sTotal, item) => {
      const sel = selections[item.id];
      if (sel?.selected) return sTotal + item.price * sel.quantity;
      return sTotal;
    }, 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Ładowanie oferty...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Oferta nie znaleziona</h1>
          <p className="text-muted-foreground">Link do oferty jest nieprawidłowy lub oferta została usunięta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-foreground text-lg">{offer?.event_name || "Oferta dedykowana"}</h1>
            {offer?.event_date_start && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {offer.event_date_start}
                {offer.event_date_end && ` — ${offer.event_date_end}`}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            OFERTA DEDYKOWANA
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-28">
        {/* Client info */}
        {offer?.client_name && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Przygotowana dla:</p>
              <p className="font-semibold text-foreground">
                {offer.client_name}
                {offer.client_company && ` · ${offer.client_company}`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span>{section.icon}</span> {section.name}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const sel = selections[item.id];
                const isSelected = sel?.selected || false;

                return (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(item.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isSelected && (
                          <Input
                            type="number"
                            min={1}
                            value={sel?.quantity || 1}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            className="w-20 h-8 text-center"
                          />
                        )}
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                          {item.price.toFixed(2)} zł/{item.unit_label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ta oferta nie zawiera jeszcze żadnych pozycji.</p>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Suma wybranych pozycji:</p>
            <p className="text-xl font-bold text-foreground">{selectedTotal.toFixed(2)} zł</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Zapisywanie..." : "Zapisz wybory"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientOffer;
