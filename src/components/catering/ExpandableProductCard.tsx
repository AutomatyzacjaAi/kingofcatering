import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Minus, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import type { ExpandableProduct } from "@/data/products";

type ExpandableProductCardProps = {
  product: ExpandableProduct;
  quantities: Record<string, number>; // variantId -> quantity
  onVariantQuantityChange: (productId: string, variantId: string, quantity: number) => void;
};

export function ExpandableProductCard({
  product,
  quantities,
  onVariantQuantityChange,
}: ExpandableProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const hasItems = totalItems > 0;

  return (
    <Card
      className={cn(
        "transition-all duration-200 overflow-hidden",
        hasItems && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-4">
        {/* Header - Clickable */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex gap-4 w-full text-left"
        >
          {/* Icon/Image */}
          <div
            className={cn(
              "w-20 h-20 rounded-xl flex items-center justify-center text-3xl shrink-0",
              hasItems ? "bg-primary/10" : "bg-muted"
            )}
          >
            {product.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  {product.name}
                </h3>
                <p className="text-sm text-primary font-medium">
                  Cena bazowa: {product.basePrice.toFixed(2)} zł / szt.
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-primary border-primary shrink-0">
                min. {product.minQuantity} szt.
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              {hasItems && (
                <span className="text-sm font-medium text-muted-foreground">
                  {totalItems} szt. w koszyku
                </span>
              )}
              <div className="flex items-center text-sm text-muted-foreground ml-auto">
                <span>{isExpanded ? "Zwiń" : "Rozwiń opcje"}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Expanded Variants */}
        {isExpanded && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {product.variants.map((variant) => {
              const qty = quantities[variant.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={variant.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{variant.name}</h4>
                        {variant.dietaryTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {variant.description}
                      </p>
                      
                      {/* Allergens */}
                      {variant.allergens.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] text-orange-600">
                            {variant.allergens.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm">
                          {variant.price.toFixed(2)} zł
                        </span>
                        <span className="text-xs text-muted-foreground">/ szt.</span>
                      </div>
                      
                      {!isSelected ? (
                        <Button
                          onClick={() => onVariantQuantityChange(product.id, variant.id, product.minQuantity)}
                          size="sm"
                          className="gap-1 h-8"
                        >
                          <Plus className="w-3 h-3" />
                          Dodaj
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (qty <= product.minQuantity) {
                                onVariantQuantityChange(product.id, variant.id, 0);
                              } else {
                                onVariantQuantityChange(product.id, variant.id, qty - 1);
                              }
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm">
                            {qty}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onVariantQuantityChange(product.id, variant.id, qty + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
