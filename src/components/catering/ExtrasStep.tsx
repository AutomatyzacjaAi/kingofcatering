import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Minus, Plus, X, Sparkles, Package, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  extrasCategories,
  extraItems,
  packagingOptions,
  waiterServiceOptions,
  type ExtraItem,
  type PackagingOption,
  type WaiterServiceOption,
} from "@/data/extras";

const categoryIcons: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
};

type ExtrasStepProps = {
  selectedExtras: Record<string, number>; // extraId -> quantity
  selectedPackaging: string | null;
  packagingPersonCount: number;
  selectedWaiterService: string | null;
  waiterCount: number;
  onExtraChange: (extraId: string, quantity: number) => void;
  onPackagingChange: (packagingId: string, personCount: number) => void;
  onWaiterServiceChange: (serviceId: string | null, count: number) => void;
  guestCount: number;
};

export function ExtrasStep({
  selectedExtras,
  selectedPackaging,
  packagingPersonCount,
  selectedWaiterService,
  waiterCount,
  onExtraChange,
  onPackagingChange,
  onWaiterServiceChange,
  guestCount,
}: ExtrasStepProps) {
  const [activeCategory, setActiveCategory] = useState(extrasCategories[0].id);
  const [selectedExtraItem, setSelectedExtraItem] = useState<ExtraItem | null>(null);
  const [selectedPackagingOption, setSelectedPackagingOption] = useState<PackagingOption | null>(null);
  const [selectedWaiterOption, setSelectedWaiterOption] = useState<WaiterServiceOption | null>(null);

  const getTotalItemsInCategory = (categoryId: string) => {
    if (categoryId === "dodatki") {
      return Object.values(selectedExtras).filter(q => q > 0).length;
    }
    if (categoryId === "pakowanie") {
      return selectedPackaging ? 1 : 0;
    }
    if (categoryId === "obsluga") {
      return selectedWaiterService ? 1 : 0;
    }
    return 0;
  };

  return (
    <div className="pb-24">
      {/* Category Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex overflow-x-auto no-scrollbar px-4">
          {extrasCategories.map((category) => {
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
                <span className="text-primary">{categoryIcons[category.icon] || <Sparkles className="w-4 h-4" />}</span>
                <span className="text-sm">{category.name}</span>
                {category.required && !itemCount && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    !
                  </Badge>
                )}
                {itemCount > 0 && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active category */}
      <div className="px-4 py-4 md:px-6 lg:px-8">
        {activeCategory === "dodatki" && (
          <ExtrasListSection
            extras={extraItems}
            selectedExtras={selectedExtras}
            onExtraClick={(extra) => setSelectedExtraItem(extra)}
          />
        )}

        {activeCategory === "pakowanie" && (
          <PackagingSection
            options={packagingOptions}
            selectedId={selectedPackaging}
            onOptionClick={(option) => setSelectedPackagingOption(option)}
          />
        )}

        {activeCategory === "obsluga" && (
          <WaiterServiceSection
            options={waiterServiceOptions}
            selectedId={selectedWaiterService}
            onOptionClick={(option) => setSelectedWaiterOption(option)}
            onNoServiceClick={() => onWaiterServiceChange(null, 0)}
          />
        )}
      </div>

      {/* Extra Item Modal */}
      <ExtraItemModal
        item={selectedExtraItem}
        isOpen={!!selectedExtraItem}
        onClose={() => setSelectedExtraItem(null)}
        quantity={selectedExtraItem ? selectedExtras[selectedExtraItem.id] || 0 : 0}
        onQuantityChange={(qty) => {
          if (selectedExtraItem) {
            onExtraChange(selectedExtraItem.id, qty);
          }
        }}
      />

      {/* Packaging Modal */}
      <PackagingModal
        option={selectedPackagingOption}
        isOpen={!!selectedPackagingOption}
        onClose={() => setSelectedPackagingOption(null)}
        isSelected={selectedPackaging === selectedPackagingOption?.id}
        personCount={selectedPackaging === selectedPackagingOption?.id ? packagingPersonCount : guestCount}
        onSelect={(count) => {
          if (selectedPackagingOption) {
            onPackagingChange(selectedPackagingOption.id, count);
          }
        }}
      />

      {/* Waiter Service Modal */}
      <WaiterServiceModal
        option={selectedWaiterOption}
        isOpen={!!selectedWaiterOption}
        onClose={() => setSelectedWaiterOption(null)}
        isSelected={selectedWaiterService === selectedWaiterOption?.id}
        waiterCount={selectedWaiterService === selectedWaiterOption?.id ? waiterCount : 1}
        onSelect={(count) => {
          if (selectedWaiterOption) {
            onWaiterServiceChange(selectedWaiterOption.id, count);
          }
        }}
      />
    </div>
  );
}

