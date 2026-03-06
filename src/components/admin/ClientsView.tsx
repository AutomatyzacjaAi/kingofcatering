import { useState } from "react";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Anna Kowalska", email: "anna.k@email.pl", phone: "+48 500 100 200", orders: 5, totalSpent: "8 420,00 zł", lastOrder: "28 sty 2026" },
  { id: "2", name: "Jan Nowak", email: "jan.nowak@email.pl", phone: "+48 600 300 400", orders: 2, totalSpent: "1 200,00 zł", lastOrder: "21 sty 2026" },
  { id: "3", name: "Maria Wiśniewska", email: "maria.w@email.pl", phone: "+48 700 500 600", orders: 8, totalSpent: "22 350,00 zł", lastOrder: "28 sty 2026" },
  { id: "4", name: "Piotr Zieliński", email: "piotr.z@email.pl", phone: "+48 800 700 800", orders: 1, totalSpent: "246,00 zł", lastOrder: "21 sty 2026" },
  { id: "5", name: "Katarzyna Wójcik", email: "k.wojcik@email.pl", phone: "+48 510 220 330", orders: 3, totalSpent: "4 890,00 zł", lastOrder: "26 sty 2026" },
  { id: "6", name: "Tomasz Kamiński", email: "t.kaminski@email.pl", phone: "+48 660 440 550", orders: 12, totalSpent: "45 200,00 zł", lastOrder: "13 sty 2026" },
];

const ClientsView = () => {
  const [search, setSearch] = useState("");

  const filtered = mockClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Klienci</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj bazą klientów</p>
        </div>
        <Button className="gap-2">+ Dodaj klienta</Button>
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
              <TableHead className="font-semibold text-foreground">Zamówienia</TableHead>
              <TableHead className="font-semibold text-foreground">Łączna kwota</TableHead>
              <TableHead className="font-semibold text-foreground">Ostatnie zamówienie</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                <TableCell className="text-muted-foreground">{client.orders}</TableCell>
                <TableCell className="font-semibold text-foreground">{client.totalSpent}</TableCell>
                <TableCell className="text-muted-foreground">{client.lastOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {[Eye, Pencil, Trash2].map((Icon, i) => (
                      <button
                        key={i}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          Icon === Trash2
                            ? "text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
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
