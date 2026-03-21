import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CalendarDays, MapPin, Clock, Users, Save, Check } from "lucide-react";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { pl } from "date-fns/locale";

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
  day_id: string | null;
  items: OfferItem[];
}

interface OfferDay {
  id: string;
  day_date: string;
  location: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  sort_order: number;
}

interface Offer {
  id: string;
  token: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_phone: string;
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
  const [days, setDays] = useState<OfferDay[]>([]);
  const [sections, setSections] = useState<OfferSection[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

    if (!offerData) { setNotFound(true); setLoading(false); return; }
    setOffer(offerData);

    if (offerData.status === "draft" || offerData.status === "sent") {
      await supabase.from("dedicated_offers").update({ status: "viewed" }).eq("id", offerData.id);
    }

    // Fetch days
    const { data: daysData } = await supabase
      .from("dedicated_offer_days")
      .select("*")
      .eq("offer_id", offerData.id)
      .order("sort_order");

    const fetchedDays = daysData || [];
    setDays(fetchedDays);

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

    // Set active day
    if (fetchedDays.length > 0) {
      setActiveDay(fetchedDays[0].id);
    }

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
    await supabase.from("dedicated_offer_selections").delete().eq("offer_id", offer.id);
    const toInsert = Object.values(selections).filter((s) => s.selected || s.quantity > 0);
    if (toInsert.length > 0) {
      await supabase.from("dedicated_offer_selections").insert(
        toInsert.map((s) => ({ offer_id: offer.id, item_id: s.item_id, selected: s.selected, quantity: s.quantity, notes: s.notes }))
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

  // Get sections for active day
  const daySections = activeDay
    ? sections.filter((s) => s.day_id === activeDay)
    : sections.filter((s) => !s.day_id);

  // Get unique category names for tabs
  const categories = daySections.map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
  const activeCategoryId = activeCategory || (categories.length > 0 ? categories[0].id : null);
  const activeSectionData = daySections.find((s) => s.id === activeCategoryId);

  const activeDayData = days.find((d) => d.id === activeDay);

  const formatDayLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "EEE. dd.MM", { locale: pl });
    } catch { return dateStr; }
  };

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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base">{offer?.event_name || "Oferta dedykowana"}</h1>
              <p className="text-xs text-muted-foreground">
                {offer?.event_date_start && format(parseISO(offer.event_date_start), "dd.MM.yyyy")}
                {offer?.event_date_end && ` — ${format(parseISO(offer.event_date_end), "dd.MM.yyyy")}`}
                {offer?.client_company && ` · ${offer.client_company}`}
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
            OFERTA DEDYKOWANA
          </Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-28">

        {/* Contact info card */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dane kontaktowe</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Imię i nazwisko</p>
                <p className="text-sm font-medium text-foreground">{offer?.client_name || "—"}</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Firma</p>
                <p className="text-sm font-medium text-foreground">{offer?.client_company || "—"}</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{offer?.client_email || "—"}</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="text-sm font-medium text-foreground">{offer?.client_phone || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event info card */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informacje o wydarzeniu</h3>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {offer?.event_date_start && format(parseISO(offer.event_date_start), "dd.MM.yyyy")}
                {offer?.event_date_end && ` — ${format(parseISO(offer.event_date_end), "dd.MM.yyyy")}`}
              </span>
            </div>
            {offer?.event_name && (
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-sm text-foreground">{offer.event_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day tabs */}
        {days.length > 0 && (
          <div className="flex gap-2">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => { setActiveDay(day.id); setActiveCategory(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeDay === day.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {formatDayLabel(day.day_date)}
              </button>
            ))}
          </div>
        )}

        {/* Day details */}
        {activeDayData && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Wybór — {formatDayLabel(activeDayData.day_date)}
              </h3>
              {activeDayData.location && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{activeDayData.location}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(activeDayData.start_time || activeDayData.end_time) && (
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {activeDayData.start_time || "—"} – {activeDayData.end_time || "—"}
                    </span>
                  </div>
                )}
                {activeDayData.guest_count > 0 && (
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{activeDayData.guest_count} uczestników</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategoryId === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Items in active category */}
        {activeSectionData && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {activeSectionData.icon} {activeSectionData.name}
            </h3>
            {activeSectionData.items.map((item) => {
              const sel = selections[item.id];
              const isSelected = sel?.selected || false;

              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isSelected && (
                        <Input
                          type="number"
                          min={1}
                          value={sel?.quantity || 1}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-16 h-8 text-center text-sm"
                        />
                      )}
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        {item.price.toFixed(2)} zł
                      </span>
                      <span className="text-xs text-muted-foreground">/{item.unit_label}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No-day sections (legacy/fallback) */}
        {days.length === 0 && sections.length > 0 && (
          <>
            {categories.length === 0 && sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span>{section.icon}</span> {section.name}
                </h3>
                {section.items.map((item) => {
                  const sel = selections[item.id];
                  const isSelected = sel?.selected || false;
                  return (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"}`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isSelected && (
                            <Input type="number" min={1} value={sel?.quantity || 1}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                              className="w-16 h-8 text-center text-sm" />
                          )}
                          <span className="text-sm font-semibold text-primary whitespace-nowrap">{item.price.toFixed(2)} zł</span>
                          <span className="text-xs text-muted-foreground">/{item.unit_label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ta oferta nie zawiera jeszcze żadnych pozycji.</p>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Suma wybranych pozycji:</p>
            <p className="text-xl font-bold text-foreground">{selectedTotal.toFixed(2)} zł</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg" className="px-6">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Zapisywanie..." : "Zapisz wybory"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientOffer;
