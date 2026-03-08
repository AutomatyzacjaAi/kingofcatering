import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Users, Phone, Mail, PartyPopper, MapPin, Check, Calendar,
  UtensilsCrossed, Sparkles, Package, CreditCard, Banknote, FileText, Receipt, Truck
} from "lucide-react";
import type { Product, Category, EventType } from "@/data/products";
import type { ExtraItem, PackagingOption, WaiterServiceOption, PaymentMethod } from "@/data/extras";
import type { CateringOrder } from "@/hooks/useCateringOrder";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProductModal } from "./ProductModal";

const paymentIcons: Record<string, React.ReactNode> = {
  online: <CreditCard className="w-5 h-5 text-primary" />,
  gotowka: <Banknote className="w-5 h-5 text-primary" />,
  oferta: <FileText className="w-5 h-5 text-primary" />,
  proforma: <Receipt className="w-5 h-5 text-primary" />,
};

type OrderSummaryProps = {
  order: CateringOrder;
  totalPrice: number;
  onPaymentMethodChange: (method: string) => void;
  onSubmit: () => Promise<void>;
  onResetOrder: () => void;
  onSimpleQuantityChange: (productId: string, quantity: number) => void;
  onExpandableVariantChange: (productId: string, variantId: string, quantity: number) => void;
  onConfigurableChange: (productId: string, quantity: number, groupId?: string, optionIds?: string[]) => void;
  products: Product[];
  categories: Category[];
  eventTypes: EventType[];
  extraItems: ExtraItem[];
  packagingOptions: PackagingOption[];
  waiterServiceOptions: WaiterServiceOption[];
  paymentMethods: PaymentMethod[];
};

