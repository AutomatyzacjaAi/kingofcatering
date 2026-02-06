import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

type SizeOption = {
  id: string;
  label: string;
  multiplier: number;
  description: string;
};

const SIZE_OPTIONS: SizeOption[] = [
  { id: "small", label: "Mały", multiplier: 0.5, description: "Dla mniejszych grup" },
  { id: "standard", label: "Standard", multiplier: 1, description: "Rekomendowany" },
  { id: "large", label: "Duży", multiplier: 1.5, description: "Dla większych grup" },
  { id: "xl", label: "XL", multiplier: 2, description: "Maksymalna porcja" },
];

type ProductConfiguratorModalProps = {
  isOpen: boolean;
  product: Product | null;
  currentQuantity: number;
  suggestedQuantity: number;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
};

export function ProductConfiguratorModal({
  isOpen,
  product,
  currentQuantity,
  suggestedQuantity,
  onConfirm,
  onClose,
}: ProductConfiguratorModalProps) {
  const [quantity, setQuantity] = useState(currentQuantity || suggestedQuantity);
  const [selectedSize, setSelectedSize] = useState("standard");

  useEffect(() => {
    if (isOpen && product) {
      const sizeMultiplier = SIZE_OPTIONS.find(s => s.id === selectedSize)?.multiplier || 1;
      setQuantity(currentQuantity || Math.ceil(suggestedQuantity * sizeMultiplier));
    }
  }, [isOpen, product, currentQuantity, suggestedQuantity, selectedSize]);

  if (!isOpen || !product) return null;

  const handleSizeChange = (sizeId: string) => {
    setSelectedSize(sizeId);
    const sizeMultiplier = SIZE_OPTIONS.find(s => s.id === sizeId)?.multiplier || 1;
    setQuantity(Math.ceil(suggestedQuantity * sizeMultiplier));
  };

  const totalPrice = product.pricePerPortion * quantity;

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const handleRemove = () => {
    onConfirm(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <button onClick={onClose} className="p-2 -m-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-semibold text-lg">Konfiguruj produkt</h2>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        {/* Product Image Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <span className="text-8xl">{product.icon}</span>
        </div>

        {/* Product Info */}
        <div className="px-4 py-4 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <span className="text-xl font-bold text-primary whitespace-nowrap">
                {product.pricePerPortion} zł/szt
              </span>
            </div>
            <p className="text-muted-foreground mt-2">{product.description}</p>
          </div>

          {/* Dietary Tags */}
          {product.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.dietaryTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Size Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Rozmiar porcji</h3>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeChange(size.id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    selectedSize === size.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "font-semibold block",
                    selectedSize === size.id ? "text-primary" : "text-foreground"
                  )}>
                    {size.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{size.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Ilość</h3>
            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="h-10 w-10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-foreground">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Sugerowana ilość dla Twoich gości: {suggestedQuantity}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0 space-y-3 safe-area-bottom">
        {currentQuantity > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRemove}
          >
            Usuń z zamówienia
          </Button>
        )}
        <Button
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleConfirm}
          disabled={quantity === 0}
        >
          <Check className="w-5 h-5 mr-2" />
          {currentQuantity > 0 ? "Zaktualizuj" : "Dodaj"} • {totalPrice.toFixed(0)} zł
        </Button>
      </div>
    </div>
  );
}
