import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, products, type Product } from "@/data/products";
import type { OrderItem } from "@/hooks/useCateringOrder";
import { ProductConfiguratorModal } from "./ProductConfiguratorModal";

type ProductsStepProps = {
  items: Record<string, OrderItem>;
  guestCount: number;
  getSuggestedQuantity: (product: Product) => number;
  onQuantityChange: (productId: string, quantity: number) => void;
};

export function ProductsStep({
  items,
  guestCount,
  getSuggestedQuantity,
  onQuantityChange,
}: ProductsStepProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  const categoryProducts = products.filter((p) => p.category === activeCategory);
  
  const getTotalItemsInCategory = (categoryId: string) => {
    return Object.values(items).filter((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product?.category === categoryId && item.quantity > 0;
    }).length;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsConfiguratorOpen(true);
  };

  const handleConfiguratorConfirm = (quantity: number) => {
    if (selectedProduct) {
      onQuantityChange(selectedProduct.id, quantity);
    }
  };

  return (
    <div className="pb-24">

      {/* Category Tabs - Horizontal Scroll */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById('category-tabs');
              if (container) container.scrollBy({ left: -150, behavior: 'smooth' });
            }}
            className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-background via-background to-transparent hidden md:flex items-center"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div id="category-tabs" className="flex overflow-x-auto no-scrollbar px-6 md:px-8">
            {categories.map((category) => {
              const itemCount = getTotalItemsInCategory(category.id);
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors shrink-0",
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                  {itemCount > 0 && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Right Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById('category-tabs');
              if (container) container.scrollBy({ left: 150, behavior: 'smooth' });
            }}
            className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-background via-background to-transparent hidden md:flex items-center"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 py-4 space-y-3">
        {categoryProducts.map((product) => {
          const item = items[product.id];
          const isSelected = item && item.quantity > 0;
          
          return (
            <Card
              key={product.id}
              className={cn(
                "transition-all duration-200 cursor-pointer hover:shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 relative",
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
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        {product.pricePerPortion} zł
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>

                    {/* Tags and Quantity */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-wrap gap-1">
                        {product.dietaryTags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {isSelected && (
                        <span className="text-sm font-semibold text-primary">
                          × {item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product Configurator Modal */}
      <ProductConfiguratorModal
        isOpen={isConfiguratorOpen}
        product={selectedProduct}
        currentQuantity={selectedProduct ? items[selectedProduct.id]?.quantity || 0 : 0}
        suggestedQuantity={selectedProduct ? getSuggestedQuantity(selectedProduct) : 0}
        onConfirm={handleConfiguratorConfirm}
        onClose={() => setIsConfiguratorOpen(false)}
      />
    </div>
  );
}
