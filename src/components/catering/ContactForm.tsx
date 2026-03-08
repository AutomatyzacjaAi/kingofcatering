import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MessageSquare, MapPin, Building2, Home, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import type { DeliveryZone } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

type ContactFormProps = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCity: string;
  contactStreet: string;
  contactBuildingNumber: string;
  contactApartmentNumber: string;
  notes: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onCityChange: (city: string) => void;
  onStreetChange: (street: string) => void;
  onBuildingNumberChange: (num: string) => void;
  onApartmentNumberChange: (num: string) => void;
  onNotesChange: (notes: string) => void;
  deliveryZones: DeliveryZone[];
  orderTotal: number;
  onDeliveryZoneMatch: (zoneId: string | null, price: number) => void;
};

function matchDeliveryZone(city: string, zones: DeliveryZone[]): DeliveryZone | null {
  if (!city.trim()) return null;
  const normalised = city.trim().toLowerCase();
  for (const zone of zones) {
    for (const zoneCity of zone.cities) {
      if (zoneCity.toLowerCase() === normalised) return zone;
    }
  }
  // Partial match
  for (const zone of zones) {
    for (const zoneCity of zone.cities) {
      if (normalised.includes(zoneCity.toLowerCase()) || zoneCity.toLowerCase().includes(normalised)) return zone;
    }
  }
  return null;
}

export function ContactForm({
  contactName, contactEmail, contactPhone, contactCity, contactStreet,
  contactBuildingNumber, contactApartmentNumber, notes,
  onNameChange, onEmailChange, onPhoneChange, onCityChange, onStreetChange,
  onBuildingNumberChange, onApartmentNumberChange, onNotesChange,
  deliveryZones, orderTotal, onDeliveryZoneMatch,
}: ContactFormProps) {

  const matchedZone = useMemo(() => {
    const zone = matchDeliveryZone(contactCity, deliveryZones);
    const price = zone
      ? (zone.free_delivery_above != null && orderTotal >= zone.free_delivery_above ? 0 : zone.price)
      : 0;
    onDeliveryZoneMatch(zone?.id ?? null, price);
    return zone;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactCity, deliveryZones, orderTotal]);

  const deliveryPrice = matchedZone
    ? (matchedZone.free_delivery_above != null && orderTotal >= matchedZone.free_delivery_above ? 0 : matchedZone.price)
    : null;

  return (
    <div className="px-4 py-6 pb-24 space-y-6 md:max-w-5xl md:mx-auto lg:max-w-6xl">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Dane Kontaktowe
        </h1>
        <p className="text-muted-foreground">
          Wypełnij formularz kontaktowy
        </p>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent className="pt-6 space-y-4">
          {/* Personal info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Imię i nazwisko *
              </Label>
              <Input id="name" placeholder="Jan Kowalski" value={contactName} onChange={(e) => onNameChange(e.target.value)} className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email *
              </Label>
              <Input id="email" type="email" placeholder="jan@firma.pl" value={contactEmail} onChange={(e) => onEmailChange(e.target.value)} className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Telefon *
              </Label>
              <Input id="phone" type="tel" placeholder="+48 123 456 789" value={contactPhone} onChange={(e) => onPhoneChange(e.target.value)} className="h-12" />
            </div>
          </div>

          {/* Address section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">Adres dostawy</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Miasto *
                </Label>
                <Input id="city" placeholder="Kraków" value={contactCity} onChange={(e) => onCityChange(e.target.value)} className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  Ulica *
                </Label>
                <Input id="street" placeholder="ul. Przykładowa" value={contactStreet} onChange={(e) => onStreetChange(e.target.value)} className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingNumber">Numer budynku *</Label>
                <Input id="buildingNumber" placeholder="123" value={contactBuildingNumber} onChange={(e) => onBuildingNumberChange(e.target.value)} className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartmentNumber">Numer lokalu (opcjonalne)</Label>
                <Input id="apartmentNumber" placeholder="4A" value={contactApartmentNumber} onChange={(e) => onApartmentNumberChange(e.target.value)} className="h-12" />
              </div>
            </div>

            {/* Delivery zone feedback */}
            {contactCity.trim().length > 0 && (
              <div className="mt-4">
                {matchedZone ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Truck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{matchedZone.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      {deliveryPrice === 0 ? (
                        <p className="text-sm text-primary font-medium">Darmowa dostawa! 🎉</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Koszt dostawy: <span className="font-semibold text-foreground">{deliveryPrice} zł</span>
                          {matchedZone.free_delivery_above != null && (
                            <span className="ml-1">
                              (darmowa od {matchedZone.free_delivery_above} zł)
                            </span>
                          )}
                        </p>
                      )}
                      {matchedZone.min_order_value != null && orderTotal < matchedZone.min_order_value && (
                        <p className="text-sm text-destructive mt-1">
                          Min. wartość zamówienia w tej strefie: {matchedZone.min_order_value} zł
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Nie znaleziono strefy dostawy</p>
                      <p className="text-xs text-muted-foreground">Skontaktuj się z nami w sprawie dostawy pod ten adres</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Uwagi (opcjonalne)
              </Label>
              <Textarea id="notes" placeholder="Alergie, preferencje, szczegóły lokalizacji..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
