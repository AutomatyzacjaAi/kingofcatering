import { useState } from "react";
import { Search, Eye, Pencil, Copy, Printer, Trash2, ChevronDown, ArrowLeft, FileText, ShoppingCart, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type OrderStatus = "Nowe" | "Potwierdzone" | "W realizacji" | "Zrealizowane" | "Anulowane";

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  type?: "simple" | "bundle" | "configurable" | "extra" | "service";
  subItems?: { name: string; quantity: number; unit: string; foodCostPerUnit?: number }[];
  foodCostPerUnit?: number;
}

interface Order {
  id: string;
  client: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  deliveryAddress: string;
  amount: string;
  amountNum: number;
  status: OrderStatus;
  notes: string;
  items: OrderItem[];
  createdAt: string;
}

const statusColors: Record<OrderStatus, string> = {
  "Nowe": "bg-blue-50 text-blue-700 border-blue-200",
  "Potwierdzone": "bg-green-50 text-green-700 border-green-200",
  "W realizacji": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Zrealizowane": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Anulowane": "bg-red-50 text-red-700 border-red-200",
};

const allStatuses: OrderStatus[] = ["Nowe", "Potwierdzone", "W realizacji", "Zrealizowane", "Anulowane"];

const mockOrders: Order[] = [
  {
    id: "ZAM-KOC8L7K", client: "Anna Kowalska", email: "anna.k@email.pl", phone: "+48 500 111 222",
    event: "Urodziny", date: "28 sty 2026", deliveryAddress: "ul. Kwiatowa 5, Warszawa",
    amount: "2 211,00 zł", amountNum: 2211, status: "Nowe", notes: "Bez orzechów - alergia",
    createdAt: "15 sty 2026",
    items: [
      { name: "Patera Serów Europejskich", quantity: 2, unit: "szt.", pricePerUnit: 450, total: 900, type: "simple", foodCostPerUnit: 135,
        subItems: [
          { name: "Brie francuski", quantity: 300, unit: "g", foodCostPerUnit: 0.045 },
          { name: "Camembert z ziołami", quantity: 300, unit: "g", foodCostPerUnit: 0.04 },
          { name: "Gouda długo dojrzewająca", quantity: 400, unit: "g", foodCostPerUnit: 0.035 },
          { name: "Roquefort", quantity: 200, unit: "g", foodCostPerUnit: 0.08 },
          { name: "Winogrona", quantity: 400, unit: "g", foodCostPerUnit: 0.012 },
          { name: "Orzechy włoskie", quantity: 200, unit: "g", foodCostPerUnit: 0.06 },
          { name: "Miód akacjowy", quantity: 100, unit: "ml", foodCostPerUnit: 0.04 },
        ]
      },
      { name: "Patera Wędlin Premium", quantity: 1, unit: "szt.", pricePerUnit: 520, total: 520, type: "simple", foodCostPerUnit: 180,
        subItems: [
          { name: "Szynka parmeńska", quantity: 200, unit: "g", foodCostPerUnit: 0.12 },
          { name: "Salami Milano", quantity: 150, unit: "g", foodCostPerUnit: 0.06 },
          { name: "Chorizo Iberico", quantity: 150, unit: "g", foodCostPerUnit: 0.07 },
          { name: "Oliwki Kalamata", quantity: 150, unit: "g", foodCostPerUnit: 0.03 },
        ]
      },
      { name: "Mini Burgery", quantity: 20, unit: "szt.", pricePerUnit: 15, total: 300, type: "bundle", foodCostPerUnit: 5.5,
        subItems: [
          { name: "Mini Burger Klasyczny", quantity: 12, unit: "szt.", foodCostPerUnit: 5.5 },
          { name: "Mini Burger Vege", quantity: 8, unit: "szt.", foodCostPerUnit: 4.2 },
        ]
      },
      { name: "Sushi Nigiri Sake", quantity: 30, unit: "szt.", pricePerUnit: 8, total: 240, type: "simple", foodCostPerUnit: 3.2 },
      { name: "Obsługa kelnerska 4h", quantity: 1, unit: "szt.", pricePerUnit: 251, total: 251, type: "service" },
    ],
  },
  {
    id: "ZAM-KOC01SQ", client: "Jan Nowak", email: "jan.nowak@email.pl", phone: "+48 600 333 444",
    event: "", date: "21 sty 2026", deliveryAddress: "ul. Długa 12, Kraków",
    amount: "350,00 zł", amountNum: 350, status: "Potwierdzone", notes: "",
    createdAt: "10 sty 2026",
    items: [
      { name: "Antipasto Włoskie", quantity: 1, unit: "szt.", pricePerUnit: 350, total: 350 },
    ],
  },
  {
    id: "ZAM-KOC5CJA", client: "Maria Wiśniewska", email: "maria.w@email.pl", phone: "+48 700 555 666",
    event: "Wesele", date: "28 sty 2026", deliveryAddress: "Dworek pod Lipami, Piaseczno",
    amount: "3 276,00 zł", amountNum: 3276, status: "Zrealizowane", notes: "Dekoracja stołu premium",
    createdAt: "5 sty 2026",
    items: [
      { name: "Zestaw nr 2 Premium", quantity: 30, unit: "os.", pricePerUnit: 95, total: 2850, type: "configurable", foodCostPerUnit: 32,
        subItems: [
          { name: "Polędwica wołowa z sosem z zielonym pieprzem", quantity: 30, unit: "os.", foodCostPerUnit: 12 },
          { name: "Łosoś grillowany z masłem czosnkowym", quantity: 30, unit: "os.", foodCostPerUnit: 9 },
          { name: "Carpaccio z polędwicy", quantity: 30, unit: "os.", foodCostPerUnit: 6 },
          { name: "Crème brûlée", quantity: 30, unit: "os.", foodCostPerUnit: 3 },
          { name: "Fondant czekoladowy", quantity: 30, unit: "os.", foodCostPerUnit: 2 },
        ]
      },
      { name: "Dekoracja stołu", quantity: 3, unit: "szt.", pricePerUnit: 142, total: 426, type: "extra", foodCostPerUnit: 45 },
    ],
  },
  {
    id: "ZAM-KOC1RA9", client: "Piotr Zieliński", email: "piotr.z@email.pl", phone: "+48 800 777 888",
    event: "", date: "21 sty 2026", deliveryAddress: "ul. Polna 8, Gdańsk",
    amount: "246,00 zł", amountNum: 246, status: "Anulowane", notes: "Klient zrezygnował",
    createdAt: "8 sty 2026",
    items: [
      { name: "Tacos z kurczakiem", quantity: 12, unit: "szt.", pricePerUnit: 18, total: 216, type: "simple", foodCostPerUnit: 6 },
      { name: "Opakowanie jednorazowe", quantity: 1, unit: "szt.", pricePerUnit: 30, total: 30, type: "extra", foodCostPerUnit: 8 },
    ],
  },
  {
    id: "ZAM-KOC0MII", client: "Katarzyna Wójcik", email: "k.wojcik@email.pl", phone: "+48 500 999 000",
    event: "Stypa", date: "26 sty 2026", deliveryAddress: "ul. Cicha 3, Warszawa",
    amount: "402,00 zł", amountNum: 402, status: "Zrealizowane", notes: "",
    createdAt: "12 sty 2026",
    items: [
      { name: "Patera Serów Europejskich", quantity: 1, unit: "szt.", pricePerUnit: 450, total: 450, type: "simple", foodCostPerUnit: 135,
        subItems: [
          { name: "Brie francuski", quantity: 150, unit: "g", foodCostPerUnit: 0.045 },
          { name: "Camembert z ziołami", quantity: 150, unit: "g", foodCostPerUnit: 0.04 },
          { name: "Gouda długo dojrzewająca", quantity: 200, unit: "g", foodCostPerUnit: 0.035 },
          { name: "Roquefort", quantity: 100, unit: "g", foodCostPerUnit: 0.08 },
          { name: "Winogrona", quantity: 200, unit: "g", foodCostPerUnit: 0.012 },
          { name: "Orzechy włoskie", quantity: 100, unit: "g", foodCostPerUnit: 0.06 },
          { name: "Miód akacjowy", quantity: 50, unit: "ml", foodCostPerUnit: 0.04 },
        ]
      },
    ],
  },
  {
    id: "ZAM-KOCX6J3", client: "Tomasz Kamiński", email: "t.kaminski@email.pl", phone: "+48 600 111 333",
    event: "Impreza firmowa", date: "13 sty 2026", deliveryAddress: "Biurowiec Centrum, al. Jerozolimskie 100",
    amount: "14 970,00 zł", amountNum: 14970, status: "Potwierdzone", notes: "Faktura na firmę",
    createdAt: "2 sty 2026",
    items: [
      { name: "Zestaw nr 2 Premium", quantity: 100, unit: "os.", pricePerUnit: 95, total: 9500 },
      { name: "Obsługa kelnerska 8h", quantity: 3, unit: "szt.", pricePerUnit: 450, total: 1350 },
      { name: "Patera Owoców Morza", quantity: 5, unit: "szt.", pricePerUnit: 680, total: 3400 },
      { name: "Dekoracja stołu", quantity: 5, unit: "szt.", pricePerUnit: 142, total: 710 },
    ],
  },
  {
    id: "ZAM-KOC3UTX", client: "Agnieszka Lewandowska", email: "a.lew@email.pl", phone: "+48 700 222 444",
    event: "Impreza firmowa", date: "20 sty 2026", deliveryAddress: "Hotel Marriott, Warszawa",
    amount: "4 648,00 zł", amountNum: 4648, status: "W realizacji", notes: "",
    createdAt: "6 sty 2026",
    items: [
      { name: "Zestaw nr 1 Klasyczny", quantity: 50, unit: "os.", pricePerUnit: 70, total: 3500 },
      { name: "Patera Serów Europejskich", quantity: 2, unit: "szt.", pricePerUnit: 450, total: 900 },
      { name: "Opakowanie jednorazowe", quantity: 1, unit: "szt.", pricePerUnit: 248, total: 248 },
    ],
  },
];

