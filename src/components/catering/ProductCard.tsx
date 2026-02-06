import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
  isSelected: boolean;
  selectedCount?: number;
  subtitle?: string;
  onClick: () => void;
};

export function ProductCard({
  product,
  isSelected,
  selectedCount = 0,
  subtitle,
  onClick,
}: ProductCardProps) {
  const getPrice = () => {
    if (product.type === "simple") {
      return `${product.pricePerUnit.toFixed(2)} zł`;
    }
    if (product.type === "expandable") {
      const prices = product.variants.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `${min.toFixed(2)} zł` : `od ${min.toFixed(2)} zł`;
    }
    if (product.type === "configurable") {
      return `${product.pricePerPerson.toFixed(2)} zł/os.`;
    }
    return "";
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (product.type === "simple") {
      return `${product.contents.length} pozycji`;
    }
    if (product.type === "expandable") {
      return `${product.variants.length} wariantów`;
    }
    if (product.type === "configurable") {
      return `min. ${product.minPersons} osób`;
    }
    return "";
  };

  // Check if product has an image (only simple products have images for now)
  const hasImage = product.type === "simple" && product.image;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* Full-width image for products with images */}
      {hasImage && (
        <div className="relative w-full h-40">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          {selectedCount > 0 && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              {selectedCount}
            </Badge>
          )}
        </div>
      )}

      <CardContent className={cn("p-4", hasImage && "pt-3")}>
        <div className="flex items-center gap-4">
          {/* Icon - only show if no image */}
          {!hasImage && (
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
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-primary">
                {getPrice()}
              </span>
              <span className="text-xs text-muted-foreground">
                • {getSubtitle()}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {!hasImage && selectedCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {selectedCount}
              </Badge>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
