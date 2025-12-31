"use client";

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  setHours,
  isSameDay,
  isSameHour,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type CalendarEvent } from "@/components/events";

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function WeekView({
  currentDate,
  onDateClick,
  events = [],
  onEventClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Heures de 6h à 22h
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const getEventsForSlot = (day: Date, hour: number): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);

      // Événement toute la journée ou commence à cette heure
      if (event.isAllDay) {
        return isSameDay(eventStart, day) && hour === 6; // Afficher en haut
      }

      return isSameDay(eventStart, day) && isSameHour(eventStart, setHours(day, hour));
    });
  };

  const getAllDayEvents = (day: Date): CalendarEvent[] => {
    return events.filter((event) => {
      if (!event.isAllDay) return false;
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (
        isSameDay(eventStart, day) ||
        isSameDay(eventEnd, day) ||
        (eventStart < day && eventEnd > day)
      );
    });
  };

  return (
    <div className="flex flex-col">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-card z-10">
        {/* Empty cell for time column */}
        <div className="p-2 border-r text-center text-sm text-muted-foreground" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-2 text-center border-r last:border-r-0",
              isToday(day) && "bg-primary/10"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase">
              {format(day, "EEE", { locale: fr })}
            </div>
            <div
              className={cn(
                "text-lg font-semibold",
                isToday(day) && "text-primary"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-8 border-b bg-muted/20">
        <div className="p-2 text-xs text-muted-foreground text-right border-r">
          Journée
        </div>
        {days.map((day) => {
          const allDayEvents = getAllDayEvents(day);
          return (
            <div
              key={`allday-${day.toISOString()}`}
              className={cn(
                "p-1 border-r last:border-r-0 min-h-[40px]",
                isToday(day) && "bg-primary/5"
              )}
            >
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 mb-1"
                  style={{
                    backgroundColor: event.color || event.category?.color || "#3b82f6",
                    color: "white",
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="p-2 text-xs text-muted-foreground text-right border-r border-b h-12 flex items-start justify-end">
                {hour}:00
              </div>
              {/* Day cells */}
              {days.map((day) => {
                const slotEvents = getEventsForSlot(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    onClick={() => onDateClick(setHours(day, hour))}
                    className={cn(
                      "border-r border-b last:border-r-0 h-12 cursor-pointer hover:bg-muted/50 transition-colors relative",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    {slotEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className="absolute inset-x-0 m-0.5 text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: event.color || event.category?.color || "#3b82f6",
                          color: "white",
                        }}
                      >
                        {format(new Date(event.startDate), "HH:mm")} {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
