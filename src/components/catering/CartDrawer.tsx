import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { products, type Product } from "@/data/products";
import type { OrderItem } from "@/hooks/useCateringOrder";
import { cn } from "@/lib/utils";

type CartDrawerProps = {
  items: Record<string, OrderItem>;
  totalPrice: number;
  onQuantityChange: (productId: string, quantity: number) => void;
};

export function CartDrawer({ items, totalPrice, onQuantityChange }: CartDrawerProps) {
  const cartItems = Object.values(items).filter((item) => item.quantity > 0);
  const itemCount = cartItems.length;

  const getProduct = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button 
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
            itemCount > 0 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-background text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm">
            {totalPrice > 0 ? `${totalPrice.toFixed(0)} zł` : "Koszyk"}
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
              {cartItems.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-xl shrink-0">
                      {product.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {product.pricePerPortion} zł × {item.quantity}
                      </p>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
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
                            onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-primary">
                            {(product.pricePerPortion * item.quantity).toFixed(0)} zł
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onQuantityChange(item.productId, 0)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
