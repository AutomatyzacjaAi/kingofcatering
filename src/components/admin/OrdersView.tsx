import { useState } from "react";
import { Search, Eye, Pencil, Copy, Printer, Trash2, ChevronDown, ArrowLeft, FileText, ShoppingCart, X, Check, UtensilsCrossed, Calculator, FileDown, CookingPot, ClipboardList, Plus, User, CalendarDays, MapPin, MessageSquare, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mockClients } from "@/data/clientsData";
import { toast } from "@/components/ui/sonner";

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
      { name: "Zestaw nr 2 Premium", quantity: 100, unit: "os.", pricePerUnit: 95, total: 9500, type: "configurable", foodCostPerUnit: 32,
        subItems: [
          { name: "Polędwica wołowa z sosem z zielonym pieprzem", quantity: 100, unit: "os.", foodCostPerUnit: 12 },
          { name: "Kaczka konfitowana z jabłkami", quantity: 100, unit: "os.", foodCostPerUnit: 10 },
          { name: "Tatar z łososia z awokado", quantity: 100, unit: "os.", foodCostPerUnit: 6 },
          { name: "Crème brûlée", quantity: 100, unit: "os.", foodCostPerUnit: 3 },
          { name: "Panna cotta z malinami", quantity: 100, unit: "os.", foodCostPerUnit: 2.5 },
        ]
      },
      { name: "Obsługa kelnerska 8h", quantity: 3, unit: "szt.", pricePerUnit: 450, total: 1350, type: "service" },
      { name: "Patera Owoców Morza", quantity: 5, unit: "szt.", pricePerUnit: 680, total: 3400, type: "simple", foodCostPerUnit: 220,
        subItems: [
          { name: "Krewetki tygrysie", quantity: 1500, unit: "g", foodCostPerUnit: 0.09 },
          { name: "Łosoś wędzony", quantity: 1000, unit: "g", foodCostPerUnit: 0.06 },
          { name: "Tuńczyk sashimi", quantity: 750, unit: "g", foodCostPerUnit: 0.1 },
          { name: "Kawior czerwony", quantity: 250, unit: "g", foodCostPerUnit: 0.25 },
        ]
      },
      { name: "Dekoracja stołu", quantity: 5, unit: "szt.", pricePerUnit: 142, total: 710, type: "extra", foodCostPerUnit: 45 },
    ],
  },
  {
    id: "ZAM-KOC3UTX", client: "Agnieszka Lewandowska", email: "a.lew@email.pl", phone: "+48 700 222 444",
    event: "Impreza firmowa", date: "20 sty 2026", deliveryAddress: "Hotel Marriott, Warszawa",
    amount: "4 648,00 zł", amountNum: 4648, status: "W realizacji", notes: "",
    createdAt: "6 sty 2026",
    items: [
      { name: "Zestaw nr 1 Klasyczny", quantity: 50, unit: "os.", pricePerUnit: 70, total: 3500, type: "configurable", foodCostPerUnit: 22,
        subItems: [
          { name: "Roladki z indyka ze szpinakiem", quantity: 50, unit: "os.", foodCostPerUnit: 8 },
          { name: "Staropolski schabowy", quantity: 50, unit: "os.", foodCostPerUnit: 6 },
          { name: "Ziemniaki opiekane z rozmarynem", quantity: 50, unit: "os.", foodCostPerUnit: 2 },
          { name: "Ryż z warzywami", quantity: 50, unit: "os.", foodCostPerUnit: 1.5 },
          { name: "Sałatka grecka", quantity: 50, unit: "os.", foodCostPerUnit: 3 },
        ]
      },
      { name: "Patera Serów Europejskich", quantity: 2, unit: "szt.", pricePerUnit: 450, total: 900, type: "simple", foodCostPerUnit: 135 },
      { name: "Opakowanie jednorazowe", quantity: 1, unit: "szt.", pricePerUnit: 248, total: 248, type: "extra", foodCostPerUnit: 60 },
    ],
  },
];

// ===== DOCUMENT TYPES =====
type DocType = "offer" | "shopping-list" | "kitchen" | "food-cost" | "full";
const docLabels: Record<DocType, { label: string; Icon: LucideIcon }> = {
  "offer": { label: "Oferta", Icon: FileText },
  "shopping-list": { label: "Lista zakupów", Icon: ShoppingCart },
  "kitchen": { label: "Rozpiska na kuchnię", Icon: CookingPot },
  "food-cost": { label: "Food cost", Icon: Calculator },
  "full": { label: "Wszystko w jednym", Icon: ClipboardList },
};

