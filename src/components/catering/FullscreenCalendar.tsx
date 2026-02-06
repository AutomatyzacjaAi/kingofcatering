import { useState } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Check, CalendarDays } from "lucide-react";

type FullscreenCalendarProps = {
  isOpen: boolean;
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  onClose: () => void;
  busyDates?: Date[];
};

// Mock busy dates - in real app these would come from backend
const generateBusyDates = (): Date[] => {
  const busy: Date[] = [];
  const today = new Date();
  // Mark some random dates as busy
  [3, 7, 12, 15, 20, 25].forEach((day) => {
    busy.push(addDays(today, day));
  });
  return busy;
};

const BUSY_DATES = generateBusyDates();

export function FullscreenCalendar({
  isOpen,
  selectedDate,
  onSelect,
  onClose,
  busyDates = BUSY_DATES,
}: FullscreenCalendarProps) {
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);
  const today = startOfDay(new Date());

  const isBusy = (date: Date) => {
    return busyDates.some(
      (busyDate) =>
        startOfDay(busyDate).getTime() === startOfDay(date).getTime()
    );
  };

  const isDisabled = (date: Date) => {
    return isBefore(startOfDay(date), today);
  };

  const handleConfirm = () => {
    if (tempDate) {
      onSelect(tempDate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-2 -m-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-semibold text-lg">Wybierz datę</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-sm">Dostępny</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive" />
          <span className="text-sm">Zajęty</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={setTempDate}
          locale={pl}
          disabled={isDisabled}
          modifiers={{
            busy: (date) => isBusy(date) && !isDisabled(date),
            available: (date) => !isBusy(date) && !isDisabled(date),
          }}
          modifiersClassNames={{
            busy: "bg-destructive/20 text-destructive hover:bg-destructive/30",
            available: "bg-primary/10 text-primary hover:bg-primary/20",
          }}
          className="rounded-lg border p-4 pointer-events-auto"
          classNames={{
            months: "flex flex-col",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
            row: "flex w-full mt-2",
            cell: "h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-12 w-12 p-0 font-normal rounded-full transition-colors",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "ring-2 ring-primary",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-30",
            day_hidden: "invisible",
          }}
        />
      </div>

      {/* Selected date display */}
      {tempDate && (
        <div className="px-4 py-3 bg-accent/50 text-center">
          <span className="text-lg font-medium">
            {format(tempDate, "EEEE, d MMMM yyyy", { locale: pl })}
          </span>
          {isBusy(tempDate) && (
            <p className="text-sm text-destructive mt-1">
              ⚠️ Ten termin może być niedostępny
            </p>
          )}
        </div>
      )}

      {/* Confirm button */}
      <div className="p-4 border-t border-border safe-area-bottom">
        <Button
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleConfirm}
          disabled={!tempDate}
        >
          <Check className="w-5 h-5 mr-2" />
          Potwierdź datę
        </Button>
      </div>
    </div>
  );
}
