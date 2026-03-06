import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { pl } from "date-fns/locale";

const SettingsCalendarView = () => {
  const [blockedDates, setBlockedDates] = useState<Date[]>([
    new Date(2026, 2, 15),
    new Date(2026, 2, 25),
    new Date(2026, 3, 1),
  ]);
  const [newDate, setNewDate] = useState("");

  const addDate = () => {
    if (!newDate) return;
    const parsed = parse(newDate, "yyyy-MM-dd", new Date());
    if (!isValid(parsed)) return;
    const alreadyExists = blockedDates.some((d) => d.toDateString() === parsed.toDateString());
    if (alreadyExists) return;
    setBlockedDates([...blockedDates, parsed].sort((a, b) => a.getTime() - b.getTime()));
    setNewDate("");
  };

  const removeDate = (date: Date) => {
    setBlockedDates(blockedDates.filter((d) => d.toDateString() !== date.toDateString()));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kalendarz</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj datami, w których nie przyjmujesz zamówień</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zablokowane daty</CardTitle>
            <CardDescription>Dodaj daty, w których kalendarz będzie wyłączony ({blockedDates.length})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new date */}
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="max-w-[200px]"
                onKeyDown={(e) => e.key === "Enter" && addDate()}
              />
              <Button size="sm" onClick={addDate} disabled={!newDate}>
                <Plus className="w-4 h-4 mr-1" />
                Dodaj datę
              </Button>
            </div>

            {/* List */}
            {blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Brak zablokowanych dat</p>
            ) : (
              <div className="space-y-1.5">
                {blockedDates.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarOff className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">
                        {format(date, "EEEE, d MMMM yyyy", { locale: pl })}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDate(date)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto">Zapisz zmiany</Button>
      </div>
    </div>
  );
};

export default SettingsCalendarView;
