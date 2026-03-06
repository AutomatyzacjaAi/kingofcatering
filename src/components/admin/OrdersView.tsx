import { useState } from "react";
import { Search, Eye, Pencil, Copy, Printer, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrderStatus = "Nowe" | "Potwierdzone" | "W realizacji" | "Zrealizowane" | "Anulowane";

interface Order {
  id: string;
  client: string;
  email: string;
  event: string;
  date: string;
  amount: string;
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, string> = {
  "Nowe": "bg-blue-50 text-blue-700 border-blue-200",
  "Potwierdzone": "bg-green-50 text-green-700 border-green-200",
  "W realizacji": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Zrealizowane": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Anulowane": "bg-red-50 text-red-700 border-red-200",
};

const mockOrders: Order[] = [
  { id: "ZAM-KOC8L7K", client: "Anna Kowalska", email: "anna.k@email.pl", event: "", date: "28 sty 2026", amount: "2 211,00 zł", status: "Nowe" },
  { id: "ZAM-KOC01SQ", client: "Jan Nowak", email: "jan.nowak@email.pl", event: "", date: "21 sty 2026", amount: "350,00 zł", status: "Potwierdzone" },
  { id: "ZAM-KOC5CJA", client: "Maria Wiśniewska", email: "maria.w@email.pl", event: "Wesele", date: "28 sty 2026", amount: "3 276,00 zł", status: "Zrealizowane" },
  { id: "ZAM-KOC1RA9", client: "Piotr Zieliński", email: "piotr.z@email.pl", event: "", date: "21 sty 2026", amount: "246,00 zł", status: "Anulowane" },
  { id: "ZAM-KOC0MII", client: "Katarzyna Wójcik", email: "k.wojcik@email.pl", event: "Stypa", date: "26 sty 2026", amount: "402,00 zł", status: "Zrealizowane" },
  { id: "ZAM-KOCX6J3", client: "Tomasz Kamiński", email: "t.kaminski@email.pl", event: "Impreza firmowa", date: "13 sty 2026", amount: "14 970,00 zł", status: "Potwierdzone" },
  { id: "ZAM-KOC3UTX", client: "Agnieszka Lewandowska", email: "a.lew@email.pl", event: "Impreza firmowa", date: "20 sty 2026", amount: "4 648,00 zł", status: "W realizacji" },
  { id: "ZAM-KOCI715", client: "Michał Szymański", email: "m.szymanski@email.pl", event: "Impreza firmowa", date: "24 gru 2025", amount: "12 685,00 zł", status: "W realizacji" },
  { id: "ZAM-KOCI69E", client: "Ewa Dąbrowska", email: "e.dabrowska@email.pl", event: "Impreza firmowa", date: "30 gru 2025", amount: "7 970,00 zł", status: "W realizacji" },
  { id: "ZAM-KOCELA3", client: "Robert Majewski", email: "r.majewski@email.pl", event: "Stypa", date: "31 gru 2025", amount: "30 885,00 zł", status: "Potwierdzone" },
];

const OrdersView = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zamówienia</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj zamówieniami cateringowymi</p>
        </div>
        <Button className="gap-2">
          + Dodaj zamówienie
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj zamówień..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Wszystkie statusy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="Nowe">Nowe</SelectItem>
            <SelectItem value="Potwierdzone">Potwierdzone</SelectItem>
            <SelectItem value="W realizacji">W realizacji</SelectItem>
            <SelectItem value="Zrealizowane">Zrealizowane</SelectItem>
            <SelectItem value="Anulowane">Anulowane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Nr zamówienia</TableHead>
              <TableHead className="font-semibold text-foreground">Klient</TableHead>
              <TableHead className="font-semibold text-foreground">Wydarzenie</TableHead>
              <TableHead className="font-semibold text-foreground">Data</TableHead>
              <TableHead className="font-semibold text-foreground">Kwota</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{order.client}</div>
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.event || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell className="font-semibold text-foreground">{order.amount}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border",
                    statusColors[order.status]
                  )}>
                    {order.status}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {[Eye, Pencil, Copy, Printer, Trash2].map((Icon, i) => (
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

export default OrdersView;
