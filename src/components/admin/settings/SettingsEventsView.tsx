import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface EventType {
  id: string;
  name: string;
  icon: string;
}

const defaultEvents: EventType[] = [
  { id: "1", name: "Wesele", icon: "💒" },
  { id: "2", name: "Konferencja", icon: "🎤" },
  { id: "3", name: "Urodziny", icon: "🎂" },
  { id: "4", name: "Spotkanie firmowe", icon: "💼" },
  { id: "5", name: "Impreza", icon: "🎉" },
  { id: "6", name: "Inne", icon: "📋" },
];

const SettingsEventsView = () => {
  const [events, setEvents] = useState<EventType[]>(defaultEvents);
  const [newEventName, setNewEventName] = useState("");

  const addEvent = () => {
    if (!newEventName.trim()) return;
    setEvents([...events, { id: Date.now().toString(), name: newEventName.trim(), icon: "📋" }]);
    setNewEventName("");
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const updateEventName = (id: string, name: string) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rodzaje wydarzeń</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj typami wydarzeń dostępnymi w formularzu zamówienia</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista wydarzeń</CardTitle>
            <CardDescription>Dodawaj, edytuj i usuwaj typy wydarzeń</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 group">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />
                <span className="text-lg">{event.icon}</span>
                <Input
                  value={event.name}
                  onChange={(e) => updateEventName(event.id, e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={() => removeEvent(event.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-4" />
              <span className="text-lg">📋</span>
              <Input
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Nazwa nowego wydarzenia..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
              />
              <Button size="sm" variant="outline" onClick={addEvent} disabled={!newEventName.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto">Zapisz zmiany</Button>
      </div>
    </div>
  );
};

export default SettingsEventsView;
