import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Upload, X, Image } from "lucide-react";

const SettingsCompanyView = () => {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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
        setLogoUrl((data as any).logo_url || null);
        setFaviconUrl((data as any).favicon_url || null);
        setPrivacyPolicyUrl((data as any).privacy_policy_url || "");
        setPrimaryColor((data as any).primary_color || "#000000");
      } else if (error && error.code === "PGRST116") {
        // No row yet — will insert on save
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const uploadFile = async (file: File, type: "logo" | "favicon") => {
    const ext = file.name.split(".").pop();
    const filePath = `${type}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("company-assets")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "logo");
      setLogoUrl(url);
      // Save immediately
      if (settingsId) {
        await supabase.from("company_settings").update({ logo_url: url } as any).eq("id", settingsId);
      }
      toast.success("Logo przesłane");
    } catch (err: any) {
      toast.error("Błąd przesyłania: " + err.message);
    }
    setUploadingLogo(false);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadFile(file, "favicon");
      setFaviconUrl(url);
      if (settingsId) {
        await supabase.from("company_settings").update({ favicon_url: url } as any).eq("id", settingsId);
      }
      toast.success("Favicon przesłany");
    } catch (err: any) {
      toast.error("Błąd przesyłania: " + err.message);
    }
    setUploadingFavicon(false);
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  const removeLogo = async (type: "logo" | "favicon") => {
    if (settingsId) {
      const field = type === "logo" ? "logo_url" : "favicon_url";
      await supabase.from("company_settings").update({ [field]: null } as any).eq("id", settingsId);
    }
    if (type === "logo") setLogoUrl(null);
    else setFaviconUrl(null);
    toast.success(type === "logo" ? "Logo usunięte" : "Favicon usunięty");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      company_name: companyName,
      nip,
      email,
      phone,
      address,
      bank_account: bankAccount,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      privacy_policy_url: privacyPolicyUrl || null,
      primary_color: primaryColor,
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
        {/* Logos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo firmy</CardTitle>
            <CardDescription>Logo główne i favicon — wyświetlane na dokumentach i w panelu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Main logo */}
              <div className="space-y-3">
                <Label>Logo główne</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] relative">
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="max-h-24 max-w-full object-contain" />
                      <button
                        onClick={() => removeLogo("logo")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {uploadingLogo ? (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Image className="w-10 h-10" />
                          <span className="text-xs">Kliknij, aby przesłać logo</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
                {logoUrl && (
                  <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Zmień logo
                  </Button>
                )}
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <Label>Favicon (ikona)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] relative">
                  {faviconUrl ? (
                    <>
                      <img src={faviconUrl} alt="Favicon" className="max-h-16 max-w-16 object-contain" />
                      <button
                        onClick={() => removeLogo("favicon")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                      className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {uploadingFavicon ? (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10" />
                          <span className="text-xs">Kliknij, aby przesłać favicon</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                </div>
                {faviconUrl && (
                  <Button variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Zmień favicon
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company info */}
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
            <div className="space-y-2">
              <Label htmlFor="privacyPolicy">Link do regulaminu / polityki prywatności</Label>
              <Input id="privacyPolicy" placeholder="https://example.com/regulamin" value={privacyPolicyUrl} onChange={(e) => setPrivacyPolicyUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">Wyświetlany w formularzu zamówienia do akceptacji</p>
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
