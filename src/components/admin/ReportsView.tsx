import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data - monthly breakdown
const monthlyData = [
  { month: "Styczeń", year: 2026, orders: 12, revenue: 18420 },
  { month: "Luty", year: 2026, orders: 15, revenue: 22800 },
  { month: "Marzec", year: 2026, orders: 8, revenue: 12350 },
  { month: "Styczeń", year: 2025, orders: 9, revenue: 14200 },
  { month: "Luty", year: 2025, orders: 11, revenue: 16500 },
  { month: "Marzec", year: 2025, orders: 14, revenue: 21300 },
  { month: "Kwiecień", year: 2025, orders: 18, revenue: 27600 },
  { month: "Maj", year: 2025, orders: 22, revenue: 33400 },
  { month: "Czerwiec", year: 2025, orders: 25, revenue: 38900 },
  { month: "Lipiec", year: 2025, orders: 19, revenue: 29100 },
  { month: "Sierpień", year: 2025, orders: 16, revenue: 24800 },
  { month: "Wrzesień", year: 2025, orders: 20, revenue: 31200 },
  { month: "Październik", year: 2025, orders: 23, revenue: 35600 },
  { month: "Listopad", year: 2025, orders: 28, revenue: 43200 },
  { month: "Grudzień", year: 2025, orders: 35, revenue: 54800 },
];

const fmtPLN = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ReportsView = () => {
  const currentYear = 2026;
  const prevYear = 2025;

  const currentYearData = monthlyData.filter((d) => d.year === currentYear);
  const prevYearData = monthlyData.filter((d) => d.year === prevYear);

  const currentYearTotalOrders = currentYearData.reduce((s, d) => s + d.orders, 0);
  const currentYearTotalRevenue = currentYearData.reduce((s, d) => s + d.revenue, 0);
  const prevYearTotalOrders = prevYearData.reduce((s, d) => s + d.orders, 0);
  const prevYearTotalRevenue = prevYearData.reduce((s, d) => s + d.revenue, 0);

  const avgOrderCurrent = currentYearTotalOrders > 0 ? currentYearTotalRevenue / currentYearTotalOrders : 0;
  const avgOrderPrev = prevYearTotalOrders > 0 ? prevYearTotalRevenue / prevYearTotalOrders : 0;

  // Find max revenue month for bar visualization
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Raporty</h1>
        <p className="text-muted-foreground text-sm">Przegląd zamówień i przychodów</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Zamówienia {currentYear}</p>
            <p className="text-3xl font-bold text-foreground">{currentYearTotalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {prevYearTotalOrders} w {prevYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Przychód {currentYear}</p>
            <p className="text-3xl font-bold text-primary">{fmtPLN(currentYearTotalRevenue)} zł</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {fmtPLN(prevYearTotalRevenue)} zł w {prevYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Śr. zamówienie {currentYear}</p>
            <p className="text-3xl font-bold text-foreground">{fmtPLN(avgOrderCurrent)} zł</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {fmtPLN(avgOrderPrev)} zł w {prevYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Zmiana r/r (przychód)</p>
            {(() => {
              // Compare same months only
              const comparableMonths = currentYearData.map((d) => d.month);
              const prevComparable = prevYearData.filter((d) => comparableMonths.includes(d.month));
              const prevRev = prevComparable.reduce((s, d) => s + d.revenue, 0);
              const change = prevRev > 0 ? ((currentYearTotalRevenue - prevRev) / prevRev) * 100 : 0;
              return (
                <p className={cn("text-3xl font-bold", change >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </p>
              );
            })()}
            <p className="text-xs text-muted-foreground mt-1">porównanie tych samych miesięcy</p>
          </CardContent>
        </Card>
      </div>

      {/* Current year table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Rok {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Miesiąc</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Zamówienia</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Przychód</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Śr. zamówienie</TableHead>
                <TableHead className="font-semibold text-foreground w-1/3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentYearData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">{row.orders}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{fmtPLN(row.revenue)} zł</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.orders > 0 ? fmtPLN(row.revenue / row.orders) : "—"} zł
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(row.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent border-t-2">
                <TableCell className="font-semibold">Suma</TableCell>
                <TableCell className="text-center font-semibold">{currentYearTotalOrders}</TableCell>
                <TableCell className="text-right font-bold text-primary">{fmtPLN(currentYearTotalRevenue)} zł</TableCell>
                <TableCell className="text-right font-semibold">{fmtPLN(avgOrderCurrent)} zł</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Previous year table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rok {prevYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Miesiąc</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Zamówienia</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Przychód</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Śr. zamówienie</TableHead>
                <TableHead className="font-semibold text-foreground w-1/3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prevYearData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">{row.orders}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{fmtPLN(row.revenue)} zł</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.orders > 0 ? fmtPLN(row.revenue / row.orders) : "—"} zł
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary/60 h-2 rounded-full transition-all"
                        style={{ width: `${(row.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent border-t-2">
                <TableCell className="font-semibold">Suma</TableCell>
                <TableCell className="text-center font-semibold">{prevYearTotalOrders}</TableCell>
                <TableCell className="text-right font-bold text-primary">{fmtPLN(prevYearTotalRevenue)} zł</TableCell>
                <TableCell className="text-right font-semibold">{fmtPLN(avgOrderPrev)} zł</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
