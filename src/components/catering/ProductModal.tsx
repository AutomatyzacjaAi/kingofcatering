import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Plus, Minus, AlertTriangle, X } from "lucide-react";
import type { Product, SimpleProduct, ExpandableProduct, ConfigurableProduct } from "@/data/products";

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  // Simple product
  simpleQuantity?: number;
  onSimpleQuantityChange?: (productId: string, quantity: number) => void;
  // Expandable product
  expandableQuantities?: Record<string, number>;
  onExpandableVariantChange?: (productId: string, variantId: string, quantity: number) => void;
  // Configurable product
  configurableQuantity?: number;
  configurableOptions?: Record<string, string[]>;
  onConfigurableChange?: (productId: string, quantity: number, groupId?: string, optionIds?: string[]) => void;
};

export function ProductModal({
  product,
  isOpen,
  onClose,
  simpleQuantity = 0,
  onSimpleQuantityChange,
  expandableQuantities = {},
  onExpandableVariantChange,
  configurableQuantity = 0,
  configurableOptions = {},
  onConfigurableChange,
}: ProductModalProps) {
  if (!product) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent hideCloseButton className="h-[100dvh] max-h-[100dvh] w-full max-w-full sm:max-w-full m-0 p-0 rounded-none border-0 flex flex-col">
        {/* Custom Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{product.icon}</span>
            <div>
              <DialogTitle className="text-lg font-bold">{product.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {product.type === "simple" && (
            <SimpleProductContent
              product={product}
              quantity={simpleQuantity}
              onQuantityChange={(qty) => onSimpleQuantityChange?.(product.id, qty)}
            />
          )}
          {product.type === "expandable" && (
            <ExpandableProductContent
              product={product}
              quantities={expandableQuantities}
              onVariantQuantityChange={(variantId, qty) => 
                onExpandableVariantChange?.(product.id, variantId, qty)
              }
            />
          )}
          {product.type === "configurable" && (
            <ConfigurableProductContent
              product={product}
              quantity={configurableQuantity}
              selectedOptions={configurableOptions}
              onQuantityChange={(qty) => onConfigurableChange?.(product.id, qty)}
              onOptionsChange={(groupId, optionIds) => 
                onConfigurableChange?.(product.id, configurableQuantity, groupId, optionIds)
              }
            />
          )}
        </div>

        {/* Footer with Add button */}
        <div className="p-4 border-t border-border bg-background shrink-0">
          <Button onClick={handleClose} className="w-full" size="lg">
            Gotowe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple Product Content
function SimpleProductContent({
  product,
  quantity,
  onQuantityChange,
}: {
  product: SimpleProduct;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      {product.image && (
        <div className="relative -mx-4 -mt-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Long Description */}
      {product.longDescription && (
        <p className="text-muted-foreground">
          {product.longDescription}
        </p>
      )}

      {/* Price and Quantity */}
      <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
        <div>
          <span className="text-2xl font-bold">{product.pricePerUnit.toFixed(2)} zł</span>
          <span className="text-muted-foreground ml-1">/ {product.unitLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity === 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center text-xl font-bold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contents */}
      <div>
        <h3 className="font-semibold mb-3">Zawartość patery:</h3>
        <div className="space-y-2">
          {product.contents.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Allergens */}
      {product.allergens.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-sm text-orange-700 dark:text-orange-400">
            Alergeny: {product.allergens.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

// Expandable Product Content
function ExpandableProductContent({
  product,
  quantities,
  onVariantQuantityChange,
}: {
  product: ExpandableProduct;
  quantities: Record<string, number>;
  onVariantQuantityChange: (variantId: string, qty: number) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold mb-3">Wybierz warianty:</h3>
      {product.variants.map((variant) => {
        const qty = quantities[variant.id] || 0;
        return (
          <div
            key={variant.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              qty > 0 ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">{variant.name}</div>
              <div className="text-sm text-muted-foreground">
                {variant.price.toFixed(2)} zł / szt.
              </div>
              {variant.allergens.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">
                    {variant.allergens.join(", ")}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onVariantQuantityChange(variant.id, Math.max(0, qty - 1))}
                disabled={qty === 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onVariantQuantityChange(variant.id, qty + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Configurable Product Content
function ConfigurableProductContent({
  product,
  quantity,
  selectedOptions,
  onQuantityChange,
  onOptionsChange,
}: {
  product: ConfigurableProduct;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  onQuantityChange: (qty: number) => void;
  onOptionsChange: (groupId: string, optionIds: string[]) => void;
}) {
  const toggleOption = (groupId: string, optionId: string) => {
    const group = product.optionGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const currentSelected = selectedOptions[groupId] || [];
    const isCurrentlySelected = currentSelected.includes(optionId);
    
    let newSelected: string[];
    if (isCurrentlySelected) {
      newSelected = currentSelected.filter(id => id !== optionId);
    } else {
      if (currentSelected.length >= group.maxSelections) {
        newSelected = [...currentSelected.slice(1), optionId];
      } else {
        newSelected = [...currentSelected, optionId];
      }
    }
    
    onOptionsChange(groupId, newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Price and Quantity */}
      <div className="p-4 bg-accent rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold">{product.pricePerPerson.toFixed(2)} zł</span>
            <span className="text-muted-foreground ml-1">/ osoba</span>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            min. {product.minPersons} osób
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Liczba osób:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                if (quantity <= product.minPersons) {
                  onQuantityChange(0);
                } else {
                  onQuantityChange(quantity - 1);
                }
              }}
              disabled={quantity === 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center text-xl font-bold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                if (quantity === 0) {
                  onQuantityChange(product.minPersons);
                } else {
                  onQuantityChange(quantity + 1);
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {quantity > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Suma:</span>
              <span className="text-lg font-bold text-primary">
                {(quantity * product.pricePerPerson).toFixed(2)} zł
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Option Groups */}
      {quantity > 0 && product.optionGroups.map((group) => {
        const selected = selectedOptions[group.id] || [];
        
        return (
          <div key={group.id}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{group.name}</h3>
              <span className="text-xs text-muted-foreground uppercase">
                Wybierz {selected.length} z {group.maxSelections}
              </span>
            </div>
            
            <div className="space-y-2">
              {group.options.map((option) => {
                const isChecked = selected.includes(option.id);
                
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      className="pointer-events-none"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{option.name}</span>
                      {option.allergens.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600">
                            {option.allergens.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {quantity === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Dodaj liczbę osób, aby skonfigurować zestaw
        </p>
      )}
    </div>
  );
}
