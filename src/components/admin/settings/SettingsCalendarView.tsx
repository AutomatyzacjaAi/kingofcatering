import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, CalendarOff } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

const SettingsCalendarView = () => {
  const [blockedDates, setBlockedDates] = useState<Date[]>([
    new Date(2026, 2, 15),
    new Date(2026, 2, 25),
    new Date(2026, 3, 1),
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const addBlockedDate = () => {
    if (!selectedDate) return;
    const alreadyBlocked = blockedDates.some(
      (d) => d.toDateString() === selectedDate.toDateString()
    );
    if (alreadyBlocked) return;
    setBlockedDates([...blockedDates, selectedDate].sort((a, b) => a.getTime() - b.getTime()));
    setSelectedDate(undefined);
  };

  const removeBlockedDate = (date: Date) => {
    setBlockedDates(blockedDates.filter((d) => d.toDateString() !== date.toDateString()));
  };

  const isBlocked = (date: Date) =>
    blockedDates.some((d) => d.toDateString() === date.toDateString());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kalendarz</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj datami, w których nie przyjmujesz zamówień</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wybierz datę</CardTitle>
            <CardDescription>Kliknij na datę, aby ją zablokować</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={pl}
              modifiers={{ blocked: blockedDates }}
              modifiersClassNames={{
                blocked: "bg-destructive/20 text-destructive line-through",
              }}
              className={cn("p-3 pointer-events-auto")}
            />
            <Button
              onClick={addBlockedDate}
              disabled={!selectedDate || isBlocked(selectedDate)}
              className="mt-4 w-full"
            >
              <CalendarOff className="w-4 h-4 mr-2" />
              {selectedDate
                ? isBlocked(selectedDate)
                  ? "Data już zablokowana"
                  : `Zablokuj ${format(selectedDate, "d MMMM yyyy", { locale: pl })}`
                : "Wybierz datę"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zablokowane daty</CardTitle>
            <CardDescription>Lista dat, w których kalendarz jest wyłączony ({blockedDates.length})</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Brak zablokowanych dat</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarOff className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">
                        {format(date, "EEEE, d MMMM yyyy", { locale: pl })}
                      </span>
                    </div>
                    <button
                      onClick={() => removeBlockedDate(date)}
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
      </div>
    </div>
  );
};

export default SettingsCalendarView;
