import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
  quantity: number;
  suggestedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddWithSuggestion: () => void;
};

export function ProductCard({
  product,
  quantity,
  suggestedQuantity,
  onQuantityChange,
  onAddWithSuggestion,
}: ProductCardProps) {
  const isSelected = quantity > 0;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0",
              isSelected ? "bg-primary/10" : "bg-muted"
            )}
          >
            {product.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {product.name}
              </h3>
              <span className="text-sm font-bold text-primary whitespace-nowrap">
                {product.pricePerPortion} zł
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {product.description}
            </p>

            {/* Tags */}
            {product.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {product.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-2">
              {isSelected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onQuantityChange(quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={quantity}
                      onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                      className="h-8 w-14 text-center text-sm font-bold px-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onQuantityChange(quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {(product.pricePerPortion * quantity).toFixed(0)} zł
                  </span>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={onAddWithSuggestion}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Dodaj ({suggestedQuantity})
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
