import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface BlockedDate {
  id: string;
  date: Date;
  reason: string;
}

const SettingsCalendarView = () => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("blocked_date", { ascending: true });

      if (data) {
        setBlockedDates(
          data.map((d) => ({
            id: d.id,
            date: new Date(d.blocked_date + "T00:00:00"),
            reason: d.reason || "",
          }))
        );
      }
      if (error) console.error(error);
      setLoading(false);
    };
    fetch();
  }, []);

  const addDate = async () => {
    if (!newDate) return;
    const parsed = parse(newDate, "yyyy-MM-dd", new Date());
    if (!isValid(parsed)) return;
    const alreadyExists = blockedDates.some((d) => d.date.toDateString() === parsed.toDateString());
    if (alreadyExists) {
      toast.error("Ta data jest już zablokowana");
      return;
    }

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert({ blocked_date: newDate, reason: newReason || null })
      .select()
      .single();

    if (error) {
      toast.error("Błąd: " + error.message);
      return;
    }

    setBlockedDates(
      [...blockedDates, { id: data.id, date: parsed, reason: newReason }].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )
    );
    setNewDate("");
    setNewReason("");
    toast.success("Data zablokowana");
  };

  const removeDate = async (bd: BlockedDate) => {
    const { error } = await supabase.from("blocked_dates").delete().eq("id", bd.id);
    if (error) {
      toast.error("Błąd: " + error.message);
      return;
    }
    setBlockedDates(blockedDates.filter((d) => d.id !== bd.id));
    toast.success("Data odblokowana");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <CardDescription>
              Dodaj daty, w których kalendarz będzie wyłączony ({blockedDates.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="max-w-[200px]"
                onKeyDown={(e) => e.key === "Enter" && addDate()}
              />
              <Input
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Powód (opcjonalnie)"
                className="max-w-[250px]"
              />
              <Button size="sm" onClick={addDate} disabled={!newDate}>
                <Plus className="w-4 h-4 mr-1" />
                Dodaj datę
              </Button>
            </div>

            {blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Brak zablokowanych dat</p>
            ) : (
              <div className="space-y-1.5">
                {blockedDates.map((bd) => (
                  <div
                    key={bd.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarOff className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">
                        {format(bd.date, "EEEE, d MMMM yyyy", { locale: pl })}
                      </span>
                      {bd.reason && (
                        <span className="text-xs text-muted-foreground">— {bd.reason}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeDate(bd)}
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
