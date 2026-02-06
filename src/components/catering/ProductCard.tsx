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

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0 relative",
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
            {selectedCount > 0 && (
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
