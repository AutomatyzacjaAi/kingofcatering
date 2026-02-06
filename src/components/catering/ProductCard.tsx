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
        "transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
    >
      <CardContent className="p-4">
        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "w-14 h-14 rounded-lg flex items-center justify-center text-2xl shrink-0",
              isSelected ? "bg-primary/10" : "bg-muted"
            )}
          >
            {product.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground leading-tight">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {product.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.dietaryTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary">
            {product.pricePerPortion} zł
            <span className="text-sm font-normal text-muted-foreground">/porcja</span>
          </span>
        </div>

        {/* Suggested quantity hint */}
        {!isSelected && suggestedQuantity > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Sugerowane: {suggestedQuantity} porcji</span>
          </div>
        )}

        {/* Actions */}
        {isSelected ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(quantity - 1)}
              className="h-10 w-10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              className="h-10 text-center font-bold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(quantity + 1)}
              className="h-10 w-10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={onAddWithSuggestion}
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj ({suggestedQuantity} szt.)
          </Button>
        )}

        {/* Selected total */}
        {isSelected && (
          <div className="mt-2 text-sm font-medium text-right text-primary">
            Suma: {(product.pricePerPortion * quantity).toFixed(0)} zł
          </div>
        )}
      </CardContent>
    </Card>
  );
}
