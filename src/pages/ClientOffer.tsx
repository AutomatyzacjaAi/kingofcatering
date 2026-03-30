import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays, MapPin, Clock, Users, Save, Check, Plus, Minus,
  Phone, Mail, Printer, Play
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

// ─── Types ───
interface OfferItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  sort_order: number;
  source_type?: string | null;
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
  contact_section_type: string;
}

interface Selection {
  item_id: string;
  selected: boolean;
  quantity: number;
  notes: string;
}

// ─── Helpers ───
const fmtDate = (d: string) => {
  try {
    return format(parseISO(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const fmtDayTab = (d: string) => {
  try {
    return format(parseISO(d), "EEE. dd.MM", { locale: pl });
  } catch {
    return d;
  }
};

const fmtPrice = (n: number) =>
  n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Component ───
const ClientOffer = () => {
  const { token } = useParams<{ token: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [days, setDays] = useState<OfferDay[]>([]);
  const [sections, setSections] = useState<OfferSection[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Client fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNip, setClientNip] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientType, setClientType] = useState("firma");

  // Wedding fields
  const [groomFirstName, setGroomFirstName] = useState("");
  const [groomLastName, setGroomLastName] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomEmail, setGroomEmail] = useState("");
  const [brideFirstName, setBrideFirstName] = useState("");
  const [brideLastName, setBrideLastName] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideEmail, setBrideEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [venue, setVenue] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [guestsAdults, setGuestsAdults] = useState(0);
  const [guestsChildren312, setGuestsChildren312] = useState(0);
  const [guestsChildrenUnder2, setGuestsChildrenUnder2] = useState(0);
  const [guestsSubcontractors, setGuestsSubcontractors] = useState(0);
  const [menuStandard, setMenuStandard] = useState(0);
  const [menuVegetarian, setMenuVegetarian] = useState(0);
  const [menuChildren, setMenuChildren] = useState(0);

  // Per-day editable
  const [dayLocations, setDayLocations] = useState<Record<string, string>>({});
  const [dayGuestCounts, setDayGuestCounts] = useState<Record<string, number>>({});
  const [dayStartTimes, setDayStartTimes] = useState<Record<string, string>>({});
  const [dayEndTimes, setDayEndTimes] = useState<Record<string, string>>({});

  // Refs for section scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!token) return;
    fetchOffer();
    fetchLogo();
  }, [token]);

  const fetchLogo = async () => {
    const { data } = await supabase.from("company_settings").select("logo_url").limit(1).single();
    if (data?.logo_url) setLogoUrl(data.logo_url);
  };

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
      .from("dedicated_offer_days").select("*").eq("offer_id", offerData.id).order("sort_order");

    const fetchedDays = (daysData || []) as any[];
    setDays(fetchedDays);

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

    if (fetchedDays.length > 0) setActiveDay(fetchedDays[0].id);

    const { data: existingSelections } = await supabase
      .from("dedicated_offer_selections").select("*").eq("offer_id", offerData.id);

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

    for (const day of days) {
      await supabase.from("dedicated_offer_days").update({
        location: dayLocations[day.id] || "",
        guest_count: dayGuestCounts[day.id] || 0,
        start_time: dayStartTimes[day.id] || null,
        end_time: dayEndTimes[day.id] || null,
      }).eq("id", day.id);
    }

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

  // Compute totals
  const selectedTotal = sections.reduce((total, section) => {
    return total + section.items.reduce((sTotal, item) => {
      const sel = selections[item.id];
      if (sel?.selected) return sTotal + item.price * sel.quantity;
      return sTotal;
    }, 0);
  }, 0);

  const totalGuests = Object.values(dayGuestCounts).reduce((s, n) => s + n, 0);

  // ─── Sections for active day ───
  const daySections = activeDay
    ? sections.filter((s) => s.day_id === activeDay)
    : sections.filter((s) => !s.day_id);

  // Sections without day (extras, technical, etc.)
  const globalSections = sections.filter((s) => !s.day_id);

  const dateRange = offer
    ? [
        offer.event_date_start ? fmtDate(offer.event_date_start) : null,
        offer.event_date_end ? fmtDate(offer.event_date_end) : null,
      ].filter(Boolean).join(" — ")
    : "";

  const dateRangeShort = offer
    ? [
        offer.event_date_start ? format(parseISO(offer.event_date_start), "dd-dd MMMM", { locale: pl }) : null,
      ].filter(Boolean).join("")
    : "";

  // ─── Renders ───

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 text-sm">Ładowanie oferty...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Oferta nie znaleziona</h1>
          <p className="text-neutral-500">Link do oferty jest nieprawidłowy lub oferta została usunięta.</p>
        </div>
      </div>
    );
  }

  const renderSectionItems = (section: OfferSection, isExtras: boolean = false) => {
    const countSelected = section.items.filter(i => selections[i.id]?.selected).length;

    return (
      <div
        key={section.id}
        ref={el => { sectionRefs.current[section.id] = el; }}
        className="border-b border-neutral-100 last:border-0"
      >
        {/* Section header */}
        <div className="px-6 py-4 bg-neutral-50/50">
          <h3 className="font-semibold text-neutral-900 text-[15px]">{section.name}</h3>
          {!isExtras && section.items.length > 0 && (
            <p className="text-xs text-neutral-400 mt-0.5">
              Pozostało do wyboru: {section.items.length - countSelected} {section.items.length - countSelected === 1 ? 'danie' : 'dań'}
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          {section.items.map((item) => {
            const sel = selections[item.id];
            const isSelected = sel?.selected || false;

            if (isExtras) {
              // Extras: show price + quantity stepper
              return (
                <div key={item.id} className="px-6 py-3.5 border-t border-neutral-50 first:border-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-neutral-600 whitespace-nowrap">
                        {fmtPrice(item.price)} zł{item.unit_label ? ` / ${item.unit_label}` : ''}
                      </span>
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, (sel?.quantity || 0) - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-500"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-neutral-900 border-x border-neutral-200">
                          {sel?.quantity || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, (sel?.quantity || 0) + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Regular item: click to select, show badge
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`px-6 py-3.5 border-t border-neutral-50 first:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-emerald-50/50" : "hover:bg-neutral-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox circle */}
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-600"
                      : "border-neutral-300"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isSelected ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"}`}>
                      {item.name}
                    </p>
                    {item.description && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section notes */}
        <div className="px-6 py-3 bg-neutral-50/30 border-t border-neutral-100">
          <div className="flex items-start gap-2">
            <span className="text-xs text-neutral-400 mt-1.5 shrink-0">Uwagi:</span>
            <Textarea
              value={sectionNotes[section.id] || ""}
              onChange={(e) => setSectionNotes(prev => ({ ...prev, [section.id]: e.target.value }))}
              placeholder=""
              className="min-h-[32px] h-8 text-xs border-0 bg-transparent shadow-none resize-none p-0 focus-visible:ring-0 text-neutral-600"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero image ─── */}
      <div className="relative h-[240px] md:h-[320px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80"
          alt="Event cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-[680px] mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {offer?.event_name || "Oferta dedykowana"}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {dateRange && `${dateRange} · `}
              {dayLocations[days[0]?.id] && `${dayLocations[days[0]?.id]} · `}
              Oferta cateringowa
            </p>
          </div>
        </div>

        {/* Logo */}
        {logoUrl && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <img src={logoUrl} alt="Logo" className="h-10 md:h-14 object-contain drop-shadow-lg" />
          </div>
        )}
        {!logoUrl && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 w-16 h-16 border-2 border-dashed border-white/40 rounded-lg flex items-center justify-center">
            <span className="text-white/40 text-[10px] font-medium">Logo</span>
          </div>
        )}
      </div>

      <div className="max-w-[680px] mx-auto px-4 md:px-0 pb-32">
        {/* ─── Intro / notes ─── */}
        {offer?.notes && (
          <div className="mt-6 bg-neutral-50 rounded-xl p-5 text-sm text-neutral-700 leading-relaxed">
            {offer.notes}
            {offer.client_name && (
              <div className="mt-4 flex items-center gap-4 text-neutral-600 text-sm">
                <span className="font-semibold">{offer.client_name}</span>
                {clientPhone && (
                  <a href={`tel:${clientPhone}`} className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {clientPhone}
                  </a>
                )}
                {clientEmail && (
                  <a href={`mailto:${clientEmail}`} className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {clientEmail}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Contact form ─── */}
        <div className="mt-6 bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900 text-[15px]">Dane kontaktowe</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-neutral-500 mb-1.5">Imię</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jan" className="border-neutral-200" />
              </div>
              <div>
                <Label className="text-xs text-neutral-500 mb-1.5">Nazwisko</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Kowalski" className="border-neutral-200" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-neutral-500 mb-1.5">Email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="jan@firma.pl" className="border-neutral-200" />
            </div>
            <div>
              <Label className="text-xs text-neutral-500 mb-1.5">Telefon</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+48 000 000 000" className="border-neutral-200" />
            </div>
            <div>
              <Label className="text-xs text-neutral-500 mb-1.5">Typ klienta</Label>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="border-neutral-200">
                  <SelectValue placeholder="Wybierz typ klienta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firma">Firma</SelectItem>
                  <SelectItem value="osoba_prywatna">Osoba prywatna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {clientType === "firma" && (
              <>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">Nazwa firmy</Label>
                  <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="border-neutral-200" />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">NIP</Label>
                  <Input value={clientNip} onChange={(e) => setClientNip(e.target.value)} className="border-neutral-200" />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs text-neutral-500 mb-1.5">Adres</Label>
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="border-neutral-200" />
            </div>
          </div>
        </div>

        {/* ─── Event info ─── */}
        <div className="mt-4 bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900 text-[15px]">Informacje o wydarzeniu</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-neutral-500 mb-1.5">Data rozpoczęcia</Label>
                <div className="flex items-center gap-2 border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-700">
                  <CalendarDays className="w-4 h-4 text-neutral-400" />
                  {offer?.event_date_start ? fmtDate(offer.event_date_start) : "—"}
                </div>
              </div>
              <div>
                <Label className="text-xs text-neutral-500 mb-1.5">Data zakończenia</Label>
                <div className="flex items-center gap-2 border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-700">
                  <CalendarDays className="w-4 h-4 text-neutral-400" />
                  {offer?.event_date_end ? fmtDate(offer.event_date_end) : "—"}
                </div>
              </div>
            </div>
            {activeDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">Godzina rozpoczęcia</Label>
                  <Input
                    placeholder="GG:MM"
                    value={dayStartTimes[activeDay] || ""}
                    onChange={(e) => setDayStartTimes(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    className="border-neutral-200"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">Godzina zakończenia</Label>
                  <Input
                    placeholder="GG:MM"
                    value={dayEndTimes[activeDay] || ""}
                    onChange={(e) => setDayEndTimes(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    className="border-neutral-200"
                  />
                </div>
              </div>
            )}
            {activeDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">Lokalizacja</Label>
                  <Input
                    placeholder="Lokalizacja"
                    value={dayLocations[activeDay] || ""}
                    onChange={(e) => setDayLocations(prev => ({ ...prev, [activeDay]: e.target.value }))}
                    className="border-neutral-200"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1.5">Liczba uczestników</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={dayGuestCounts[activeDay] || ""}
                    onChange={(e) => setDayGuestCounts(prev => ({ ...prev, [activeDay]: Number(e.target.value) }))}
                    className="border-neutral-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Day tabs ─── */}
        {days.length > 0 && (
          <div className="mt-6 flex gap-2">
            {days.map((day) => {
              const isActive = activeDay === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all text-center ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
                  }`}
                >
                  {fmtDayTab(day.day_date)}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Menu sections for active day ─── */}
        {daySections.length > 0 && (
          <div className="mt-4">
            {/* Day title */}
            {activeDay && days.find(d => d.id === activeDay) && (
              <div className="mb-3">
                <h2 className="text-lg font-bold text-neutral-900">
                  Menu obiadowe — {fmtDayTab(days.find(d => d.id === activeDay)!.day_date)}
                </h2>
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {daySections.map((section) => renderSectionItems(section, false))}
            </div>
          </div>
        )}

        {/* ─── Global sections (extras, technical, etc.) ─── */}
        {globalSections.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">Dodatki płatne</h2>
            <p className="text-sm text-neutral-500 -mt-2">Poniższe pozycje są wyceniane osobno.</p>

            {globalSections.map((section) => (
              <div key={section.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {renderSectionItems(section, true)}
              </div>
            ))}
          </div>
        )}

        {/* ─── Summary ─── */}
        <div className="mt-8 bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900 text-[15px]">Podsumowanie zamówienia</h3>
          </div>
          <div className="p-6">
            {selectedTotal > 0 ? (
              <div className="space-y-2">
                {sections.map(sec => {
                  const secTotal = sec.items.reduce((s, item) => {
                    const sel = selections[item.id];
                    return sel?.selected ? s + item.price * sel.quantity : s;
                  }, 0);
                  if (secTotal === 0) return null;
                  return (
                    <div key={sec.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{sec.name}</span>
                      <span className="font-medium text-neutral-900">{fmtPrice(secTotal)} zł</span>
                    </div>
                  );
                })}
                <div className="border-t border-neutral-200 pt-3 mt-3 flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">Razem</span>
                  <span className="text-xl font-bold text-neutral-900">{fmtPrice(selectedTotal)} zł</span>
                </div>
                {totalGuests > 0 && (
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>Cena za osobę</span>
                    <span>{fmtPrice(selectedTotal / totalGuests)} zł</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">
                Zaznacz pozycje z menu i wpisz liczbę uczestników, aby zobaczyć podsumowanie.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sticky bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors">
            <Printer className="w-4 h-4" />
            Wydrukuj ofertę
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Zapisywanie..." : "Zapisz ofertę"}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-colors">
            <Play className="w-4 h-4" />
            Oglądnij wideo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientOffer;
