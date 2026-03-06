import { useState } from "react";
import { ArrowLeft, Pencil, User, Building2, Phone, MapPin, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  onEdit: (client: ClientData) => void;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
};

const ClientDetailView = ({ client, onBack, onEdit }: Props) => {
  const orders = mockClientOrders[client.id] || [];
  const fullName = `${client.firstName} ${client.lastName}`;
  const hasCompany = !!client.companyName;

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
              Klient od {client.createdAt} · {client.orders} zamówień
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => onEdit(client)}>
          <Pencil className="w-4 h-4" />
          Edytuj klienta
        </Button>
      </div>

      {/* Stats bar */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Dane osobowe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Imię" value={client.firstName} />
            <InfoRow label="Nazwisko" value={client.lastName} />
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Telefon" value={client.phone} />
            <InfoRow label="Telefon dodatkowy" value={client.phoneAlt} />
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
          <CardContent>
            {hasCompany ? (
              <>
                <InfoRow label="Nazwa firmy" value={client.companyName} />
                <InfoRow label="NIP" value={client.nip} />
                <InfoRow label="Adres" value={client.companyAddress} />
                <InfoRow label="Miasto" value={client.companyCity} />
                <InfoRow label="Kod pocztowy" value={client.companyPostalCode} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Brak danych firmowych</p>
            )}
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
          <CardContent>
            <InfoRow label="Adres" value={client.address} />
            <InfoRow label="Miasto" value={client.city} />
            <InfoRow label="Kod pocztowy" value={client.postalCode} />
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
            {client.notes ? (
              <p className="text-sm text-foreground">{client.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Brak notatek</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Historia zamówień
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
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
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Brak zamówień</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailView;
