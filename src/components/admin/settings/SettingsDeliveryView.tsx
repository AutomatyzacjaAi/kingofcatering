import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Truck, Pencil, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  cities: string[];
  postal_codes: string[];
  price: number;
  free_delivery_above: number | null;
  min_order_value: number | null;
  is_active: boolean;
  sort_order: number;
}

const emptyZone: Omit<DeliveryZone, "id"> = {
  name: "",
  description: "",
  cities: [],
  postal_codes: [],
  price: 0,
  free_delivery_above: null,
  min_order_value: null,
  is_active: true,
  sort_order: 0,
};

const SettingsDeliveryView = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyZone);
  const [cityInput, setCityInput] = useState("");
  const [postalInput, setPostalInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .order("sort_order");
    if (error) { toast.error(error.message); return; }
    setZones(data ?? []);
    setLoading(false);
  };

  const startEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id);
    setForm({ ...zone });
    setCityInput("");
    setPostalInput("");
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({ ...emptyZone, sort_order: zones.length });
    setCityInput("");
    setPostalInput("");
  };

  const cancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyZone);
  };

  const addCity = () => {
    const trimmed = cityInput.trim();
    if (trimmed && !form.cities.includes(trimmed)) {
      setForm(f => ({ ...f, cities: [...f.cities, trimmed] }));
    }
    setCityInput("");
  };

  const removeCity = (city: string) => {
    setForm(f => ({ ...f, cities: f.cities.filter(c => c !== city) }));
  };

  const addPostal = () => {
    const trimmed = postalInput.trim();
    if (trimmed && !form.postal_codes.includes(trimmed)) {
      setForm(f => ({ ...f, postal_codes: [...f.postal_codes, trimmed] }));
    }
    setPostalInput("");
  };

  const removePostal = (code: string) => {
    setForm(f => ({ ...f, postal_codes: f.postal_codes.filter(c => c !== code) }));
  };

  const saveZone = async () => {
    if (!form.name.trim()) { toast.error("Podaj nazwę strefy"); return; }
    if (form.cities.length === 0 && form.postal_codes.length === 0) {
      toast.error("Dodaj przynajmniej jedno miasto lub kod pocztowy");
      return;
    }

    if (isAdding) {
      const { data, error } = await supabase.from("delivery_zones").insert(form).select().single();
      if (error) { toast.error(error.message); return; }
      setZones(prev => [...prev, data]);
      toast.success("Strefa dodana");
    } else if (editingId) {
      const { id: _, ...rest } = form as any;
      const { error } = await supabase.from("delivery_zones").update(rest).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      setZones(prev => prev.map(z => z.id === editingId ? { ...z, ...rest } : z));
      toast.success("Strefa zaktualizowana");
    }
    cancel();
  };

  const deleteZone = async (id: string) => {
    const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setZones(prev => prev.filter(z => z.id !== id));
    toast.success("Strefa usunięta");
  };

  const toggleActive = async (zone: DeliveryZone) => {
    const newActive = !zone.is_active;
    const { error } = await supabase.from("delivery_zones").update({ is_active: newActive }).eq("id", zone.id);
    if (error) { toast.error(error.message); return; }
    setZones(prev => prev.map(z => z.id === zone.id ? { ...z, is_active: newActive } : z));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEditing = isAdding || editingId;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strefy dostaw</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj strefami dostawy i cennikiem</p>
        </div>
        {!isEditing && (
          <Button onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Dodaj strefę
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{isAdding ? "Nowa strefa" : "Edytuj strefę"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nazwa strefy *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="np. Kraków centrum" />
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Krótki opis strefy" />
              </div>
              <div className="space-y-2">
                <Label>Cena dostawy (zł) *</Label>
                <Input type="number" min={0} step={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Darmowa dostawa powyżej (zł)</Label>
                <Input type="number" min={0} step={1} value={form.free_delivery_above ?? ""} onChange={e => setForm(f => ({ ...f, free_delivery_above: e.target.value ? Number(e.target.value) : null }))} placeholder="Brak progu" />
              </div>
              <div className="space-y-2">
                <Label>Min. wartość zamówienia (zł)</Label>
                <Input type="number" min={0} step={1} value={form.min_order_value ?? ""} onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value ? Number(e.target.value) : null }))} placeholder="Brak minimum" />
              </div>
              <div className="space-y-2">
                <Label>Kolejność</Label>
                <Input type="number" min={0} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Cities */}
            <div className="space-y-2">
              <Label>Miasta / dzielnice</Label>
              <div className="flex gap-2">
                <Input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="Wpisz miasto i naciśnij Enter" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCity())} />
                <Button type="button" size="sm" variant="outline" onClick={addCity}>Dodaj</Button>
              </div>
              {form.cities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.cities.map(city => (
                    <Badge key={city} variant="secondary" className="gap-1">
                      {city}
                      <button onClick={() => removeCity(city)}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Postal codes */}
            <div className="space-y-2">
              <Label>Kody pocztowe (opcjonalnie)</Label>
              <div className="flex gap-2">
                <Input value={postalInput} onChange={e => setPostalInput(e.target.value)} placeholder="np. 30-001" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPostal())} />
                <Button type="button" size="sm" variant="outline" onClick={addPostal}>Dodaj</Button>
              </div>
              {form.postal_codes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.postal_codes.map(code => (
                    <Badge key={code} variant="secondary" className="gap-1">
                      {code}
                      <button onClick={() => removePostal(code)}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Aktywna</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveZone}><Save className="w-4 h-4 mr-1" />Zapisz</Button>
              <Button variant="outline" onClick={cancel}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {zones.length === 0 && !isEditing ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Brak stref dostaw. Dodaj pierwszą strefę.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {zones.map(zone => (
            <Card key={zone.id} className={!zone.is_active ? "opacity-50" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Truck className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{zone.name}</h3>
                        <Badge variant={zone.is_active ? "default" : "secondary"}>
                          {zone.is_active ? "Aktywna" : "Nieaktywna"}
                        </Badge>
                        <span className="text-primary font-bold">{zone.price > 0 ? `${zone.price} zł` : "Darmowa"}</span>
                      </div>
                      {zone.description && <p className="text-sm text-muted-foreground">{zone.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {zone.cities.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                        {zone.postal_codes.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {zone.free_delivery_above != null && <span>Darmowa od {zone.free_delivery_above} zł</span>}
                        {zone.min_order_value != null && <span>Min. zamówienie: {zone.min_order_value} zł</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={zone.is_active} onCheckedChange={() => toggleActive(zone)} />
                    <Button size="icon" variant="ghost" onClick={() => startEdit(zone)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteZone(zone.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsDeliveryView;
