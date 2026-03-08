import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsOrdersView = () => {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [minOrder, setMinOrder] = useState("200");
  const [minLeadDays, setMinLeadDays] = useState("3");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("id, min_order_value, min_lead_days")
        .limit(1)
        .single();
      if (data) {
        setSettingsId(data.id);
        if (data.min_order_value != null) setMinOrder(String(data.min_order_value));
        if (data.min_lead_days != null) setMinLeadDays(String(data.min_lead_days));
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      min_order_value: Number(minOrder) || 0,
      min_lead_days: Number(minLeadDays) || 3,
    };
    let error;
    if (settingsId) {
      ({ error } = await supabase.from("company_settings").update(payload).eq("id", settingsId));
    } else {
      const { data, error: e } = await supabase.from("company_settings").insert(payload).select("id").single();
      error = e;
      if (data) setSettingsId(data.id);
    }
    setSaving(false);
    if (error) {
      toast.error("Błąd zapisu: " + error.message);
    } else {
      toast.success("Parametry zamówień zapisane");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Zamówienia</h1>
        <p className="text-muted-foreground text-sm">Ustawienia dotyczące zamówień</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parametry zamówień</CardTitle>
            <CardDescription>Wartości minimalne i limity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimalna wartość zamówienia (zł)</Label>
                <Input id="minOrder" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minLeadDays">Min. dni wyprzedzenia</Label>
                <Input id="minLeadDays" type="number" value={minLeadDays} onChange={(e) => setMinLeadDays(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsOrdersView;
