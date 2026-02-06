import { ProductCard } from "./ProductCard";
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
};

export function CategoryStep({
  categoryId,
  products,
  items,
  guestCount,
  getSuggestedQuantity,
  onQuantityChange,
  onAddWithSuggestion,
}: CategoryStepProps) {
  const category = categories.find((c) => c.id === categoryId);
  const selectedCount = products.filter((p) => items[p.id]?.quantity > 0).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-4 bg-accent/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category?.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {category?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Dla {guestCount} gości • {selectedCount} wybrano
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-4 space-y-3">
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
  );
}
