import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { type ClientData, mockClients as initialClients } from "@/data/clientsData";
import ClientDetailView from "./ClientDetailView";
import { toast } from "@/components/ui/sonner";

type View = "list" | "detail";

const emptyClient: ClientData = {
  id: "", firstName: "", lastName: "", email: "", phone: "", phoneAlt: "",
  companyName: "", nip: "", companyAddress: "", companyCity: "", companyPostalCode: "",
  address: "", city: "", postalCode: "",
  notes: "", orders: 0, totalSpent: "0,00 zł", lastOrder: "—", createdAt: "",
};

const ClientsView = () => {
  const [view, setView] = useState<View>("list");
  const [clients, setClients] = useState<ClientData[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (client: ClientData) => {
    setSelectedClient(client);
    setView("detail");
  };

  const handleAdd = () => {
    const newClient = { ...emptyClient, id: crypto.randomUUID() };
    setSelectedClient(newClient);
    setView("detail");
  };

  const handleSave = (client: ClientData) => {
    if (!client.createdAt) {
      const now = new Date();
      const months = ["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"];
      client.createdAt = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    setClients((prev) => {
      const exists = prev.find((c) => c.id === client.id);
      if (exists) return prev.map((c) => (c.id === client.id ? client : c));
      return [...prev, client];
    });
    setSelectedClient(client);
    toast.success("Zapisano");
  };

  const handleDelete = (client: ClientData) => {
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    toast.success("Klient usunięty");
  };

  const handleBack = () => {
    setView("list");
    setSelectedClient(null);
  };

  if (view === "detail" && selectedClient) {
    return <ClientDetailView client={selectedClient} onBack={handleBack} onSave={handleSave} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Klienci</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj bazą klientów</p>
        </div>
        <Button className="gap-2" onClick={handleAdd}>+ Dodaj klienta</Button>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj klientów..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Klient</TableHead>
              <TableHead className="font-semibold text-foreground">Telefon</TableHead>
              <TableHead className="font-semibold text-foreground">Firma</TableHead>
              <TableHead className="font-semibold text-foreground">Zamówienia</TableHead>
              <TableHead className="font-semibold text-foreground">Łączna kwota</TableHead>
              <TableHead className="font-semibold text-foreground">Ostatnie zamówienie</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((client) => (
              <TableRow key={client.id} className="cursor-pointer" onClick={() => handleOpen(client)}>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{client.firstName} {client.lastName}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                <TableCell className="text-muted-foreground">{client.companyName || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{client.orders}</TableCell>
                <TableCell className="font-semibold text-foreground">{client.totalSpent}</TableCell>
                <TableCell className="text-muted-foreground">{client.lastOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-1.5 rounded-md transition-colors text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientsView;
