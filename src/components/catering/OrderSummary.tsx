import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Calendar, Users, MapPin, Phone, Mail, PartyPopper } from "lucide-react";
import { products, categories, eventTypes } from "@/data/products";
import type { CateringOrder, OrderItem } from "@/hooks/useCateringOrder";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type OrderSummaryProps = {
  order: CateringOrder;
  totalPrice: number;
  onPrev: () => void;
  onSubmit: () => void;
};

export function OrderSummary({ order, totalPrice, onPrev, onSubmit }: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const eventType = eventTypes.find((e) => e.id === order.eventType);
  const itemsByCategory = categories.map((category) => ({
    category,
    items: Object.values(order.items)
      .filter((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product?.category === category.id;
      })
      .map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId)!,
      })),
  })).filter((group) => group.items.length > 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Zapytanie wysłane! 🎉",
      description: "Skontaktujemy się z Tobą w ciągu 24 godzin.",
    });
    onSubmit();
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl py-16 text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <PartyPopper className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Dziękujemy za zapytanie!
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Twoje zamówienie zostało wysłane. Nasz zespół skontaktuje się z Tobą 
          w ciągu 24 godzin, aby omówić szczegóły.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Złóż nowe zamówienie
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Podsumowanie Zamówienia
        </h1>
        <p className="text-muted-foreground text-lg">
          Sprawdź szczegóły przed wysłaniem zapytania
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Event Details Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Szczegóły wydarzenia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-xl">{eventType?.icon}</span>
              </div>
              <div>
                <p className="font-medium">{eventType?.name}</p>
                <p className="text-sm text-muted-foreground">Typ wydarzenia</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{order.guestCount} osób</p>
                <p className="text-sm text-muted-foreground">Liczba gości</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{formatDate(order.eventDate)}</p>
                <p className="text-sm text-muted-foreground">
                  {order.eventTime || "Godzina do ustalenia"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.contactPhone}</span>
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Uwagi:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Wybrane produkty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {itemsByCategory.map((group) => (
              <div key={group.category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{group.category.icon}</span>
                  <h3 className="font-semibold">{group.category.name}</h3>
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.product.icon}</span>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {item.product.pricePerPortion} zł
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">
                        {(item.quantity * item.product.pricePerPortion).toFixed(0)} zł
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between text-xl">
              <span className="font-semibold">Razem (szacunkowo)</span>
              <span className="font-bold text-primary">{totalPrice.toFixed(0)} zł</span>
            </div>

            <p className="text-sm text-muted-foreground">
              * Ostateczna cena zostanie potwierdzona po kontakcie z naszym zespołem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wróć do edycji
        </Button>

        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="gap-2 px-8"
        >
          {isSubmitting ? (
            <>Wysyłanie...</>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Wyślij zapytanie
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
