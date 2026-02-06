import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Plus, Minus, ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";
import type { ConfigurableProduct } from "@/data/products";

type ConfigurableProductCardProps = {
  product: ConfigurableProduct;
  quantity: number;
  selectedOptions: Record<string, string[]>; // groupId -> optionIds[]
  onQuantityChange: (quantity: number) => void;
  onOptionsChange: (productId: string, groupId: string, optionIds: string[]) => void;
};

export function ConfigurableProductCard({
  product,
  quantity,
  selectedOptions,
  onQuantityChange,
  onOptionsChange,
}: ConfigurableProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = quantity > 0;

  const handleAdd = () => {
    onQuantityChange(product.minPersons);
    setIsExpanded(true);
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= product.minPersons) {
      onQuantityChange(0);
    } else {
      onQuantityChange(quantity - 1);
    }
  };

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
        // Replace the first one if at max
        newSelected = [...currentSelected.slice(1), optionId];
      } else {
        newSelected = [...currentSelected, optionId];
      }
    }
    
    onOptionsChange(product.id, groupId, newSelected);
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
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base">
                {product.name}
              </h3>
              <Badge variant="outline" className="text-xs text-primary border-primary shrink-0">
                min. {product.minPersons} szt.
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {product.description}
            </p>
            
            {/* Price Info Box */}
            <div className="mt-3 p-2 bg-accent rounded-lg">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">
                  {product.pricePerPerson.toFixed(2)} zł
                </span>
                <span className="text-sm text-muted-foreground">/ osobę</span>
              </div>
              
              {isSelected && (
                <p className="text-xs text-primary mt-1">
                  Wybór opcji dostępny po dodaniu do zamówienia
                </p>
              )}
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-muted-foreground">Ilość:</span>
              
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
                    className="h-9 w-9"
                    onClick={handleDecrement}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleIncrement}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configure Button */}
        {isSelected && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>{isExpanded ? "Zwiń konfigurację" : "Wybierz składniki"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
        )}

        {/* Configuration Panel */}
        {isSelected && isExpanded && (
          <div className="mt-2 space-y-4 animate-fade-in">
            {product.optionGroups.map((group) => {
              const selected = selectedOptions[group.id] || [];
              
              return (
                <div key={group.id} className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{group.name}</h4>
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
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
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
                            <span className="text-sm">{option.name}</span>
                            {option.allergens.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                <span className="text-[10px] text-orange-600">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
