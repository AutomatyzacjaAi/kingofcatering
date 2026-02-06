import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { products, type SimpleProduct } from "@/data/products";
import type { CateringOrder } from "@/hooks/useCateringOrder";

type CartDrawerProps = {
  order: CateringOrder;
  totalPrice: number;
  onSimpleQuantityChange: (productId: string, quantity: number) => void;
  onExpandableVariantChange: (productId: string, variantId: string, quantity: number) => void;
  onConfigurableChange: (productId: string, quantity: number) => void;
};

export function CartDrawer({ 
  order, 
  totalPrice, 
  onSimpleQuantityChange,
  onExpandableVariantChange,
  onConfigurableChange,
}: CartDrawerProps) {
  // Build cart items from all product types
  const cartItems: { key: string; name: string; icon: string; price: number; quantity: number; type: "simple" | "expandable" | "configurable"; productId: string; variantId?: string }[] = [];
  
  // Simple products
  for (const [productId, qty] of Object.entries(order.simpleQuantities)) {
    if (qty > 0) {
      const product = products.find(p => p.id === productId);
      if (product && product.type === "simple") {
        cartItems.push({
          key: productId,
          name: product.name,
          icon: product.icon,
          price: product.pricePerUnit,
          quantity: qty,
          type: "simple",
          productId,
        });
      }
    }
  }
  
  // Expandable products (variants)
  for (const [productId, variants] of Object.entries(order.expandableQuantities)) {
    const product = products.find(p => p.id === productId);
    if (product && product.type === "expandable") {
      for (const [variantId, qty] of Object.entries(variants)) {
        if (qty > 0) {
          const variant = product.variants.find(v => v.id === variantId);
          if (variant) {
            cartItems.push({
              key: `${productId}-${variantId}`,
              name: variant.name,
              icon: product.icon,
              price: variant.price,
              quantity: qty,
              type: "expandable",
              productId,
              variantId,
            });
          }
        }
      }
    }
  }
  
  // Configurable products
  for (const [productId, data] of Object.entries(order.configurableData)) {
    if (data.quantity > 0) {
      const product = products.find(p => p.id === productId);
      if (product && product.type === "configurable") {
        cartItems.push({
          key: productId,
          name: product.name,
          icon: product.icon,
          price: product.pricePerPerson,
          quantity: data.quantity,
          type: "configurable",
          productId,
        });
      }
    }
  }

  const itemCount = cartItems.length;

  const handleQuantityChange = (item: typeof cartItems[0], newQty: number) => {
    if (item.type === "simple") {
      onSimpleQuantityChange(item.productId, newQty);
    } else if (item.type === "expandable" && item.variantId) {
      onExpandableVariantChange(item.productId, item.variantId, newQty);
    } else if (item.type === "configurable") {
      onConfigurableChange(item.productId, newQty);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm text-primary">
            {totalPrice.toFixed(0)} zł
          </span>
        </button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Twoje zamówienie
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Koszyk jest pusty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dodaj produkty, aby zobaczyć je tutaj
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto py-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3 p-3 rounded-xl bg-muted/50"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.price.toFixed(2)} zł × {item.quantity}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-primary">
                          {(item.price * item.quantity).toFixed(0)} zł
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleQuantityChange(item, 0)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Produktów</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Razem</span>
                <span className="font-bold text-primary">{totalPrice.toFixed(0)} zł</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
