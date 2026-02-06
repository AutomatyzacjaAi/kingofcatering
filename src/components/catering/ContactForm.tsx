import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare } from "lucide-react";

type ContactFormProps = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onNotesChange: (notes: string) => void;
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
}: ContactFormProps) {
  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Dane Kontaktowe
        </h1>
        <p className="text-muted-foreground">
          Wypełnij formularz kontaktowy
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Uwagi (opcjonalne)
            </Label>
            <Textarea
              id="notes"
              placeholder="Alergie, preferencje..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
