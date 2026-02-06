import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Step = {
  id: string;
  name: string;
  icon: string;
};

type ProgressBarProps = {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  getItemsCountForCategory: (categoryId: string) => number;
};

export function ProgressBar({
  steps,
  currentStep,
  onStepClick,
  getItemsCountForCategory,
}: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full bg-card border-b border-border sticky top-0 z-10">
      <div className="container py-4">
        {/* Progress bar line */}
        <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const itemCount = getItemsCountForCategory(step.id);

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[80px]",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isCurrent && "bg-accent",
                  isCompleted && "text-primary"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all",
                    isCurrent && "bg-primary text-primary-foreground shadow-lg scale-110",
                    isCompleted && "bg-primary/20 text-primary",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent && "text-primary",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
                {itemCount > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {itemCount} wybrano
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
