"use client";

import {
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface YearViewProps {
  currentDate: Date;
  onMonthClick: (date: Date) => void;
}

export function YearView({ currentDate, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {months.map((month) => (
        <MiniMonth
          key={month.toISOString()}
          month={month}
          onClick={() => onMonthClick(month)}
        />
      ))}
    </div>
  );
}

interface MiniMonthProps {
  month: Date;
  onClick: () => void;
}

function MiniMonth({ month, onClick }: MiniMonthProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isCurrentMonth = isSameMonth(month, new Date());

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
        isCurrentMonth && "border-primary"
      )}
    >
      {/* Month name */}
      <div
        className={cn(
          "text-sm font-semibold mb-2 capitalize",
          isCurrentMonth && "text-primary"
        )}
      >
        {format(month, "MMMM", { locale: fr })}
      </div>

      {/* Mini calendar */}
      <div className="grid grid-cols-7 gap-0.5 text-[10px]">
        {/* Day headers */}
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-muted-foreground">
            {d}
          </div>
        ))}

        {/* Days */}
        {days.map((day, idx) => {
          const isInMonth = isSameMonth(day, month);
          const isTodayDate = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "text-center py-0.5",
                !isInMonth && "text-muted-foreground/30",
                isTodayDate && "bg-primary text-primary-foreground rounded-full"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
