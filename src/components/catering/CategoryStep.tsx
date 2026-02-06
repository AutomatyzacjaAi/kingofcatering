import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import type { OrderItem } from "@/hooks/useCateringOrder";
import { categories } from "@/data/products";

type CategoryStepProps = {
  categoryId: string;
  products: Product[];
  items: Record<string, OrderItem>;
  guestCount: number;
  getSuggestedQuantity: (product: Product) => number;
  onQuantityChange: (productId: string, quantity: number) => void;
  onAddWithSuggestion: (productId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  totalPrice: number;
  isLastCategory: boolean;
};

export function CategoryStep({
  categoryId,
  products,
  items,
  guestCount,
  getSuggestedQuantity,
  onQuantityChange,
  onAddWithSuggestion,
  onNext,
  onPrev,
  totalPrice,
  isLastCategory,
}: CategoryStepProps) {
  const category = categories.find((c) => c.id === categoryId);
  const selectedCount = products.filter((p) => items[p.id]?.quantity > 0).length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="container py-6 border-b border-border bg-card/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{category?.icon}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {category?.name}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {category?.description} • Dla {guestCount} gości
            </p>
          </div>

          {/* Mini summary */}
          <div className="flex items-center gap-4 bg-accent rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedCount} produktów</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="font-bold text-primary text-lg">
              {totalPrice.toFixed(0)} zł
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={items[product.id]?.quantity || 0}
              suggestedQuantity={getSuggestedQuantity(product)}
              onQuantityChange={(qty) => onQuantityChange(product.id, qty)}
              onAddWithSuggestion={() => onAddWithSuggestion(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background border-t border-border py-4">
        <div className="container flex items-center justify-between">
          <Button variant="outline" onClick={onPrev} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Wstecz
          </Button>

          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <span>Możesz pominąć tę kategorię</span>
          </div>

          <Button onClick={onNext} className="gap-2">
            {isLastCategory ? "Dane kontaktowe" : "Dalej"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
