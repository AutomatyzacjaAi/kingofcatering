import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Mail, Phone, MessageSquare } from "lucide-react";

type ContactFormProps = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function ContactForm({
  contactName,
  contactEmail,
  contactPhone,
  notes,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onNotesChange,
  onNext,
  onPrev,
}: ContactFormProps) {
  const isValid = contactName.trim() && contactEmail.trim() && contactPhone.trim();

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Dane Kontaktowe
        </h1>
        <p className="text-muted-foreground text-lg">
          Wypełnij formularz, abyśmy mogli się z Tobą skontaktować
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje kontaktowe</CardTitle>
          <CardDescription>
            Te dane posłużą do kontaktu w sprawie zamówienia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Dodatkowe uwagi
            </Label>
            <Textarea
              id="notes"
              placeholder="Alergie, preferencje dietetyczne, szczegóły lokalizacji..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wstecz
        </Button>

        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Podsumowanie
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
