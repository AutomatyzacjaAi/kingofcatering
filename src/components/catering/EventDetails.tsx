import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { eventTypes } from "@/data/products";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

type EventDetailsProps = {
  guestCount: number;
  eventType: string;
  eventDate: string;
  eventTime: string;
  onGuestCountChange: (count: number) => void;
  onEventTypeChange: (type: string) => void;
  onEventDateChange: (date: string) => void;
  onEventTimeChange: (time: string) => void;
};

export function EventDetails({
  guestCount,
  eventType,
  eventDate,
  eventTime,
  onGuestCountChange,
  onEventTypeChange,
  onEventDateChange,
  onEventTimeChange,
}: EventDetailsProps) {
  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Zaplanuj Wydarzenie
        </h1>
        <p className="text-muted-foreground">
          Powiedz nam więcej o swoim wydarzeniu
        </p>
      </div>

      {/* Guest Count */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Liczba Gości
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              type="number"
              min={1}
              max={1000}
              value={guestCount}
              onChange={(e) => onGuestCountChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-2xl font-bold h-14 text-center"
            />
            <div className="grid grid-cols-4 gap-2">
              {[20, 50, 100, 200].map((count) => (
                <Button
                  key={count}
                  variant={guestCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGuestCountChange(count)}
                  className="w-full"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Typ Wydarzenia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onEventTypeChange(type.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                  "hover:border-primary focus:outline-none",
                  eventType === type.id
                    ? "border-primary bg-accent text-primary"
                    : "border-border"
                )}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-xs font-medium text-center">{type.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data i Godzina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-date">Data</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-time">Godzina</Label>
            <Input
              id="event-time"
              type="time"
              value={eventTime}
              onChange={(e) => onEventTimeChange(e.target.value)}
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
