import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Plus, Minus, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import type { SimpleProduct } from "@/data/products";

type SimpleProductCardProps = {
  product: SimpleProduct;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function SimpleProductCard({
  product,
  quantity,
  onQuantityChange,
}: SimpleProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = quantity > 0;

  const handleAdd = () => {
    onQuantityChange(Math.max(product.minQuantity, 1));
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= product.minQuantity) {
      onQuantityChange(0);
    } else {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 overflow-hidden",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex gap-4">
          {/* Icon/Image */}
          <div
            className={cn(
              "w-20 h-20 rounded-xl flex items-center justify-center text-3xl shrink-0 relative",
              isSelected ? "bg-primary/10" : "bg-muted"
            )}
          >
            {product.icon}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {product.description}
            </p>
            
            {/* Price & Add */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  {product.pricePerUnit.toFixed(2)} zł
                </span>
                <span className="text-sm text-muted-foreground">
                  / {product.unitLabel}
                </span>
              </div>
              
              {!isSelected ? (
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDecrement}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleIncrement}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{isExpanded ? "Zwiń szczegóły" : "Zobacz co zawiera"}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-2 pt-3 border-t border-border animate-fade-in">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Zawiera:
            </p>
            <ul className="space-y-1">
              {product.contents.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            {/* Allergens */}
            {product.allergens.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-orange-700 dark:text-orange-300">Alergeny:</span>
                  {product.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 border-orange-300">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
