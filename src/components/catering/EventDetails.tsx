import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { eventTypes } from "@/data/products";
import { cn } from "@/lib/utils";
import { Users, Calendar, Clock } from "lucide-react";

type EventDetailsProps = {
  guestCount: number;
  eventType: string;
  eventDate: string;
  eventTime: string;
  onGuestCountChange: (count: number) => void;
  onEventTypeChange: (type: string) => void;
  onEventDateChange: (date: string) => void;
  onEventTimeChange: (time: string) => void;
  onNext: () => void;
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
  onNext,
}: EventDetailsProps) {
  const isValid = guestCount > 0 && eventType && eventDate;

  return (
    <div className="container max-w-3xl py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Zaplanuj Swoje Wydarzenie
        </h1>
        <p className="text-muted-foreground text-lg">
          Powiedz nam więcej o swoim wydarzeniu, a pomożemy dobrać idealne menu
        </p>
      </div>

      {/* Guest Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Liczba Gości
          </CardTitle>
          <CardDescription>
            Na podstawie tej liczby zaproponujemy odpowiednie ilości potraw
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                min={1}
                max={1000}
                value={guestCount}
                onChange={(e) => onGuestCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-2xl font-bold h-16 text-center"
              />
            </div>
            <div className="flex gap-2">
              {[20, 50, 100, 200].map((count) => (
                <Button
                  key={count}
                  variant={guestCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGuestCountChange(count)}
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
        <CardHeader>
          <CardTitle>Typ Wydarzenia</CardTitle>
          <CardDescription>
            Wybierz rodzaj wydarzenia, aby dostosować rekomendacje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onEventTypeChange(type.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  eventType === type.id
                    ? "border-primary bg-accent text-primary"
                    : "border-border"
                )}
              >
                <span className="text-3xl">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Data i Godzina
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Data wydarzenia</Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => onEventDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Godzina rozpoczęcia
              </Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => onEventTimeChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!isValid}
          className="px-8"
        >
          Wybierz Menu →
        </Button>
      </div>
    </div>
  );
}
