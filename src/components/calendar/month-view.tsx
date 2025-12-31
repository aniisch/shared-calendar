"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { EventList, type CalendarEvent } from "@/components/events";

interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthView({
  currentDate,
  onDateClick,
  events = [],
  onEventClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // L'événement est sur ce jour si :
      // - Il commence ce jour
      // - Il finit ce jour
      // - Il couvre ce jour (début avant, fin après)
      return (
        isSameDay(eventStart, date) ||
        isSameDay(eventEnd, date) ||
        (eventStart < date && eventEnd > date)
      );
    });
  };

  return (
    <div>
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                "[&:nth-child(7n)]:border-r-0"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isCurrentDay && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Events */}
              {dayEvents.length > 0 && (
                <div onClick={(e) => e.stopPropagation()}>
                  <EventList
                    events={dayEvents}
                    maxDisplay={3}
                    onEventClick={onEventClick}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
