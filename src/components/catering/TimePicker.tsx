import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
};

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Wybierz godzinę rozpoczęcia</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {TIME_SLOTS.map((time) => (
          <Button
            key={time}
            variant={value === time ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(time)}
            className={cn(
              "h-10",
              value === time && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
}