// ============= EXTRAS LIST SECTION =============

function ExtrasListSection({
  extras,
  selectedExtras,
  onExtraClick,
}: {
  extras: ExtraItem[];
  selectedExtras: Record<string, number>;
  onExtraClick: (extra: ExtraItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {extras.map((extra) => {
        const quantity = selectedExtras[extra.id] || 0;
        const isSelected = quantity > 0;
        const hasImage = extra.image;

        return (
          <Card
            key={extra.id}
            onClick={() => onExtraClick(extra)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden",
              isSelected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden",
                    !hasImage && (isSelected ? "bg-primary/10" : "bg-muted")
                  )}
                >
                  {hasImage ? (
                    <img 
                      src={extra.image} 
                      alt={extra.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{extra.icon}</span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">
                    {extra.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {extra.description}
                  </p>
                  <span className="text-sm font-bold text-primary">
                    {extra.price.toFixed(0)} zł / {extra.unitLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {quantity > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                      {quantity}
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============= EXTRA ITEM MODAL =============

function ExtraItemModal({
  item,
  isOpen,
  onClose,
  quantity,
  onQuantityChange,
}: {
  item: ExtraItem | null;
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="h-[100dvh] max-h-[100dvh] w-full max-w-full m-0 p-0 rounded-none border-0 flex flex-col md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border"
      >
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          {item.image ? (
            <div className="relative">
              <img src={item.image} alt={item.name} className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          ) : (
            <div className="pt-16 flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">{item.icon}</span>
              </div>
            </div>
          )}

          <div className="p-4 space-y-6">
            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="text-muted-foreground mt-1">{item.description}</p>
              {item.longDescription && (
                <p className="text-sm text-muted-foreground mt-2">{item.longDescription}</p>
              )}
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
              <div>
                <span className="text-2xl font-bold">{item.price.toFixed(0)} zł</span>
                <span className="text-muted-foreground ml-1">/ {item.unitLabel}</span>
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
            {item.contents && item.contents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">W zestawie:</h3>
                <div className="space-y-2">
                  {item.contents.map((content, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm">{content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background shrink-0">
          <Button onClick={onClose} className="w-full" size="lg">
            Dodaj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============= PACKAGING SECTION =============

function PackagingSection({
  options,
  selectedId,
  onOptionClick,
}: {
  options: PackagingOption[];
  selectedId: string | null;
  onOptionClick: (option: PackagingOption) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Wybierz sposób pakowania i serwowania
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        const hasImage = option.image;

        return (
          <Card
            key={option.id}
            onClick={() => onOptionClick(option)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden",
              isSelected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden",
                    !hasImage && (isSelected ? "bg-primary/10" : "bg-muted")
                  )}
                >
                  {hasImage ? (
                    <img 
                      src={option.image} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{option.icon}</span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">
                    {option.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {option.description}
                  </p>
                  <Badge
                    variant={option.price === 0 ? "secondary" : "outline"}
                    className={cn("mt-1", option.price === 0 && "bg-green-100 text-green-700")}
                  >
                    {option.priceLabel}
                  </Badge>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

// ============= PACKAGING MODAL =============

function PackagingModal({
  option,
  isOpen,
  onClose,
  isSelected,
  personCount,
  onSelect,
}: {
  option: PackagingOption | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  personCount: number;
  onSelect: (count: number) => void;
}) {
  if (!option) return null;

  const handleSelect = () => {
    onSelect(option.requiresPersonCount ? personCount : 0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="h-[100dvh] max-h-[100dvh] w-full max-w-full m-0 p-0 rounded-none border-0 flex flex-col md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border"
      >
        <DialogTitle className="sr-only">{option.name}</DialogTitle>

        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          {option.image ? (
            <div className="relative">
              <img src={option.image} alt={option.name} className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          ) : (
            <div className="pt-16 flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">{option.icon}</span>
              </div>
            </div>
          )}

          <div className="p-4 space-y-6">
            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-bold">{option.name}</h2>
              <p className="text-muted-foreground mt-1">{option.description}</p>
              {option.longDescription && (
                <p className="text-sm text-muted-foreground mt-2">{option.longDescription}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
              <div>
                <Badge
                  variant={option.price === 0 ? "secondary" : "outline"}
                  className={cn("text-lg px-3 py-1", option.price === 0 && "bg-green-100 text-green-700")}
                >
                  {option.priceLabel}
                </Badge>
              </div>
              {option.requiresPersonCount && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onSelect(Math.max(1, personCount - 1))}
                    disabled={personCount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <span className="text-xl font-bold">{personCount}</span>
                    <span className="text-sm text-muted-foreground ml-1">os.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onSelect(personCount + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Contents */}
            {option.contents && option.contents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">W zestawie:</h3>
                <div className="space-y-2">
                  {option.contents.map((content, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm">{content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background shrink-0">
          <Button onClick={handleSelect} className="w-full" size="lg">
            {isSelected ? "Zaktualizuj" : "Wybierz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============= WAITER SERVICE SECTION =============

function WaiterServiceSection({
  options,
  selectedId,
  onOptionClick,
  onNoServiceClick,
}: {
  options: WaiterServiceOption[];
  selectedId: string | null;
  onOptionClick: (option: WaiterServiceOption) => void;
  onNoServiceClick: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Dodaj profesjonalną obsługę kelnerską (opcjonalne)
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* No service option */}
        <Card
          onClick={onNoServiceClick}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            !selectedId && "ring-2 ring-primary"
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-16 h-16 rounded-lg flex items-center justify-center shrink-0",
                  !selectedId ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <span className="text-2xl">❌</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Bez obsługi</h3>
                <p className="text-xs text-muted-foreground">
                  Nie potrzebuję obsługi kelnerskiej
                </p>
              </div>
              {!selectedId && <Check className="w-5 h-5 text-primary" />}
            </div>
          </CardContent>
        </Card>

        {options.map((option) => {
        const isSelected = selectedId === option.id;
        const hasImage = option.image;

        return (
          <Card
            key={option.id}
            onClick={() => onOptionClick(option)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden",
              isSelected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden",
                    !hasImage && (isSelected ? "bg-primary/10" : "bg-muted")
                  )}
                >
                  {hasImage ? (
                    <img 
                      src={option.image} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{option.icon}</span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">
                    {option.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">
                      {option.price} zł
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {option.duration}
                    </Badge>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

// ============= WAITER SERVICE MODAL =============

function WaiterServiceModal({
  option,
  isOpen,
  onClose,
  isSelected,
  waiterCount,
  onSelect,
}: {
  option: WaiterServiceOption | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  waiterCount: number;
  onSelect: (count: number) => void;
}) {
  if (!option) return null;

  const handleSelect = () => {
    onSelect(waiterCount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="h-[100dvh] max-h-[100dvh] w-full max-w-full m-0 p-0 rounded-none border-0 flex flex-col md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border"
      >
        <DialogTitle className="sr-only">{option.name}</DialogTitle>

        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          {option.image ? (
            <div className="relative">
              <img src={option.image} alt={option.name} className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          ) : (
            <div className="pt-16 flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">{option.icon}</span>
              </div>
            </div>
          )}

          <div className="p-4 space-y-6">
            {/* Title & Description */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{option.name}</h2>
                <Badge variant="outline">{option.duration}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{option.description}</p>
              {option.longDescription && (
                <p className="text-sm text-muted-foreground mt-2">{option.longDescription}</p>
              )}
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
              <div>
                <span className="text-2xl font-bold">{option.price} zł</span>
                <span className="text-muted-foreground ml-1">/ kelner</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSelect(Math.max(1, waiterCount - 1))}
                  disabled={waiterCount <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-xl font-bold">{waiterCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSelect(waiterCount + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <span className="text-sm">Suma za {waiterCount} {waiterCount === 1 ? "kelnera" : "kelnerów"}:</span>
              <span className="text-lg font-bold text-primary">{option.price * waiterCount} zł</span>
            </div>

            {/* Contents */}
            {option.contents && option.contents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Co obejmuje:</h3>
                <div className="space-y-2">
                  {option.contents.map((content, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm">{content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background shrink-0">
          <Button onClick={handleSelect} className="w-full" size="lg">
            {isSelected ? "Zaktualizuj" : "Wybierz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
