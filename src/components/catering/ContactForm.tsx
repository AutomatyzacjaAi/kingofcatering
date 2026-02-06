import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare, MapPin, Building2, Home } from "lucide-react";

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
};

export function ContactForm({
  contactName,
  contactEmail,
  contactPhone,
  contactCity,
  contactStreet,
  contactBuildingNumber,
  contactApartmentNumber,
  notes,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onCityChange,
  onStreetChange,
  onBuildingNumberChange,
  onApartmentNumberChange,
  onNotesChange,
}: ContactFormProps) {
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
              <Input
                id="name"
                placeholder="Jan Kowalski"
                value={contactName}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@firma.pl"
                value={contactEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Telefon *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+48 123 456 789"
                value={contactPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="h-12"
              />
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
                <Input
                  id="city"
                  placeholder="Kraków"
                  value={contactCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  Ulica *
                </Label>
                <Input
                  id="street"
                  placeholder="ul. Przykładowa"
                  value={contactStreet}
                  onChange={(e) => onStreetChange(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingNumber">
                  Numer budynku *
                </Label>
                <Input
                  id="buildingNumber"
                  placeholder="123"
                  value={contactBuildingNumber}
                  onChange={(e) => onBuildingNumberChange(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartmentNumber">
                  Numer lokalu (opcjonalne)
                </Label>
                <Input
                  id="apartmentNumber"
                  placeholder="4A"
                  value={contactApartmentNumber}
                  onChange={(e) => onApartmentNumberChange(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Uwagi (opcjonalne)
              </Label>
              <Textarea
                id="notes"
                placeholder="Alergie, preferencje, szczegóły lokalizacji..."
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