// ===== ORDER DETAIL VIEW =====
const OrderDetailView = ({ order, onBack, onEdit }: { order: Order; onBack: () => void; onEdit: () => void }) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Powrót
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{order.id}</h1>
          <p className="text-muted-foreground text-sm">Utworzono: {order.createdAt}</p>
        </div>
        <Badge className={cn("text-xs border", statusColors[order.status])}>{order.status}</Badge>
        <Button size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" />
          Edytuj
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Klient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Imię i nazwisko:</span> <span className="font-medium">{order.client}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{order.email}</span></div>
            <div><span className="text-muted-foreground">Telefon:</span> <span className="font-medium">{order.phone}</span></div>
          </CardContent>
        </Card>

        {/* Event info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Wydarzenie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Typ:</span> <span className="font-medium">{order.event || "Nie podano"}</span></div>
            <div><span className="text-muted-foreground">Data:</span> <span className="font-medium">{order.date}</span></div>
            <div><span className="text-muted-foreground">Adres dostawy:</span> <span className="font-medium">{order.deliveryAddress}</span></div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Pozycji:</span> <span className="font-medium">{order.items.length}</span></div>
            <div><span className="text-muted-foreground">Kwota:</span> <span className="font-semibold text-primary text-lg">{order.amount}</span></div>
            {order.notes && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">Uwagi:</span>
                <p className="font-medium mt-1">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pozycje zamówienia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Produkt</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Ilość</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Cena jedn.</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Razem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.pricePerUnit.toFixed(2)} zł</TableCell>
                  <TableCell className="text-right font-semibold">{item.total.toFixed(2)} zł</TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent border-t-2">
                <TableCell colSpan={3} className="text-right font-semibold text-foreground">Suma:</TableCell>
                <TableCell className="text-right font-bold text-primary text-lg">{order.amount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ===== ORDER EDIT VIEW =====
const OrderEditView = ({ order, onBack, onSave }: { order: Order; onBack: () => void; onSave: (o: Order) => void }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes);
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress);

  const handleSave = () => {
    onSave({ ...order, status, notes, deliveryAddress });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Powrót
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Edycja: {order.id}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Status zamówienia</CardTitle></CardHeader>
          <CardContent>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allStatuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Adres dostawy</CardTitle></CardHeader>
          <CardContent>
            <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Uwagi</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Dodatkowe uwagi do zamówienia..." />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-1" />
            Zapisz zmiany
          </Button>
          <Button variant="outline" onClick={onBack}>Anuluj</Button>
        </div>
      </div>
    </div>
  );
};

// ===== SUMMARY MODAL =====
const SummaryView = ({ orders, onBack }: { orders: Order[]; onBack: () => void }) => {
  // Aggregate all items across filtered orders
  const activeOrders = orders.filter((o) => o.status !== "Anulowane" && o.status !== "Zrealizowane");

  const itemAggregation: Record<string, { name: string; totalQty: number; unit: string; totalValue: number }> = {};
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.name;
      if (!itemAggregation[key]) {
        itemAggregation[key] = { name: item.name, totalQty: 0, unit: item.unit, totalValue: 0 };
      }
      itemAggregation[key].totalQty += item.quantity;
      itemAggregation[key].totalValue += item.total;
    });
  });

  const aggregatedItems = Object.values(itemAggregation).sort((a, b) => b.totalValue - a.totalValue);
  const totalValue = aggregatedItems.reduce((sum, i) => sum + i.totalValue, 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Powrót
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Podsumowanie zamówień</h1>
          <p className="text-muted-foreground text-sm">
            {activeOrders.length} aktywnych zamówień (Nowe, Potwierdzone, W realizacji)
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" />
          Drukuj
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktywne zamówienia</p>
            <p className="text-3xl font-bold text-foreground">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Łączna wartość</p>
            <p className="text-3xl font-bold text-primary">{totalValue.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unikalnych produktów</p>
            <p className="text-3xl font-bold text-foreground">{aggregatedItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shopping list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Lista zakupów
          </CardTitle>
          <CardDescription>Zagregowane produkty ze wszystkich aktywnych zamówień</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Produkt</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Łączna ilość</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Wartość</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.totalQty} {item.unit}</TableCell>
                  <TableCell className="text-right font-semibold">{item.totalValue.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł</TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent border-t-2">
                <TableCell colSpan={2} className="text-right font-semibold">Suma:</TableCell>
                <TableCell className="text-right font-bold text-primary text-lg">{totalValue.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-order breakdown */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Rozbicie na zamówienia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                <span className="text-sm font-medium">{order.client}</span>
                <Badge className={cn("text-[10px] border", statusColors[order.status])}>{order.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{order.date}</span>
                <span className="text-sm font-semibold">{order.amount}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ===== MAIN VIEW =====
const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "detail" | "edit" | "summary">("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (order: Order) => { setSelectedOrder(order); setView("detail"); };
  const openEdit = (order: Order) => { setSelectedOrder(order); setView("edit"); };
  const goBack = () => { setView("list"); setSelectedOrder(null); };

  const handleSaveOrder = (updated: Order) => {
    setOrders(orders.map((o) => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);
    setView("detail");
  };

  if (view === "detail" && selectedOrder) {
    return <OrderDetailView order={selectedOrder} onBack={goBack} onEdit={() => setView("edit")} />;
  }

  if (view === "edit" && selectedOrder) {
    return <OrderEditView order={selectedOrder} onBack={() => setView("detail")} onSave={handleSaveOrder} />;
  }

  if (view === "summary") {
    return <SummaryView orders={orders} onBack={goBack} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zamówienia</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj zamówieniami cateringowymi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView("summary")}>
            <FileText className="w-4 h-4 mr-1" />
            Generuj podsumowanie
          </Button>
          <Button className="gap-2">+ Dodaj zamówienie</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj zamówień..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Wszystkie statusy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {allStatuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

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
              <TableRow key={order.id} className="cursor-pointer" onClick={() => openDetail(order)}>
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
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border", statusColors[order.status])}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openDetail(order)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(order)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
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

export default OrdersView;