export function OrderSummary({ 
  order, totalPrice, onPaymentMethodChange, onSubmit, onResetOrder,
  onSimpleQuantityChange, onExpandableVariantChange, onConfigurableChange,
  products, categories, eventTypes, extraItems, packagingOptions, waiterServiceOptions, paymentMethods,
}: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedUpsellProduct, setSelectedUpsellProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const upsellProducts = useMemo(() => {
    const orderedProductIds = new Set([
      ...Object.keys(order.simpleQuantities).filter(id => order.simpleQuantities[id] > 0),
      ...Object.keys(order.expandableQuantities).filter(id => Object.values(order.expandableQuantities[id] || {}).some(qty => qty > 0)),
      ...Object.keys(order.configurableData).filter(id => order.configurableData[id]?.quantity > 0),
    ]);
    const availableProducts = products.filter(p => !orderedProductIds.has(p.id) && p.image);
    const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventType = eventTypes.find((e) => e.id === order.eventType);
  
  const summaryItems: { categoryId: string; name: string; quantity: number; price: number }[] = [];
  
  for (const [productId, qty] of Object.entries(order.simpleQuantities)) {
    if (qty > 0) {
      const product = products.find(p => p.id === productId);
      if (product && product.type === "simple") {
        summaryItems.push({ categoryId: product.category, name: product.name, quantity: qty, price: product.pricePerUnit * qty });
      }
    }
  }
  
  for (const [productId, variants] of Object.entries(order.expandableQuantities)) {
    const product = products.find(p => p.id === productId);
    if (product && product.type === "expandable") {
      for (const [variantId, qty] of Object.entries(variants)) {
        if (qty > 0) {
          const variant = product.variants.find(v => v.id === variantId);
          if (variant) summaryItems.push({ categoryId: product.category, name: variant.name, quantity: qty, price: variant.price * qty });
        }
      }
    }
  }
  
  for (const [productId, data] of Object.entries(order.configurableData)) {
    if (data.quantity > 0) {
      const product = products.find(p => p.id === productId);
      if (product && product.type === "configurable") {
        summaryItems.push({ categoryId: product.category, name: product.name, quantity: data.quantity, price: product.pricePerPerson * data.quantity });
      }
    }
  }

  const itemsByCategory = categories
    .map((category) => ({ category, items: summaryItems.filter(item => item.categoryId === category.id) }))
    .filter((group) => group.items.length > 0);

  const extrasItemsList: { name: string; quantity: number; price: number }[] = [];
  
  for (const [extraId, qty] of Object.entries(order.selectedExtras)) {
    if (qty > 0) {
      const extra = extraItems.find(e => e.id === extraId);
      if (extra) extrasItemsList.push({ name: extra.name, quantity: qty, price: extra.price * qty });
    }
  }

  const selectedPkg = packagingOptions.find(p => p.id === order.selectedPackaging);
  if (selectedPkg && selectedPkg.price > 0) {
    extrasItemsList.push({ name: selectedPkg.name, quantity: order.packagingPersonCount, price: selectedPkg.price * order.packagingPersonCount });
  }

  const selectedService = waiterServiceOptions.find(s => s.id === order.selectedWaiterService);
  if (selectedService) {
    extrasItemsList.push({ name: selectedService.name, quantity: order.waiterCount, price: selectedService.price * order.waiterCount });
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Do ustalenia";
    return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleSubmit = async () => {
    if (!order.paymentMethod) {
      toast({ title: "Wybierz metodę płatności", description: "Musisz wybrać sposób płatności przed wysłaniem.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit();
      setIsSubmitted(true);
      toast({ title: "Zapytanie wysłane! 🎉", description: "Skontaktujemy się w ciągu 24h." });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się wysłać zamówienia. Spróbuj ponownie.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <PartyPopper className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Dziękujemy!</h1>
        <p className="text-muted-foreground">Twoje zamówienie zostało wysłane. Odezwiemy się w ciągu 24h.</p>
        <Button variant="outline" onClick={() => { onResetOrder(); setIsSubmitted(false); }}>Nowe zamówienie</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-8 md:max-w-4xl md:mx-auto lg:max-w-5xl">
      {upsellProducts.length > 0 && (
        <div className="mb-6">
          <div className="text-center mb-4"><p className="text-sm text-muted-foreground">✨ A może weźmiesz jeszcze...</p></div>
          <div className="grid grid-cols-2 gap-3">
            {upsellProducts.map((product) => (
              <Card key={product.id} onClick={() => setSelectedUpsellProduct(product)} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative h-20 overflow-hidden"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
                <CardContent className="p-2">
                  <h4 className="font-medium text-xs line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-primary font-semibold">
                    {product.type === "simple" && `${product.pricePerUnit.toFixed(0)} zł`}
                    {product.type === "expandable" && `od ${Math.min(...product.variants.map(v => v.price)).toFixed(0)} zł`}
                    {product.type === "configurable" && `${product.pricePerPerson.toFixed(0)} zł/os.`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ProductModal
        product={selectedUpsellProduct}
        isOpen={!!selectedUpsellProduct}
        onClose={() => setSelectedUpsellProduct(null)}
        simpleQuantity={selectedUpsellProduct?.type === "simple" ? order.simpleQuantities[selectedUpsellProduct.id] || 0 : 0}
        onSimpleQuantityChange={onSimpleQuantityChange}
        expandableQuantities={selectedUpsellProduct?.type === "expandable" ? order.expandableQuantities[selectedUpsellProduct.id] || {} : {}}
        onExpandableVariantChange={onExpandableVariantChange}
        configurableQuantity={selectedUpsellProduct?.type === "configurable" ? order.configurableData[selectedUpsellProduct.id]?.quantity || 0 : 0}
        configurableOptions={selectedUpsellProduct?.type === "configurable" ? order.configurableData[selectedUpsellProduct.id]?.options || {} : {}}
        onConfigurableChange={onConfigurableChange}
      />

      <div className="text-center space-y-1 mb-6"><h1 className="text-2xl font-bold text-foreground md:text-3xl">Podsumowanie</h1></div>
      
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-primary" /></div>
                <div><p className="font-medium">{eventType?.name || "Wydarzenie"}</p><p className="text-sm text-muted-foreground">{formatDate(order.eventDate)}</p></div>
              </div>
              <div className="flex items-center gap-3 text-sm"><Users className="w-4 h-4 text-muted-foreground" /><span>{order.guestCount} gości</span></div>
              <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{order.contactCity && order.contactStreet ? `${order.contactStreet} ${order.contactBuildingNumber}${order.contactApartmentNumber ? `/${order.contactApartmentNumber}` : ''}, ${order.contactCity}` : "Brak adresu"}</span></div>
              <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>{order.contactEmail}</span></div>
              <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{order.contactPhone}</span></div>
            </CardContent>
          </Card>

          {itemsByCategory.length > 0 && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-primary" /><h3 className="font-semibold">Produkty</h3></div>
                {itemsByCategory.map((group) => (
                  <div key={group.category.id}>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">{group.category.name}</h4>
                    <div className="space-y-1">
                      {group.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                          <span className="font-medium">{item.price.toFixed(0)} zł</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {extrasItemsList.length > 0 && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h3 className="font-semibold">Dodatki</h3></div>
                {extrasItemsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <span className="text-muted-foreground">{item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name}</span>
                    <span className="font-medium">{item.price.toFixed(0)} zł</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 mt-4 md:mt-0">
          {selectedPkg && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-medium text-sm">{selectedPkg.name}</p><p className="text-xs text-muted-foreground">{selectedPkg.description}</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /><h3 className="font-semibold">Metoda płatności</h3></div>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => {
                  const isSelected = order.paymentMethod === method.id;
                  return (
                    <div key={method.id} onClick={() => onPaymentMethodChange(method.id)} className={cn("p-3 rounded-lg border cursor-pointer transition-all", isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
                      <div className="flex items-center gap-2">
                        {paymentIcons[method.icon] || <span>{method.icon}</span>}
                        <span className="font-medium text-sm">{method.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {order.deliveryPrice > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Dostawa</span>
                  </div>
                  <span className="font-medium">{order.deliveryPrice.toFixed(0)} zł</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Razem</span>
                <span className="font-bold text-primary text-xl">{totalPrice.toFixed(0)} zł</span>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting || !order.paymentMethod} className="w-full h-14 text-lg">
            {isSubmitting ? "Wysyłanie..." : <><Send className="w-5 h-5 mr-2" />Wyślij zapytanie</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">* Cena szacunkowa - potwierdzimy szczegóły telefonicznie</p>
        </div>
      </div>
    </div>
  );
}
