import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import type { OrderItem } from "@/hooks/useCateringOrder";

type Step = {
  id: string;
  name: string;
  icon: string;
};

type MobileNavProps = {
  steps: Step[];
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext?: boolean;
  nextLabel?: string;
  showNav?: boolean;
  items?: Record<string, OrderItem>;
  totalPrice?: number;
  onQuantityChange?: (productId: string, quantity: number) => void;
};

export function MobileNav({
  steps,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canGoNext = true,
  nextLabel = "Dalej",
  showNav = true,
  items = {},
  totalPrice = 0,
  onQuantityChange,
}: MobileNavProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Top Header - Progress */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="px-4 py-3">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Krok {currentStep + 1} z {totalSteps}
            </span>
            
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="text-xl">{currentStepData?.icon}</span>
              <span className="font-semibold text-foreground">{currentStepData?.name}</span>
            </div>

            {onQuantityChange && (
              <CartDrawer
                items={items}
                totalPrice={totalPrice}
                onQuantityChange={onQuantityChange}
              />
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t border-border safe-area-bottom">
          <div className="flex items-center justify-between p-4 gap-3">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={isFirstStep}
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Wstecz
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canGoNext || isLastStep}
              className="flex-1 h-12"
            >
              {nextLabel}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
