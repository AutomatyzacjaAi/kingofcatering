import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Edit } from "lucide-react";
import { toast } from "sonner";
import ProductPickerDialog, { type CatalogItem } from "./ProductPickerDialog";

interface TemplateSectionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  sort_order: number;
  source_type: string | null;
  source_id: string | null;
}

interface TemplateSection {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  items: TemplateSectionItem[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  event_type: string;
  contact_section_type: string;
  sections: TemplateSection[];
}

const OfferTemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formEventType, setFormEventType] = useState("");
  const [formContactType, setFormContactType] = useState("corporate");
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSectionIdx, setPickerSectionIdx] = useState(-1);

  const fetchTemplates = async () => {
    const { data } = await supabase.from("offer_templates").select("*").order("name");
    if (!data) return;

    const templatesWithSections: Template[] = [];
    for (const t of data) {
      const { data: secs } = await supabase
        .from("offer_template_sections")
        .select("*, offer_template_section_items(*)")
        .eq("template_id", t.id)
        .order("sort_order");

      templatesWithSections.push({
        ...t,
        sections: (secs || []).map((s: any) => ({
          ...s,
          items: (s.offer_template_section_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
        })),
      });
    }
    setTemplates(templatesWithSections);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openNew = () => {
    setEditTemplate(null);
    setFormName(""); setFormDesc(""); setFormEventType("");
    setSections([]);
    setSheetOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditTemplate(t);
    setFormName(t.name); setFormDesc(t.description); setFormEventType(t.event_type);
    setSections(t.sections.map(s => ({ ...s, items: [...s.items] })));
    setSheetOpen(true);
  };

  const addSection = () => {
    setSections([...sections, { id: crypto.randomUUID(), name: "", icon: "🍽️", sort_order: sections.length, items: [] }]);
  };

  const updateSection = (idx: number, field: string, value: string) => {
    const updated = [...sections];
    (updated[idx] as any)[field] = value;
    setSections(updated);
  };

  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));

  const openPickerForSection = (idx: number) => {
    setPickerSectionIdx(idx);
    setPickerOpen(true);
  };

  const handlePickerAdd = (items: CatalogItem[]) => {
    if (pickerSectionIdx < 0) return;
    const updated = [...sections];
    const section = updated[pickerSectionIdx];
    const startOrder = section.items.length;
    items.forEach((item, i) => {
      section.items.push({
        id: crypto.randomUUID(),
        name: item.name,
        description: item.description,
        price: item.price,
        unit_label: item.unit_label,
        sort_order: startOrder + i,
        source_type: item.source_type,
        source_id: item.source_id,
      });
    });
    setSections(updated);
  };

  const addManualItem = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].items.push({
      id: crypto.randomUUID(), name: "", description: "", price: 0,
      unit_label: "szt.", sort_order: updated[sectionIdx].items.length,
      source_type: null, source_id: null,
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

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Podaj nazwę szablonu"); return; }

    let templateId: string;

    if (editTemplate) {
      templateId = editTemplate.id;
      await supabase.from("offer_templates").update({
        name: formName, description: formDesc, event_type: formEventType,
      }).eq("id", templateId);
      await supabase.from("offer_template_sections").delete().eq("template_id", templateId);
    } else {
      const { data, error } = await supabase
        .from("offer_templates")
        .insert({ name: formName, description: formDesc, event_type: formEventType })
        .select("id").single();
      if (error || !data) { toast.error("Błąd"); return; }
      templateId = data.id;
    }

    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const { data: newSec } = await supabase
        .from("offer_template_sections")
        .insert({ template_id: templateId, name: sec.name, icon: sec.icon, sort_order: si })
        .select("id").single();

      if (newSec && sec.items.length > 0) {
        const items = sec.items.map((item, ii) => ({
          section_id: newSec.id, name: item.name, description: item.description,
          price: item.price, unit_label: item.unit_label, sort_order: ii,
          source_type: item.source_type, source_id: item.source_id,
        }));
        await supabase.from("offer_template_section_items").insert(items);
      }
    }

    toast.success(editTemplate ? "Szablon zaktualizowany" : "Szablon utworzony");
    setSheetOpen(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć szablon?")) return;
    await supabase.from("offer_templates").delete().eq("id", id);
    toast.success("Usunięto");
    fetchTemplates();
  };

  return (
    <div className="space-y-4">
      <Button onClick={openNew}>
        <Plus className="w-4 h-4 mr-1" /> Nowy szablon
      </Button>

      {templates.length === 0 && (
        <p className="text-muted-foreground text-sm">Brak szablonów. Utwórz pierwszy szablon oferty.</p>
      )}

      {templates.map((t) => (
        <Card key={t.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {t.sections.length} sekcji · {t.sections.reduce((s, sec) => s + sec.items.length, 0)} pozycji
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTemplate ? "Edytuj szablon" : "Nowy szablon oferty"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Nazwa szablonu *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Oferta konferencyjna" />
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Krótki opis..." />
            </div>
            <div>
              <Label>Typ wydarzenia</Label>
              <Input value={formEventType} onChange={(e) => setFormEventType(e.target.value)} placeholder="np. Konferencja" />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Sekcje</Label>
                <Button variant="outline" size="sm" onClick={addSection}>
                  <Plus className="w-3 h-3 mr-1" /> Dodaj sekcję
                </Button>
              </div>

              {sections.map((section, si) => (
                <div key={section.id} className="border border-border rounded-lg p-3 mb-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Input value={section.icon} onChange={(e) => updateSection(si, "icon", e.target.value)} className="w-14 text-center" />
                    <Input value={section.name} onChange={(e) => updateSection(si, "name", e.target.value)} placeholder="Nazwa sekcji" className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => removeSection(si)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="ml-6 space-y-2">
                    {section.items.map((item, ii) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <Input value={item.name} onChange={(e) => updateItem(si, ii, "name", e.target.value)} placeholder="Nazwa pozycji" className="flex-1" />
                            {item.source_type && (
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {item.source_type === "dish" ? "Danie" : item.source_type === "bundle" ? "Pakiet" : item.source_type === "extra" ? "Dodatek" : item.source_type === "configurable_set" ? "Zestaw" : "Wariant"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Input type="number" value={item.price} onChange={(e) => updateItem(si, ii, "price", Number(e.target.value))} className="w-24" placeholder="Cena" step="0.01" />
                        <Input value={item.unit_label} onChange={(e) => updateItem(si, ii, "unit_label", e.target.value)} className="w-16" placeholder="j." />
                        <Button variant="ghost" size="icon" onClick={() => removeItem(si, ii)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
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
            </div>

            <Button onClick={handleSave} className="w-full">
              {editTemplate ? "Zapisz zmiany" : "Utwórz szablon"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ProductPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={handlePickerAdd} />
    </div>
  );
};

export default OfferTemplatesManager;