const fmtNum = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ===== ORDER DOCUMENT VIEW =====
const OrderDocumentView = ({ order, docType, onBack }: { order: Order; docType: DocType; onBack: () => void }) => {
  const showOffer = docType === "offer" || docType === "full";
  const showShoppingList = docType === "shopping-list" || docType === "full";
  const showKitchen = docType === "kitchen" || docType === "full";
  const showFoodCost = docType === "food-cost" || docType === "full";

  // Aggregate ingredients
  const ingredientMap: Record<string, { name: string; totalQty: number; unit: string }> = {};
  order.items.forEach((item) => {
    if (item.subItems) {
      item.subItems.forEach((sub) => {
        const key = `${sub.name}__${sub.unit}`;
        if (!ingredientMap[key]) ingredientMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit };
        ingredientMap[key].totalQty += sub.quantity;
      });
    }
  });
  const ingredients = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));

  // Dishes for kitchen
  type DishEntry = { name: string; totalQty: number; unit: string; source: string };
  const dishMap: Record<string, DishEntry> = {};
  order.items.forEach((item) => {
    if (item.type === "service" || item.type === "extra") return;
    if ((item.type === "configurable" || item.type === "bundle") && item.subItems) {
      item.subItems.forEach((sub) => {
        const key = sub.name;
        if (!dishMap[key]) dishMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit, source: item.name };
        dishMap[key].totalQty += sub.quantity;
      });
    } else {
      const key = item.name;
      if (!dishMap[key]) dishMap[key] = { name: item.name, totalQty: 0, unit: item.unit, source: "" };
      dishMap[key].totalQty += item.quantity;
    }
  });
  const dishes = Object.values(dishMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));

  // Food cost
  const foodCostItems = order.items.filter((i) => i.type !== "service" && i.foodCostPerUnit).map((item) => ({
    name: item.name, quantity: item.quantity, unit: item.unit,
    foodCostPerUnit: item.foodCostPerUnit!, totalFoodCost: item.foodCostPerUnit! * item.quantity,
    revenue: item.total, margin: item.total > 0 ? ((item.total - item.foodCostPerUnit! * item.quantity) / item.total) * 100 : 0,
  }));
  const totalFC = foodCostItems.reduce((s, i) => s + i.totalFoodCost, 0);
  const totalRev = foodCostItems.reduce((s, i) => s + i.revenue, 0);
  const totalMargin = totalRev > 0 ? ((totalRev - totalFC) / totalRev) * 100 : 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Powrót
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {docType === "full" ? "Pełna dokumentacja" : docLabels[docType].label} — {order.id}
          </h1>
          <p className="text-muted-foreground text-sm">{order.client} · {order.date}</p>
        </div>
        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" />
          Drukuj
        </Button>
      </div>

      {/* OFERTA */}
      {showOffer && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Oferta</CardTitle>
            <CardDescription>{order.client} · {order.event || "Wydarzenie"} · {order.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 mb-4">
              <p><span className="text-muted-foreground">Adres dostawy:</span> {order.deliveryAddress}</p>
              {order.notes && <p><span className="text-muted-foreground">Uwagi:</span> {order.notes}</p>}
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Pozycja</TableHead>
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
                    <TableCell className="text-right text-muted-foreground">{fmtNum(item.pricePerUnit)} zł</TableCell>
                    <TableCell className="text-right font-semibold">{fmtNum(item.total)} zł</TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold">Suma:</TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{order.amount}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* LISTA ZAKUPÓW */}
      {showShoppingList && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Lista zakupów</CardTitle>
            <CardDescription>Składniki do zakupu</CardDescription>
          </CardHeader>
          <CardContent>
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Brak danych o składnikach</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">Składnik</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Ilość</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ing, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="text-right">{fmtNum(ing.totalQty)} {ing.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ROZPISKA NA KUCHNIĘ */}
      {showKitchen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CookingPot className="w-5 h-5 text-primary" /> Rozpiska na kuchnię</CardTitle>
            <CardDescription>Dania do przygotowania (zestawy rozbite na pozycje)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Danie</TableHead>
                  <TableHead className="font-semibold text-foreground text-muted-foreground">Źródło</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Ilość</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishes.map((dish, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{dish.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{dish.source || "—"}</TableCell>
                    <TableCell className="text-right">{dish.totalQty} {dish.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* FOOD COST */}
      {showFoodCost && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" /> Food cost</CardTitle>
            <CardDescription>Analiza kosztów i marży</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Produkt</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Ilość</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">FC/jedn.</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">FC łącznie</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Przychód</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Marża</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodCostItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtNum(item.foodCostPerUnit)} zł</TableCell>
                    <TableCell className="text-right">{fmtNum(item.totalFoodCost)} zł</TableCell>
                    <TableCell className="text-right">{fmtNum(item.revenue)} zł</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("text-xs",
                        item.margin >= 60 ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                        item.margin >= 40 ? "border-yellow-300 text-yellow-700 bg-yellow-50" :
                        "border-red-300 text-red-700 bg-red-50"
                      )}>{item.margin.toFixed(1)}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold">Suma:</TableCell>
                  <TableCell className="text-right font-bold">{fmtNum(totalFC)} zł</TableCell>
                  <TableCell className="text-right font-bold text-primary">{fmtNum(totalRev)} zł</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn("text-xs font-bold",
                      totalMargin >= 60 ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                      totalMargin >= 40 ? "border-yellow-300 text-yellow-700 bg-yellow-50" :
                      "border-red-300 text-red-700 bg-red-50"
                    )}>{totalMargin.toFixed(1)}%</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ===== ORDER DETAIL VIEW =====
const OrderDetailView = ({ order, onBack, onEdit, onGenerateDoc }: { order: Order; onBack: () => void; onEdit: () => void; onGenerateDoc: (type: DocType) => void }) => {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-1" />
              Generuj
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {(Object.keys(docLabels) as DocType[]).map((type) => {
              const DocIcon = docLabels[type].Icon;
              return (
                <DropdownMenuItem key={type} onClick={() => onGenerateDoc(type)} className="cursor-pointer">
                  <DocIcon className="w-4 h-4 mr-2" />
                  {docLabels[type].label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" />
          Edytuj
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Klient</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Imię i nazwisko:</span> <span className="font-medium">{order.client}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{order.email}</span></div>
            <div><span className="text-muted-foreground">Telefon:</span> <span className="font-medium">{order.phone}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Wydarzenie</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Typ:</span> <span className="font-medium">{order.event || "Nie podano"}</span></div>
            <div><span className="text-muted-foreground">Data:</span> <span className="font-medium">{order.date}</span></div>
            <div><span className="text-muted-foreground">Adres dostawy:</span> <span className="font-medium">{order.deliveryAddress}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Podsumowanie</CardTitle></CardHeader>
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

      <Card className="mt-6">
        <CardHeader className="pb-3"><CardTitle className="text-base">Pozycje zamówienia</CardTitle></CardHeader>
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

// ===== AVAILABLE PRODUCTS (mock catalog for adding) =====
const availableProducts: { name: string; unit: string; defaultPrice: number; type: OrderItem["type"] }[] = [
  { name: "Patera Serów Europejskich", unit: "szt.", defaultPrice: 450, type: "simple" },
  { name: "Patera Wędlin Premium", unit: "szt.", defaultPrice: 520, type: "simple" },
  { name: "Patera Owoców Morza", unit: "szt.", defaultPrice: 680, type: "simple" },
  { name: "Antipasto Włoskie", unit: "szt.", defaultPrice: 380, type: "simple" },
  { name: "Tacos z kurczakiem", unit: "szt.", defaultPrice: 18, type: "simple" },
  { name: "Tacos z wieprzowiną", unit: "szt.", defaultPrice: 18, type: "simple" },
  { name: "Tacos vege", unit: "szt.", defaultPrice: 18, type: "simple" },
  { name: "Mini Burger Klasyczny", unit: "szt.", defaultPrice: 15, type: "simple" },
  { name: "Mini Burger Vege", unit: "szt.", defaultPrice: 15, type: "simple" },
  { name: "Sushi Nigiri Sake", unit: "szt.", defaultPrice: 8, type: "simple" },
  { name: "Sushi Nigiri Maguro", unit: "szt.", defaultPrice: 10, type: "simple" },
  { name: "Zestaw nr 1 Klasyczny", unit: "os.", defaultPrice: 70, type: "configurable" },
  { name: "Zestaw nr 2 Premium", unit: "os.", defaultPrice: 95, type: "configurable" },
  { name: "Zestaw Wegetariański", unit: "os.", defaultPrice: 60, type: "configurable" },
  { name: "Obsługa kelnerska 4h", unit: "szt.", defaultPrice: 251, type: "service" },
  { name: "Obsługa kelnerska 8h", unit: "szt.", defaultPrice: 450, type: "service" },
  { name: "Obsługa kelnerska 12h", unit: "szt.", defaultPrice: 650, type: "service" },
  { name: "Dekoracja stołu", unit: "szt.", defaultPrice: 142, type: "extra" },
  { name: "Opakowanie jednorazowe", unit: "szt.", defaultPrice: 30, type: "extra" },
  { name: "LED świece", unit: "szt.", defaultPrice: 25, type: "extra" },
  { name: "Podgrzewacze", unit: "szt.", defaultPrice: 45, type: "extra" },
];

// ===== ORDER EDIT VIEW =====
const OrderEditView = ({ order, onBack, onSave }: { order: Order; onBack: () => void; onSave: (o: Order) => void }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes);
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress);
  const [items, setItems] = useState<OrderItem[]>(order.items.map(i => ({ ...i })));
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  const updateItem = (index: number, field: "quantity" | "pricePerUnit", value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.pricePerUnit;
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const addProduct = (product: typeof availableProducts[0]) => {
    setItems(prev => [...prev, {
      name: product.name,
      quantity: 1,
      unit: product.unit,
      pricePerUnit: product.defaultPrice,
      total: product.defaultPrice,
      type: product.type,
    }]);
    setShowAddProduct(false);
    setAddSearch("");
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const handleSave = () => {
    onSave({
      ...order, status, notes, deliveryAddress, items,
      amount: fmtNum(totalAmount) + " zł",
      amountNum: totalAmount,
    });
  };

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(addSearch.toLowerCase())
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Uwagi..." />
            </CardContent>
          </Card>
        </div>

        {/* Items editing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pozycje zamówienia</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddProduct(!showAddProduct)}>
                {showAddProduct ? <X className="w-4 h-4 mr-1" /> : <span className="mr-1">+</span>}
                {showAddProduct ? "Anuluj" : "Dodaj pozycję"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add product panel */}
            {showAddProduct && (
              <div className="mb-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj produktu..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.name}
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
                    >
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="text-muted-foreground text-xs">{fmtNum(product.defaultPrice)} zł / {product.unit}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">Nie znaleziono produktów</p>
                  )}
                </div>
              </div>
            )}

            {/* Items table */}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Produkt</TableHead>
                  <TableHead className="font-semibold text-foreground text-center w-32">Ilość</TableHead>
                  <TableHead className="font-semibold text-foreground text-right w-40">Cena jedn.</TableHead>
                  <TableHead className="font-semibold text-foreground text-right w-32">Razem</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 h-8 text-center text-sm"
                        />
                        <span className="text-xs text-muted-foreground">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.pricePerUnit}
                          onChange={(e) => updateItem(i, "pricePerUnit", Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 h-8 text-right text-sm"
                        />
                        <span className="text-xs text-muted-foreground">zł</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{fmtNum(item.total)} zł</TableCell>
                    <TableCell>
                      <button
                        onClick={() => removeItem(i)}
                        className="p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold text-foreground">Suma:</TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{fmtNum(totalAmount)} zł</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
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

// ===== SUMMARY SHEET =====
type SummaryDocType = "zamowienia" | "lista-zakupow" | "lista-dan" | "food-cost";
const summaryDocLabels: Record<SummaryDocType, { label: string; Icon: LucideIcon }> = {
  "zamowienia": { label: "Lista zamówień", Icon: FileText },
  "lista-zakupow": { label: "Lista zakupów", Icon: ShoppingCart },
  "lista-dan": { label: "Lista dań", Icon: CookingPot },
  "food-cost": { label: "Food cost", Icon: Calculator },
};

const parseSimpleDate = (dateStr: string): Date | null => {
  const months: Record<string, number> = {
    "sty": 0, "lut": 1, "mar": 2, "kwi": 3, "maj": 4, "cze": 5,
    "lip": 6, "sie": 7, "wrz": 8, "paź": 9, "lis": 10, "gru": 11,
  };
  const parts = dateStr.trim().split(" ");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
};

const SummarySheet = ({ open, onClose, orders }: { open: boolean; onClose: () => void; orders: Order[] }) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [docType, setDocType] = useState<SummaryDocType>("zamowienia");

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    if (!matchStatus) return false;
    if (dateFrom || dateTo) {
      const orderDate = parseSimpleDate(o.date);
      if (!orderDate) return true;
      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;
    }
    return true;
  });

  const generateCSV = () => {
    let csv = "";
    const sep = ";";

    if (docType === "zamowienia") {
      csv = ["Nr zamówienia", "Klient", "Wydarzenie", "Data", "Kwota", "Status", "Pozycje"].join(sep) + "\n";
      filteredOrders.forEach(o => {
        const itemNames = o.items.map(i => `${i.name} x${i.quantity}`).join(", ");
        csv += [o.id, o.client, o.event || "-", o.date, o.amount, o.status, `"${itemNames}"`].join(sep) + "\n";
      });
    } else if (docType === "lista-zakupow") {
      const ingredientMap: Record<string, { name: string; totalQty: number; unit: string }> = {};
      filteredOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.subItems) {
            item.subItems.forEach(sub => {
              const key = `${sub.name}__${sub.unit}`;
              if (!ingredientMap[key]) ingredientMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit };
              ingredientMap[key].totalQty += sub.quantity;
            });
          }
        });
      });
      const ingredients = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));
      csv = ["Składnik", "Ilość", "Jednostka"].join(sep) + "\n";
      ingredients.forEach(i => { csv += [i.name, fmtNum(i.totalQty), i.unit].join(sep) + "\n"; });
    } else if (docType === "lista-dan") {
      type DishEntry = { name: string; totalQty: number; unit: string; source: string };
      const dishMap: Record<string, DishEntry> = {};
      filteredOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.type === "service" || item.type === "extra") return;
          if ((item.type === "configurable" || item.type === "bundle") && item.subItems) {
            item.subItems.forEach(sub => {
              const key = `${sub.name}__dish`;
              if (!dishMap[key]) dishMap[key] = { name: sub.name, totalQty: 0, unit: sub.unit, source: item.name };
              dishMap[key].totalQty += sub.quantity;
            });
          } else {
            const key = `${item.name}__dish`;
            if (!dishMap[key]) dishMap[key] = { name: item.name, totalQty: 0, unit: item.unit, source: "" };
            dishMap[key].totalQty += item.quantity;
          }
        });
      });
      const dishes = Object.values(dishMap).sort((a, b) => a.name.localeCompare(b.name, "pl"));
      csv = ["Danie", "Ilość", "Jednostka", "Źródło"].join(sep) + "\n";
      dishes.forEach(d => { csv += [d.name, d.totalQty, d.unit, d.source || "-"].join(sep) + "\n"; });
    } else if (docType === "food-cost") {
      csv = ["Produkt", "Ilość", "Jednostka", "FC/jedn.", "FC łącznie", "Przychód", "Marża %"].join(sep) + "\n";
      filteredOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.type === "service" || !item.foodCostPerUnit) return;
          const totalFC = item.foodCostPerUnit * item.quantity;
          const margin = item.total > 0 ? ((item.total - totalFC) / item.total) * 100 : 0;
          csv += [item.name, item.quantity, item.unit, fmtNum(item.foodCostPerUnit), fmtNum(totalFC), fmtNum(item.total), margin.toFixed(1) + "%"].join(sep) + "\n";
        });
      });
    }

    return csv;
  };

  const handleDownload = () => {
    const csv = generateCSV();
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `${docType}_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Plik pobrany");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Generuj podsumowanie</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Date range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Zakres dat
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Od</Label>
                <Input
                  type="date"
                  value={dateFrom ? dateFrom.toISOString().slice(0, 10) : ""}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Do</Label>
                <Input
                  type="date"
                  value={dateTo ? dateTo.toISOString().slice(0, 10) : ""}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Status zamówień</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Document type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Rodzaj dokumentu</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(summaryDocLabels) as SummaryDocType[]).map(type => {
                const { label, Icon } = summaryDocLabels[type];
                const isSelected = docType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setDocType(type)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-medium", isSelected && "text-foreground")}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview count */}
          <div className="px-4 py-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">Zamówień w zakresie: </span>
            <span className="font-semibold text-foreground">{filteredOrders.length}</span>
            <span className="text-muted-foreground"> · Łączna kwota: </span>
            <span className="font-semibold text-primary">{fmtNum(filteredOrders.reduce((s, o) => s + o.amountNum, 0))} zł</span>
          </div>

          {/* Download */}
          <Button className="w-full" size="lg" onClick={handleDownload} disabled={filteredOrders.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Pobierz {summaryDocLabels[docType].label} (CSV)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ===== INLINE EDITABLE CELL COMPONENTS =====
const eventTypes = ["Urodziny", "Wesele", "Stypa", "Impreza firmowa", "Komunia", "Chrzciny", "Konferencja", "Inne"];

const InlineStatusSelect = ({ value, onChange }: { value: OrderStatus; onChange: (v: OrderStatus) => void }) => (
  <div onClick={(e) => e.stopPropagation()}>
    <Select value={value} onValueChange={(v) => onChange(v as OrderStatus)}>
      <SelectTrigger className="h-7 text-xs w-[130px] border-transparent bg-transparent hover:border-border focus:border-border transition-colors">
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border", statusColors[value])}>
          {value}
        </span>
      </SelectTrigger>
      <SelectContent>
        {allStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border", statusColors[s])}>
              {s}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const InlineEventSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div onClick={(e) => e.stopPropagation()}>
    <Select value={value || "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger className="h-7 text-xs w-[140px] border-transparent bg-transparent hover:border-border focus:border-border transition-colors text-muted-foreground">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Brak —</SelectItem>
        {eventTypes.map((e) => (
          <SelectItem key={e} value={e}>{e}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const InlineAmountInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value.toString());

  const commit = () => {
    const num = parseFloat(tempVal.replace(",", "."));
    if (!isNaN(num) && num >= 0) onChange(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="h-7 text-xs w-[100px] font-semibold"
        />
      </div>
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setTempVal(value.toString()); setEditing(true); }}
      className="font-semibold text-foreground cursor-text hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors"
      title="Kliknij aby edytować"
    >
      {fmtNum(value)} zł
    </span>
  );
};

// ===== ADD ORDER SHEET =====
const AddOrderSheet = ({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (order: Order) => void }) => {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const filteredClients = mockClients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.companyName.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (id: string) => {
    const c = mockClients.find(cl => cl.id === id);
    if (!c) return;
    setSelectedClientId(id);
    setClientName(`${c.firstName} ${c.lastName}`);
    setClientEmail(c.email);
    setClientPhone(c.phone);
    if (c.address && c.city) setDeliveryAddress(`${c.address}, ${c.city}`);
    setClientSearch("");
  };

  const clearClient = () => {
    setSelectedClientId(null);
    setClientName(""); setClientEmail(""); setClientPhone("");
  };

  const addProduct = (product: typeof availableProducts[0]) => {
    setItems(prev => [...prev, {
      name: product.name, quantity: 1, unit: product.unit,
      pricePerUnit: product.defaultPrice, total: product.defaultPrice, type: product.type,
    }]);
    setShowProducts(false);
    setProductSearch("");
  };

  const updateItem = (index: number, field: "quantity" | "pricePerUnit", value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.pricePerUnit;
      return updated;
    }));
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!clientName.trim()) { toast.error("Podaj dane klienta"); return; }
    if (items.length === 0) { toast.error("Dodaj przynajmniej jedną pozycję"); return; }

    const now = new Date();
    const months = ["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"];
    const dateStr = `${String(now.getDate()).padStart(2,"0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const newOrder: Order = {
      id: `ZAM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      client: clientName, email: clientEmail, phone: clientPhone,
      event, date: date || dateStr, deliveryAddress, notes, items,
      amount: fmtNum(totalAmount) + " zł", amountNum: totalAmount,
      status: "Nowe", createdAt: dateStr,
    };

    onAdd(newOrder);
    toast.success("Zamówienie dodane");

    // Reset
    setSelectedClientId(null); setClientName(""); setClientEmail(""); setClientPhone("");
    setEvent(""); setDate(""); setDeliveryAddress(""); setNotes(""); setItems([]);
    setClientSearch("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Nowe zamówienie</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Client section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Klient
            </Label>

            {selectedClientId ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{clientName}</p>
                  <p className="text-xs text-muted-foreground">{clientEmail} · {clientPhone}</p>
                </div>
                <button onClick={clearClient} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj klienta..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {clientSearch && (
                  <div className="border border-border rounded-lg max-h-36 overflow-y-auto">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectClient(c.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-b-0"
                      >
                        <span className="font-medium">{c.firstName} {c.lastName}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{c.email}</span>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">Nie znaleziono</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">lub wpisz ręcznie:</p>
                <div className="grid grid-cols-1 gap-2">
                  <Input placeholder="Imię i nazwisko" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                    <Input placeholder="Telefon" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event info */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Wydarzenie
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={event || "__none__"} onValueChange={(v) => setEvent(v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Typ wydarzenia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Brak —</SelectItem>
                  {eventTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Adres dostawy
            </Label>
            <Input placeholder="ul. Przykładowa 10, Warszawa" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Uwagi
            </Label>
            <Textarea placeholder="Alergie, preferencje..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Pozycje ({items.length})
              </Label>
              <Button variant="outline" size="sm" onClick={() => setShowProducts(!showProducts)}>
                {showProducts ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                {showProducts ? "Zamknij" : "Dodaj"}
              </Button>
            </div>

            {showProducts && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Szukaj produktu..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-9" autoFocus />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {filteredProducts.map(p => (
                    <button key={p.name} onClick={() => addProduct(p)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
                    >
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-muted-foreground text-xs">{fmtNum(p.defaultPrice)} zł/{p.unit}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Brak wyników</p>}
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30">
                    <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                    <Input
                      type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-7 text-xs text-center"
                    />
                    <span className="text-xs text-muted-foreground w-6">{item.unit}</span>
                    <Input
                      type="number" min={0} step={0.01} value={item.pricePerUnit}
                      onChange={(e) => updateItem(i, "pricePerUnit", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 h-7 text-xs text-right"
                    />
                    <span className="text-xs text-muted-foreground">zł</span>
                    <span className="text-xs font-semibold w-16 text-right">{fmtNum(item.total)} zł</span>
                    <button onClick={() => removeItem(i)} className="p-1 text-destructive/60 hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end pt-2 border-t border-border">
                  <span className="text-sm font-bold text-primary">{fmtNum(totalAmount)} zł</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button className="w-full" size="lg" onClick={handleSubmit}>
            <Check className="w-4 h-4 mr-2" />
            Utwórz zamówienie
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ===== MAIN VIEW =====
const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "detail" | "edit" | "summary" | "document">("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType>("offer");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  const updateOrderField = (orderId: string, field: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...field } : o));
  };

  const handleSaveOrder = (updated: Order) => {
    setOrders(orders.map((o) => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);
    setView("detail");
  };

  const handleGenerateDoc = (type: DocType) => {
    setSelectedDocType(type);
    setView("document");
  };

  if (view === "document" && selectedOrder) {
    return <OrderDocumentView order={selectedOrder} docType={selectedDocType} onBack={() => setView("detail")} />;
  }

  if (view === "detail" && selectedOrder) {
    return <OrderDetailView order={selectedOrder} onBack={goBack} onEdit={() => setView("edit")} onGenerateDoc={handleGenerateDoc} />;
  }

  if (view === "edit" && selectedOrder) {
    return <OrderEditView order={selectedOrder} onBack={() => setView("detail")} onSave={handleSaveOrder} />;
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
          <Button className="gap-2" onClick={() => setShowAddOrder(true)}>
            <Plus className="w-4 h-4" />
            Dodaj zamówienie
          </Button>
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
                <TableCell>
                  <InlineEventSelect
                    value={order.event}
                    onChange={(v) => updateOrderField(order.id, { event: v })}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell>
                  <InlineAmountInput
                    value={order.amountNum}
                    onChange={(v) => updateOrderField(order.id, { amountNum: v, amount: fmtNum(v) + " zł" })}
                  />
                </TableCell>
                <TableCell>
                  <InlineStatusSelect
                    value={order.status}
                    onChange={(v) => updateOrderField(order.id, { status: v })}
                  />
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

      <AddOrderSheet
        open={showAddOrder}
        onClose={() => setShowAddOrder(false)}
        onAdd={(order) => setOrders(prev => [order, ...prev])}
      />
    </div>
  );
};

export default OrdersView;
