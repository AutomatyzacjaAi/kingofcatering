import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, Calendar, Users, Phone, Mail, PartyPopper } from "lucide-react";
import { products, categories, eventTypes } from "@/data/products";
import type { CateringOrder } from "@/hooks/useCateringOrder";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type OrderSummaryProps = {
  order: CateringOrder;
  totalPrice: number;
  onSubmit: () => void;
};

export function OrderSummary({ order, totalPrice, onSubmit }: OrderSummaryProps) {
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
    if (!dateStr) return "Do ustalenia";
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Zapytanie wysłane! 🎉",
      description: "Skontaktujemy się w ciągu 24h.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <PartyPopper className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Dziękujemy!
        </h1>
        <p className="text-muted-foreground">
          Twoje zamówienie zostało wysłane. Odezwiemy się w ciągu 24h.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Nowe zamówienie
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-8 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Podsumowanie
        </h1>
      </div>

      {/* Event Info */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{eventType?.icon}</span>
            <div>
              <p className="font-medium">{eventType?.name || "Wydarzenie"}</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.eventDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{order.guestCount} gości</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{order.contactEmail}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{order.contactPhone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {itemsByCategory.map((group) => (
            <div key={group.category.id}>
              <div className="flex items-center gap-2 mb-2">
                <span>{group.category.icon}</span>
                <h3 className="font-medium text-sm">{group.category.name}</h3>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity}× {item.product.name}
                    </span>
                    <span className="font-medium">
                      {(item.quantity * item.product.pricePerPortion).toFixed(0)} zł
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold">Razem</span>
            <span className="font-bold text-primary">{totalPrice.toFixed(0)} zł</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        size="lg" 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full h-14 text-lg"
      >
        {isSubmitting ? (
          "Wysyłanie..."
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Wyślij zapytanie
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        * Cena szacunkowa - potwierdzimy szczegóły telefonicznie
      </p>
    </div>
  );
}
