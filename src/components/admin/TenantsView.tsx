import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Building2, Users, Mail, Phone, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  company_name: string;
  nip: string;
  address: string;
  is_active: boolean;
  max_users: number;
  notes: string;
  created_at: string;
}

interface TenantUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

const TenantsView = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    company_name: "",
    nip: "",
    address: "",
    is_active: true,
    max_users: 5,
    notes: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants((data as any[]) || []);
    setLoading(false);
  };

  const fetchTenantUsers = async (tenantId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    setTenantUsers((data as any[]) || []);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[ąàáâãäå]/g, "a")
      .replace(/[ćčç]/g, "c")
      .replace(/[ęèéêë]/g, "e")
      .replace(/[łľ]/g, "l")
      .replace(/[ńñ]/g, "n")
      .replace(/[óòôõö]/g, "o")
      .replace(/[śšş]/g, "s")
      .replace(/[ůúùûü]/g, "u")
      .replace(/[żźž]/g, "z")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const openCreate = () => {
    setEditingTenant(null);
    setForm({ name: "", slug: "", email: "", phone: "", company_name: "", nip: "", address: "", is_active: true, max_users: 5, notes: "" });
    setSheetOpen(true);
  };

  const openEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setForm({
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email || "",
      phone: tenant.phone || "",
      company_name: tenant.company_name || "",
      nip: tenant.nip || "",
      address: tenant.address || "",
      is_active: tenant.is_active,
      max_users: tenant.max_users || 5,
      notes: tenant.notes || "",
    });
    setSheetOpen(true);
  };

  const openDetails = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    await fetchTenantUsers(tenant.id);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "Wypełnij nazwę i slug", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editingTenant) {
      const { error } = await supabase
        .from("tenants")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editingTenant.id);
      if (error) {
        toast({ title: "Błąd zapisu", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Zapisano zmiany" });
        setSheetOpen(false);
        fetchTenants();
      }
    } else {
      const { error } = await supabase.from("tenants").insert(form);
      if (error) {
        toast({ title: "Błąd tworzenia", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Utworzono nową firmę" });
        setSheetOpen(false);
        fetchTenants();
      }
    }
    setSaving(false);
  };

  const handleCreateUser = async () => {
    if (!selectedTenant || !newUserEmail || !newUserPassword) {
      toast({ title: "Wypełnij email i hasło", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Create user via edge function
    const { data, error } = await supabase.functions.invoke("create-tenant-user", {
      body: {
        email: newUserEmail,
        password: newUserPassword,
        first_name: newUserFirstName,
        last_name: newUserLastName,
        tenant_id: selectedTenant.id,
      },
    });

    if (error || data?.error) {
      toast({ title: "Błąd tworzenia użytkownika", description: error?.message || data?.error, variant: "destructive" });
    } else {
      toast({ title: "Utworzono użytkownika", description: `Konto ${newUserEmail} zostało utworzone` });
      setAddUserOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFirstName("");
      setNewUserLastName("");
      await fetchTenantUsers(selectedTenant.id);
    }
    setSaving(false);
  };

  const copyLoginUrl = (slug: string) => {
    const url = `${window.location.origin}/t/${slug}/login`;
    navigator.clipboard.writeText(url);
    toast({ title: "Skopiowano link logowania" });
  };

  if (selectedTenant) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(null)} className="mb-2">
              ← Wróć do listy
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{selectedTenant.name}</h1>
            <p className="text-muted-foreground text-sm">{selectedTenant.company_name || selectedTenant.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => copyLoginUrl(selectedTenant.slug)}>
              <Copy className="w-4 h-4 mr-1" /> Link logowania
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEdit(selectedTenant)}>
              Edytuj
            </Button>
          </div>
        </div>

        {/* Tenant info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Mail className="w-4 h-4" /> Email
              </div>
              <p className="font-medium">{selectedTenant.email || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Phone className="w-4 h-4" /> Telefon
              </div>
              <p className="font-medium">{selectedTenant.phone || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="w-4 h-4" /> Użytkownicy
              </div>
              <p className="font-medium">{tenantUsers.length} / {selectedTenant.max_users}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Użytkownicy</CardTitle>
            <Button size="sm" onClick={() => setAddUserOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Dodaj użytkownika
            </Button>
          </CardHeader>
          <CardContent>
            {tenantUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Brak użytkowników. Dodaj pierwszego użytkownika.</p>
            ) : (
              <div className="space-y-2">
                {tenantUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">
                        {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : "Bez nazwy"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(user.created_at).toLocaleDateString("pl-PL")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add user dialog */}
        <Sheet open={addUserOpen} onOpenChange={setAddUserOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Nowy użytkownik</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Imię</Label>
                  <Input value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nazwisko</Label>
                  <Input value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasło *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Min. 8 znaków"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={handleCreateUser} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Utwórz konto
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edytuj firmę</SheetTitle>
            </SheetHeader>
            <TenantForm form={form} setForm={setForm} generateSlug={generateSlug} onSave={handleSave} saving={saving} />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Firmy cateringowe</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj kontami firm korzystających z systemu</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Nowa firma
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tenants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg mb-1">Brak firm</h3>
            <p className="text-muted-foreground text-sm mb-4">Dodaj pierwszą firmę cateringową do systemu</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Nowa firma</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetails(tenant)}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{tenant.name}</h3>
                    <p className="text-xs text-muted-foreground">{tenant.company_name || tenant.email || tenant.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={tenant.is_active ? "default" : "secondary"}>
                    {tenant.is_active ? "Aktywna" : "Nieaktywna"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyLoginUrl(tenant.slug); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTenant ? "Edytuj firmę" : "Nowa firma"}</SheetTitle>
          </SheetHeader>
          <TenantForm form={form} setForm={setForm} generateSlug={generateSlug} onSave={handleSave} saving={saving} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Tenant form sub-component
const TenantForm = ({ form, setForm, generateSlug, onSave, saving }: {
  form: any;
  setForm: (f: any) => void;
  generateSlug: (name: string) => string;
  onSave: () => void;
  saving: boolean;
}) => (
  <div className="space-y-4 mt-6">
    <div className="space-y-2">
      <Label>Nazwa firmy *</Label>
      <Input
        value={form.name}
        onChange={(e) => {
          const name = e.target.value;
          setForm({ ...form, name, slug: form.slug || generateSlug(name) });
        }}
      />
    </div>
    <div className="space-y-2">
      <Label>Slug (URL) *</Label>
      <Input
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        placeholder="nazwa-firmy"
      />
      <p className="text-xs text-muted-foreground">Adres panelu: /t/{form.slug}/login</p>
    </div>
    <div className="space-y-2">
      <Label>Nazwa handlowa</Label>
      <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Telefon</Label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>NIP</Label>
        <Input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Max użytkowników</Label>
        <Input type="number" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: parseInt(e.target.value) || 5 })} />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Adres</Label>
      <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
    </div>
    <div className="space-y-2">
      <Label>Notatki</Label>
      <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
    </div>
    <div className="flex items-center justify-between">
      <Label>Aktywna</Label>
      <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
    </div>
    <Button onClick={onSave} disabled={saving} className="w-full">
      {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
      Zapisz
    </Button>
  </div>
);

export default TenantsView;
