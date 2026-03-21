import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays, MapPin, Clock, Users, Save, Check, Plus,
  Building2, Phone, Mail, User, FileText, Coffee, UtensilsCrossed,
  Wine, Salad, PartyPopper, Sparkles
} from "lucide-react";
import { format, parseISO } from "date-fns";
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
  client_nip: string;
  client_address: string;
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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "coffee": <Coffee className="w-4 h-4" />,
  "utensils": <UtensilsCrossed className="w-4 h-4" />,
  "wine": <Wine className="w-4 h-4" />,
  "salad": <Salad className="w-4 h-4" />,
  "party": <PartyPopper className="w-4 h-4" />,
  "sparkles": <Sparkles className="w-4 h-4" />,
};

const getCategoryIcon = (icon: string) => {
  return CATEGORY_ICONS[icon] || <UtensilsCrossed className="w-4 h-4" />;
};

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

  // Editable client fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNip, setClientNip] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientType, setClientType] = useState("firma");

  // Per-day editable fields
  const [dayLocations, setDayLocations] = useState<Record<string, string>>({});
  const [dayGuestCounts, setDayGuestCounts] = useState<Record<string, number>>({});
  const [dayStartTimes, setDayStartTimes] = useState<Record<string, string>>({});
  const [dayEndTimes, setDayEndTimes] = useState<Record<string, string>>({});

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
    setOffer(offerData as any);

    const fullName = offerData.client_name || "";
    const nameParts = fullName.split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setClientCompany(offerData.client_company || "");
    setClientEmail(offerData.client_email || "");
    setClientPhone(offerData.client_phone || "");
    setClientNip((offerData as any).client_nip || "");
    setClientAddress((offerData as any).client_address || "");

    if (offerData.status === "draft" || offerData.status === "sent") {
      await supabase.from("dedicated_offers").update({ status: "viewed" }).eq("id", offerData.id);
    }

    const { data: daysData } = await supabase
      .from("dedicated_offer_days")
      .select("*")
      .eq("offer_id", offerData.id)
      .order("sort_order");

    const fetchedDays = (daysData || []) as any[];
    setDays(fetchedDays);

    // Init per-day fields
    const locs: Record<string, string> = {};
    const guests: Record<string, number> = {};
    const starts: Record<string, string> = {};
    const ends: Record<string, string> = {};
    fetchedDays.forEach((d: any) => {
      locs[d.id] = d.location || "";
      guests[d.id] = d.guest_count || 0;
      starts[d.id] = d.start_time || "";
      ends[d.id] = d.end_time || "";
    });
    setDayLocations(locs);
    setDayGuestCounts(guests);
    setDayStartTimes(starts);
    setDayEndTimes(ends);

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

    if (fetchedDays.length > 0) {
      setActiveDay(fetchedDays[0].id);
    }

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

    const clientName = `${firstName} ${lastName}`.trim();

    await supabase.from("dedicated_offers").update({
      client_name: clientName,
      client_company: clientCompany,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_nip: clientNip,
      client_address: clientAddress,
    } as any).eq("id", offer.id);

    // Save per-day data
    for (const day of days) {
      await supabase.from("dedicated_offer_days").update({
        location: dayLocations[day.id] || "",
        guest_count: dayGuestCounts[day.id] || 0,
        start_time: dayStartTimes[day.id] || null,
        end_time: dayEndTimes[day.id] || null,
      }).eq("id", day.id);
    }

    // Save selections
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

  const categories = daySections.map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
  const activeCategoryId = activeCategory || (categories.length > 0 ? categories[0].id : null);
  const activeSectionData = daySections.find((s) => s.id === activeCategoryId);
  const activeDayData = days.find((d) => d.id === activeDay);

  const formatDayTab = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "EEE. dd.MM", { locale: pl });
    } catch { return dateStr; }
  };

  const countSelectedForDay = (dayId: string) => {
    const daySecs = sections.filter((s) => s.day_id === dayId);
    let count = 0;
    daySecs.forEach((sec) => {
      sec.items.forEach((item) => {
        if (selections[item.id]?.selected) count++;
      });
    });
    return count;
  };

  const countSelectedForSection = (sectionId: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return 0;
    return sec.items.filter((item) => selections[item.id]?.selected).length;
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base">{offer?.event_name || "Oferta dedykowana"}</h1>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">OFERTA</Badge>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4 pb-28">

        {/* ─── DANE KONTAKTOWE ─── */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Dane kontaktowe
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Imię" />
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nazwisko" />
              </div>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" />
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Telefon" />
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ klienta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firma">Firma</SelectItem>
                  <SelectItem value="osoba_prywatna">Osoba prywatna</SelectItem>
                </SelectContent>
              </Select>
              {clientType === "firma" && (
                <div className="space-y-3">
                  <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Nazwa firmy" />
                  <Input value={clientNip} onChange={(e) => setClientNip(e.target.value)} placeholder="NIP" />
                </div>
              )}
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Adres" />
            </div>
          </CardContent>
        </Card>

        {/* ─── INFORMACJE O WYDARZENIU ─── */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Informacje o wydarzeniu
            </h3>
            <div className="space-y-2">
              {(offer?.event_date_start || offer?.event_date_end) && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                  <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">
                    {offer.event_date_start && format(parseISO(offer.event_date_start), "dd.MM.yyyy")}
                    {offer.event_date_end && ` — ${format(parseISO(offer.event_date_end), "dd.MM.yyyy")}`}
                  </span>
                </div>
              )}
              {offer?.event_name && (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-foreground">{offer.event_name}</span>
                  <button className="text-xs text-primary font-medium hover:underline">Zmień</button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── DAY TABS ─── */}
        {days.length > 0 && (
          <div className="flex rounded-xl overflow-hidden border border-border">
            {days.map((day, i) => {
              const isActive = activeDay === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => { setActiveDay(day.id); setActiveCategory(null); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all text-center ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  } ${i > 0 ? "border-l border-border" : ""}`}
                >
                  {formatDayTab(day.day_date)}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── PER-DAY DETAILS ─── */}
        {activeDay && activeDayData && (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Wybór — {formatDayTab(activeDayData.day_date)}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Lokalizacja"
                      value={dayLocations[activeDay] || ""}
                      onChange={(e) => setDayLocations(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Liczba uczestników"
                      type="number"
                      value={dayGuestCounts[activeDay] || ""}
                      onChange={(e) => setDayGuestCounts(prev => ({ ...prev, [activeDay]: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="——:——"
                      value={dayStartTimes[activeDay] || ""}
                      onChange={(e) => setDayStartTimes(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="——:——"
                      value={dayEndTimes[activeDay] || ""}
                      onChange={(e) => setDayEndTimes(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Category chips for this day */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {categories.map((cat) => {
                    const count = countSelectedForSection(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          activeCategoryId === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {getCategoryIcon(cat.icon)}
                        <span>{cat.name}</span>
                        {count > 0 && (
                          <span className={`ml-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                            activeCategoryId === cat.id ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-3 h-3" /> Dodaj kategorię
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── KATEGORIE DAŃ – grid of category cards ─── */}
        {activeDay && categories.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Kategorie dań
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── ITEMS LIST ─── */}
        {activeSectionData && activeSectionData.items.length > 0 && (
          <div className="space-y-1">
            {activeSectionData.items.map((item) => {
              const sel = selections[item.id];
              const isSelected = sel?.selected || false;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-card hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  <div className="min-w-0">
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
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {item.price.toFixed(0)} zł
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No-day sections fallback */}
        {days.length === 0 && sections.length > 0 && (
          <>
            {sections.map((section) => (
              <div key={section.id} className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  {getCategoryIcon(section.icon)} {section.name}
                </h3>
                {section.items.map((item) => {
                  const sel = selections[item.id];
                  const isSelected = sel?.selected || false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                        isSelected ? "bg-primary/10 border border-primary/20" : "bg-card hover:bg-muted/30 border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isSelected && (
                          <Input type="number" min={1} value={sel?.quantity || 1}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            className="w-16 h-8 text-center text-sm" />
                        )}
                        <span className="text-sm font-bold text-primary whitespace-nowrap">{item.price.toFixed(0)} zł</span>
                      </div>
                    </div>
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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
