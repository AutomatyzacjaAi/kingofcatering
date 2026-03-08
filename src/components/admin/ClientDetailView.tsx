import { useState, useEffect } from "react";
import { ArrowLeft, Save, User, Building2, MapPin, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ClientData, mockClientOrders } from "@/data/clientsData";

const statusColors: Record<string, string> = {
  "Nowe": "bg-blue-50 text-blue-700 border-blue-200",
  "Potwierdzone": "bg-green-50 text-green-700 border-green-200",
  "W realizacji": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Zrealizowane": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Anulowane": "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  client: ClientData;
  onBack: () => void;
  onSave: (client: ClientData) => void;
}

const ClientDetailView = ({ client, onBack, onSave }: Props) => {
  const [form, setForm] = useState<ClientData>(client);
  const orders = mockClientOrders[client.id] || [];

  useEffect(() => { setForm(client); }, [client]);

  const set = (field: keyof ClientData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => onSave(form);

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Nowy klient";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
            <p className="text-muted-foreground text-sm">
              {client.createdAt ? `Klient od ${client.createdAt} · ${client.orders} zamówień` : "Nowy klient"}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Zapisz
        </Button>
      </div>

      {/* Stats bar - only for existing clients */}
      {client.orders > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{client.orders}</p>
              <p className="text-xs text-muted-foreground">Zamówienia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{client.totalSpent}</p>
              <p className="text-xs text-muted-foreground">Łączna kwota</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{client.lastOrder}</p>
              <p className="text-xs text-muted-foreground">Ostatnie zamówienie</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Dane osobowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Imię *</Label>
                <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nazwisko *</Label>
                <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Telefon *</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Telefon dodatkowy</Label>
                <Input value={form.phoneAlt} onChange={(e) => set("phoneAlt", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Dane firmowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nazwa firmy</Label>
                <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">NIP</Label>
                <Input value={form.nip} onChange={(e) => set("nip", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Adres firmy</Label>
              <Input value={form.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Miasto</Label>
                <Input value={form.companyCity} onChange={(e) => set("companyCity", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Kod pocztowy</Label>
                <Input value={form.companyPostalCode} onChange={(e) => set("companyPostalCode", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Adres zamieszkania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Adres</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Miasto</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Kod pocztowy</Label>
                <Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Notatki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Dodatkowe informacje o kliencie..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Order history - only for existing clients */}
      {orders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Historia zamówień
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Nr zamówienia</TableHead>
                  <TableHead className="font-semibold text-foreground">Data</TableHead>
                  <TableHead className="font-semibold text-foreground">Wydarzenie</TableHead>
                  <TableHead className="font-semibold text-foreground">Kwota</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    <TableCell className="text-muted-foreground">{order.event || "—"}</TableCell>
                    <TableCell className="font-semibold text-foreground">{order.amount}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                        statusColors[order.status] || "bg-muted text-muted-foreground border-border"
                      )}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDetailView;
