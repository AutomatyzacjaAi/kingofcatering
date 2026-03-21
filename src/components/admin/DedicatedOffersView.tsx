import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink, Copy, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import OfferTemplatesManager from "./offers/OfferTemplatesManager";

interface DedicatedOffer {
  id: string;
  template_id: string | null;
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
  created_at: string;
}

interface OfferTemplate {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  draft: "Szkic",
  sent: "Wysłana",
  viewed: "Otwarta",
  accepted: "Zaakceptowana",
  rejected: "Odrzucona",
};

const DedicatedOffersView = () => {
  const [tab, setTab] = useState<"offers" | "templates">("offers");
  const [offers, setOffers] = useState<DedicatedOffer[]>([]);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<DedicatedOffer | null>(null);

  // Form state
  const [formTemplateId, setFormTemplateId] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formClientCompany, setFormClientCompany] = useState("");
  const [formEventName, setFormEventName] = useState("");
  const [formDateStart, setFormDateStart] = useState("");
  const [formDateEnd, setFormDateEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchData = async () => {
    const [offersRes, templatesRes] = await Promise.all([
      supabase.from("dedicated_offers").select("*").order("created_at", { ascending: false }),
      supabase.from("offer_templates").select("id, name").order("name"),
    ]);
    if (offersRes.data) setOffers(offersRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  // Realtime for offer status changes
  useEffect(() => {
    const channel = supabase
      .channel("dedicated-offers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "dedicated_offers" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "dedicated_offer_selections" }, () => {
        toast.info("Klient zaktualizował wybory w ofercie!");
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const generateToken = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 12; i++) token += chars[Math.floor(Math.random() * chars.length)];
    return token;
  };

  const resetForm = () => {
    setFormTemplateId("");
    setFormClientName("");
    setFormClientEmail("");
    setFormClientPhone("");
    setFormClientCompany("");
    setFormEventName("");
    setFormDateStart("");
    setFormDateEnd("");
    setFormNotes("");
    setEditOffer(null);
  };

  const openNewOffer = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEditOffer = (offer: DedicatedOffer) => {
    setEditOffer(offer);
    setFormTemplateId(offer.template_id || "");
    setFormClientName(offer.client_name);
    setFormClientEmail(offer.client_email);
    setFormClientPhone(offer.client_phone);
    setFormClientCompany(offer.client_company);
    setFormEventName(offer.event_name);
    setFormDateStart(offer.event_date_start || "");
    setFormDateEnd(offer.event_date_end || "");
    setFormNotes(offer.notes);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formClientName.trim()) {
      toast.error("Podaj imię klienta");
      return;
    }

    const payload = {
      template_id: formTemplateId || null,
      client_name: formClientName,
      client_email: formClientEmail,
      client_phone: formClientPhone,
      client_company: formClientCompany,
      event_name: formEventName,
      event_date_start: formDateStart || null,
      event_date_end: formDateEnd || null,
      notes: formNotes,
    };

    if (editOffer) {
      const { error } = await supabase.from("dedicated_offers").update(payload).eq("id", editOffer.id);
      if (error) { toast.error("Błąd zapisu"); return; }
      toast.success("Oferta zaktualizowana");
    } else {
      const token = generateToken();
      
      // Create the offer
      const { data: newOffer, error } = await supabase
        .from("dedicated_offers")
        .insert({ ...payload, token, status: "draft" })
        .select("id")
        .single();
      if (error || !newOffer) { toast.error("Błąd tworzenia oferty"); return; }

      // If template selected, copy sections and items
      if (formTemplateId) {
        await copyTemplateToOffer(formTemplateId, newOffer.id);
      }

      toast.success("Oferta utworzona");
    }

    setSheetOpen(false);
    resetForm();
    fetchData();
  };

  const copyTemplateToOffer = async (templateId: string, offerId: string) => {
    // Fetch template sections with items
    const { data: sections } = await supabase
      .from("offer_template_sections")
      .select("*, offer_template_section_items(*)")
      .eq("template_id", templateId)
      .order("sort_order");

    if (!sections) return;

    for (const section of sections) {
      const { data: newSection } = await supabase
        .from("dedicated_offer_sections")
        .insert({ offer_id: offerId, name: section.name, icon: section.icon, sort_order: section.sort_order })
        .select("id")
        .single();

      if (newSection && (section as any).offer_template_section_items?.length) {
        const items = (section as any).offer_template_section_items.map((item: any) => ({
          section_id: newSection.id,
          name: item.name,
          description: item.description,
          price: item.price,
          unit_label: item.unit_label,
          sort_order: item.sort_order,
        }));
        await supabase.from("dedicated_offer_items").insert(items);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ofertę?")) return;
    await supabase.from("dedicated_offers").delete().eq("id", id);
    toast.success("Usunięto");
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("dedicated_offers").update({ status }).eq("id", id);
    fetchData();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/offer/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link skopiowany do schowka");
  };

  const getOfferUrl = (token: string) => `${window.location.origin}/offer/${token}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Oferty dedykowane</h1>
        <div className="flex gap-2">
          <Button
            variant={tab === "offers" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("offers")}
          >
            <FileText className="w-4 h-4 mr-1" /> Oferty
          </Button>
          <Button
            variant={tab === "templates" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("templates")}
          >
            <FileText className="w-4 h-4 mr-1" /> Szablony
          </Button>
        </div>
      </div>

      {tab === "templates" ? (
        <OfferTemplatesManager />
      ) : (
        <>
          <div className="flex gap-2">
            <Button onClick={openNewOffer}>
              <Plus className="w-4 h-4 mr-1" /> Nowa oferta
            </Button>
          </div>

          <div className="grid gap-4">
            {offers.length === 0 && (
              <p className="text-muted-foreground text-sm">Brak ofert. Utwórz pierwszą ofertę dedykowaną.</p>
            )}
            {offers.map((offer) => (
              <Card key={offer.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{offer.client_name}</span>
                        {offer.client_company && (
                          <span className="text-muted-foreground text-sm">({offer.client_company})</span>
                        )}
                        <Badge className={statusColors[offer.status] || ""}>
                          {statusLabels[offer.status] || offer.status}
                        </Badge>
                      </div>
                      {offer.event_name && (
                        <p className="text-sm text-muted-foreground">{offer.event_name}</p>
                      )}
                      {offer.event_date_start && (
                        <p className="text-xs text-muted-foreground">
                          📅 {offer.event_date_start}
                          {offer.event_date_end && ` — ${offer.event_date_end}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono">{getOfferUrl(offer.token)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Select value={offer.status} onValueChange={(v) => handleStatusChange(offer.id, v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Szkic</SelectItem>
                          <SelectItem value="sent">Wysłana</SelectItem>
                          <SelectItem value="viewed">Otwarta</SelectItem>
                          <SelectItem value="accepted">Zaakceptowana</SelectItem>
                          <SelectItem value="rejected">Odrzucona</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => copyLink(offer.token)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={getOfferUrl(offer.token)} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditOffer(offer)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* New/Edit Offer Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editOffer ? "Edytuj ofertę" : "Nowa oferta dedykowana"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Szablon oferty</Label>
              <Select value={formTemplateId} onValueChange={setFormTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz szablon (opcjonalnie)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Imię i nazwisko *</Label>
                <Input value={formClientName} onChange={(e) => setFormClientName(e.target.value)} placeholder="Jan Kowalski" />
              </div>
              <div>
                <Label>Firma</Label>
                <Input value={formClientCompany} onChange={(e) => setFormClientCompany(e.target.value)} placeholder="Nazwa firmy" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={formClientEmail} onChange={(e) => setFormClientEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={formClientPhone} onChange={(e) => setFormClientPhone(e.target.value)} placeholder="+48 ..." />
              </div>
            </div>

            <div>
              <Label>Nazwa wydarzenia</Label>
              <Input value={formEventName} onChange={(e) => setFormEventName(e.target.value)} placeholder="np. Konferencja IT Summit 2026" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data rozpoczęcia</Label>
                <Input type="date" value={formDateStart} onChange={(e) => setFormDateStart(e.target.value)} />
              </div>
              <div>
                <Label>Data zakończenia</Label>
                <Input type="date" value={formDateEnd} onChange={(e) => setFormDateEnd(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Notatki</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Dodatkowe informacje..." />
            </div>

            <Button onClick={handleSave} className="w-full">
              {editOffer ? "Zapisz zmiany" : "Utwórz ofertę"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DedicatedOffersView;
