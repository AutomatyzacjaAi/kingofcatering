import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const SettingsCompanyView = () => {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from("company_settings").select("*").limit(1).single();
      if (data) {
        setSettingsId(data.id);
        setCompanyName(data.company_name || "");
        setNip(data.nip || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setBankAccount(data.bank_account || "");
      } else if (error && error.code === "PGRST116") {
        // No row yet — will insert on save
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      company_name: companyName,
      nip,
      email,
      phone,
      address,
      bank_account: bankAccount,
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
      toast.success("Dane firmy zapisane");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dane firmy</h1>
        <p className="text-muted-foreground text-sm">Podstawowe informacje o firmie</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacje ogólne</CardTitle>
            <CardDescription>Dane rejestrowe i kontaktowe firmy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nazwa firmy</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" value={nip} onChange={(e) => setNip(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Numer konta bankowego</Label>
              <Input id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsCompanyView;
