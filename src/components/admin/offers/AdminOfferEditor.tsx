import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Save, GripVertical, ExternalLink, Copy, CalendarDays, MapPin, Clock, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { pl } from "date-fns/locale";
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
  contact_section_type: string;
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
  const [days, setDays] = useState<OfferDay[]>([]);
  const [sections, setSections] = useState<OfferSection[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Editable offer fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientNip, setClientNip] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [eventName, setEventName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchOffer(); }, [offerId]);

  const fetchOffer = async () => {
    setLoading(true);
    const { data: offerData } = await supabase.from("dedicated_offers").select("*").eq("id", offerId).single();
    if (!offerData) { setLoading(false); return; }

    setOffer(offerData);
    setClientName(offerData.client_name);
    setClientEmail(offerData.client_email || "");
    setClientPhone(offerData.client_phone || "");
    setClientCompany(offerData.client_company || "");
    setClientNip((offerData as any).client_nip || "");
    setClientAddress((offerData as any).client_address || "");
    setEventName(offerData.event_name || "");
    setDateStart(offerData.event_date_start || "");
    setDateEnd(offerData.event_date_end || "");
    setNotes(offerData.notes || "");

    const { data: daysData } = await supabase
      .from("dedicated_offer_days")
      .select("*")
      .eq("offer_id", offerId)
      .order("sort_order");
    
    const fetchedDays = daysData || [];
    setDays(fetchedDays);
    if (fetchedDays.length > 0) setActiveDay(fetchedDays[0].id);

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

    const { data: existingSel } = await supabase.from("dedicated_offer_selections").select("*").eq("offer_id", offerId);
    const selMap: Record<string, Selection> = {};
    (existingSel || []).forEach((s: any) => {
      selMap[s.item_id] = { item_id: s.item_id, selected: s.selected, quantity: s.quantity, notes: s.notes };
    });
    setSelections(selMap);
    setLoading(false);
  };

  // Day management
  const generateDaysFromDates = () => {
    if (!dateStart) return;
    const start = parseISO(dateStart);
    const end = dateEnd ? parseISO(dateEnd) : start;
    const interval = eachDayOfInterval({ start, end });
    
    const newDays: OfferDay[] = interval.map((d, i) => ({
      id: `new-${crypto.randomUUID()}`,
      day_date: format(d, "yyyy-MM-dd"),
      location: "",
      start_time: "",
      end_time: "",
      guest_count: 0,
      sort_order: i,
    }));
    setDays(newDays);
    if (newDays.length > 0) setActiveDay(newDays[0].id);
  };

  const updateDay = (dayId: string, field: string, value: any) => {
    setDays(days.map((d) => d.id === dayId ? { ...d, [field]: value } : d));
  };

  const removeDay = (dayId: string) => {
    setDays(days.filter((d) => d.id !== dayId));
    setSections(sections.filter((s) => s.day_id !== dayId));
    if (activeDay === dayId) setActiveDay(days.find((d) => d.id !== dayId)?.id || null);
  };

  // Section management
  const addSection = (dayId: string | null) => {
    const newSection: OfferSection = {
      id: `new-${crypto.randomUUID()}`,
      name: "",
      icon: "🍽️",
      sort_order: sections.filter((s) => s.day_id === dayId).length,
      day_id: dayId,
      items: [],
    };
    setSections([...sections, newSection]);
    setActiveCategory(newSection.id);
  };

  const updateSection = (sectionId: string, field: string, value: string) => {
    setSections(sections.map((s) => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (activeCategory === sectionId) setActiveCategory(null);
  };

  // Item management
  const openPickerForSection = (sectionId: string) => {
    setPickerDayId(sectionId); // reusing for section ID
    setPickerOpen(true);
  };

  const handlePickerAdd = (items: CatalogItem[]) => {
    const sectionId = pickerDayId;
    if (!sectionId) return;
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      const startOrder = s.items.length;
      const newItems: OfferItem[] = items.map((item, i) => ({
        id: `new-${crypto.randomUUID()}`,
        name: item.name, description: item.description,
        price: item.price, unit_label: item.unit_label,
        sort_order: startOrder + i,
        source_type: item.source_type, source_id: item.source_id,
      }));
      return { ...s, items: [...s.items, ...newItems] };
    }));
  };

  const addManualItem = (sectionId: string) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: [...s.items, {
          id: `new-${crypto.randomUUID()}`,
          name: "", description: "", price: 0, unit_label: "szt.",
          sort_order: s.items.length, source_type: null, source_id: null,
        }],
      };
    }));
  };

  const updateItem = (sectionId: string, itemIdx: number, field: string, value: any) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = [...s.items];
      (items[itemIdx] as any)[field] = value;
      return { ...s, items };
    }));
  };

  const removeItem = (sectionId: string, itemIdx: number) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      return { ...s, items: s.items.filter((_, i) => i !== itemIdx) };
    }));
  };

  // Selection toggles
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

  // Save
  const handleSave = async () => {
    if (!offer) return;
    setSaving(true);

    // 1. Update offer metadata
    await supabase.from("dedicated_offers").update({
      client_name: clientName, client_email: clientEmail, client_phone: clientPhone,
      client_company: clientCompany, client_nip: clientNip, client_address: clientAddress,
      event_name: eventName,
      event_date_start: dateStart || null, event_date_end: dateEnd || null, notes,
    } as any).eq("id", offer.id);

    // 2. Delete old days, sections (cascade)
    await supabase.from("dedicated_offer_days").delete().eq("offer_id", offer.id);
    await supabase.from("dedicated_offer_sections").delete().eq("offer_id", offer.id);

    // 3. Insert days
    const dayIdMap = new Map<string, string>();
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const { data: newDay } = await supabase.from("dedicated_offer_days").insert({
        offer_id: offer.id, day_date: day.day_date, location: day.location,
        start_time: day.start_time, end_time: day.end_time,
        guest_count: day.guest_count, sort_order: i,
      }).select("id").single();
      if (newDay) dayIdMap.set(day.id, newDay.id);
    }

    // 4. Insert sections and items
    const oldItemsInfo = new Map<string, { name: string; price: number }>();
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const realDayId = sec.day_id ? dayIdMap.get(sec.day_id) || null : null;
      
      const { data: newSec } = await supabase.from("dedicated_offer_sections").insert({
        offer_id: offer.id, name: sec.name, icon: sec.icon, sort_order: si, day_id: realDayId,
      }).select("id").single();

      if (newSec && sec.items.length > 0) {
        const items = sec.items.map((item, ii) => {
          oldItemsInfo.set(item.id, { name: item.name, price: item.price });
          return {
            section_id: newSec.id, name: item.name, description: item.description,
            price: item.price, unit_label: item.unit_label, sort_order: ii,
            source_type: item.source_type, source_id: item.source_id,
          };
        });
        await supabase.from("dedicated_offer_items").insert(items);
      }
    }

    // 5. Re-map selections
    await supabase.from("dedicated_offer_selections").delete().eq("offer_id", offer.id);

    const { data: newSecs } = await supabase
      .from("dedicated_offer_sections").select("*, dedicated_offer_items(*)")
      .eq("offer_id", offer.id);

    const newItemsMap = new Map<string, string>();
    (newSecs || []).forEach((s: any) => {
      (s.dedicated_offer_items || []).forEach((item: any) => {
        newItemsMap.set(`${item.name}|${item.price}`, item.id);
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
        offer_id: offer.id, item_id: newItemId,
        selected: sel.selected, quantity: sel.quantity, notes: sel.notes,
      });
    });

    if (selectionsToInsert.length > 0) {
      await supabase.from("dedicated_offer_selections").insert(selectionsToInsert);
    }

    toast.success("Oferta zapisana");
    setSaving(false);
    await fetchOffer();
  };

  const copyLink = () => {
    if (!offer) return;
    navigator.clipboard.writeText(`${window.location.origin}/offer/${offer.token}`);
    toast.success("Link skopiowany");
  };

  const selectedTotal = sections.reduce((total, section) => {
    return total + section.items.reduce((sTotal, item) => {
      const sel = selections[item.id];
      if (sel?.selected) return sTotal + item.price * sel.quantity;
      return sTotal;
    }, 0);
  }, 0);

  // Filtered sections for active day
  const daySections = activeDay
    ? sections.filter((s) => s.day_id === activeDay)
    : sections.filter((s) => !s.day_id);

  const categories = daySections.map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
  const activeCategoryId = activeCategory || (categories.length > 0 ? categories[0].id : null);
  const activeSectionData = daySections.find((s) => s.id === activeCategoryId);
  const activeDayData = days.find((d) => d.id === activeDay);

  const formatDayLabel = (dateStr: string) => {
    try { return format(parseISO(dateStr), "EEE. dd.MM", { locale: pl }); }
    catch { return dateStr; }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Ładowanie...</p></div>;
  if (!offer) return <div className="text-center py-12"><p className="text-muted-foreground">Oferta nie znaleziona</p></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Edycja oferty</h1>
            <p className="text-sm text-muted-foreground font-mono">/offer/{offer.token}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}><Copy className="w-4 h-4 mr-1" /> Kopiuj link</Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/offer/${offer.token}`} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-1" /> Podgląd</a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: metadata */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dane kontaktowe</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Imię i nazwisko</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
                <div><Label className="text-xs">Firma</Label><Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} /></div>
                <div><Label className="text-xs">Email</Label><Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
                <div><Label className="text-xs">Telefon</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></div>
                <div><Label className="text-xs">NIP</Label><Input value={clientNip} onChange={(e) => setClientNip(e.target.value)} placeholder="000-000-00-00" /></div>
                <div><Label className="text-xs">Adres</Label><Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="ul. Przykładowa 1" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informacje o wydarzeniu</h3>
              <div><Label className="text-xs">Nazwa wydarzenia</Label><Input value={eventName} onChange={(e) => setEventName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Data od</Label><Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} /></div>
                <div><Label className="text-xs">Data do</Label><Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} /></div>
              </div>
              <Button variant="outline" size="sm" onClick={generateDaysFromDates} className="w-full">
                <CalendarDays className="w-4 h-4 mr-1" /> Generuj dni z zakresu dat
              </Button>
              <div><Label className="text-xs">Notatki wewnętrzne</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-16" /></div>
            </CardContent>
          </Card>
        </div>

        {/* Right: offer content editor */}
        <div className="space-y-4">
          {/* Day tabs */}
          {days.length > 0 && (
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => { setActiveDay(day.id); setActiveCategory(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
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

          {/* Day details editor */}
          {activeDayData && (
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Szczegóły — {formatDayLabel(activeDayData.day_date)}
                  </h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDay(activeDayData.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input value={activeDayData.location} onChange={(e) => updateDay(activeDayData.id, "location", e.target.value)} placeholder="Lokalizacja" className="h-8 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input type="number" value={activeDayData.guest_count || ""} onChange={(e) => updateDay(activeDayData.id, "guest_count", Number(e.target.value))} placeholder="Uczestnicy" className="h-8 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input type="time" value={activeDayData.start_time} onChange={(e) => updateDay(activeDayData.id, "start_time", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input type="time" value={activeDayData.end_time} onChange={(e) => updateDay(activeDayData.id, "end_time", e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap items-center">
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
                {cat.icon} {cat.name || "Nowa sekcja"}
              </button>
            ))}
            <button
              onClick={() => addSection(activeDay)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-3 h-3" /> Dodaj kategorię
            </button>
          </div>

          {/* Active section editor */}
          {activeSectionData && (
            <div className="space-y-3">
              {/* Section name editor */}
              <div className="flex items-center gap-2">
                <Input
                  value={activeSectionData.icon}
                  onChange={(e) => updateSection(activeSectionData.id, "icon", e.target.value)}
                  className="w-12 text-center h-8"
                />
                <Input
                  value={activeSectionData.name}
                  onChange={(e) => updateSection(activeSectionData.id, "name", e.target.value)}
                  placeholder="Nazwa kategorii (np. Przerwa kawowa)"
                  className="flex-1 h-8 font-semibold"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSection(activeSectionData.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {activeSectionData.items.map((item, ii) => {
                  const sel = selections[item.id];
                  const isSelected = sel?.selected || false;

                  return (
                    <Card key={item.id} className={`transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 mt-1 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"}`}
                            onClick={() => toggleItem(item.id)}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Input value={item.name} onChange={(e) => updateItem(activeSectionData.id, ii, "name", e.target.value)}
                                className="h-7 text-sm font-medium" placeholder="Nazwa pozycji" />
                              {item.source_type && (
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {item.source_type === "dish" ? "Danie" : item.source_type === "bundle" ? "Pakiet" : item.source_type === "extra" ? "Dodatek" : item.source_type === "configurable_set" ? "Zestaw" : "Wariant"}
                                </Badge>
                              )}
                            </div>
                            <Input value={item.description} onChange={(e) => updateItem(activeSectionData.id, ii, "description", e.target.value)}
                              className="h-6 text-xs text-muted-foreground" placeholder="Opis" />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected && (
                              <Input type="number" min={1} value={sel?.quantity || 1}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                className="w-14 h-7 text-center text-xs" />
                            )}
                            <Input type="number" value={item.price}
                              onChange={(e) => updateItem(activeSectionData.id, ii, "price", Number(e.target.value))}
                              className="w-20 h-7 text-right text-xs" step="0.01" />
                            <Input value={item.unit_label}
                              onChange={(e) => updateItem(activeSectionData.id, ii, "unit_label", e.target.value)}
                              className="w-12 h-7 text-center text-xs" />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(activeSectionData.id, ii)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openPickerForSection(activeSectionData.id)} className="text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Z katalogu
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => addManualItem(activeSectionData.id)} className="text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Ręcznie
                  </Button>
                </div>
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Brak kategorii. Dodaj pierwszą.</p>
              <Button variant="outline" size="sm" onClick={() => addSection(activeDay)}>
                <Plus className="w-4 h-4 mr-1" /> Dodaj kategorię
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer with total */}
      <Card className="sticky bottom-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Suma wybranych pozycji:</p>
            <p className="text-xl font-bold text-foreground">{selectedTotal.toFixed(2)} zł</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Zapisywanie..." : "Zapisz ofertę"}
          </Button>
        </CardContent>
      </Card>

      <ProductPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={handlePickerAdd} />
    </div>
  );
};

export default AdminOfferEditor;
