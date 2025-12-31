"use client";

import { format, setHours, setMinutes, isSameDay, getHours } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type CalendarEvent } from "@/components/events";

interface DayViewProps {
  currentDate: Date;
  onTimeSlotClick: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function DayView({
  currentDate,
  onTimeSlotClick,
  events = [],
  onEventClick,
}: DayViewProps) {
  // Heures de 0h à 23h
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      if (!isSameDay(eventStart, currentDate)) return false;
      if (event.isAllDay) return false;
      return getHours(eventStart) === hour;
    });
  };

  const getAllDayEvents = (): CalendarEvent[] => {
    return events.filter((event) => {
      if (!event.isAllDay) return false;
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (
        isSameDay(eventStart, currentDate) ||
        isSameDay(eventEnd, currentDate) ||
        (eventStart < currentDate && eventEnd > currentDate)
      );
    });
  };

  const allDayEvents = getAllDayEvents();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b text-center">
        <div className="text-sm text-muted-foreground uppercase">
          {format(currentDate, "EEEE", { locale: fr })}
        </div>
        <div className="text-3xl font-bold">
          {format(currentDate, "d MMMM", { locale: fr })}
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-3 border-b bg-muted/20">
          <div className="text-xs text-muted-foreground mb-2">Journée entière</div>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-2 rounded cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: event.color || event.category?.color || "#3b82f6",
                  color: "white",
                }}
              >
                <div className="font-medium">{event.title}</div>
                {event.location && (
                  <div className="text-xs opacity-80">{event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto max-h-[600px]">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);

          return (
            <div key={hour} className="flex border-b">
              {/* Time label */}
              <div className="w-20 p-2 text-sm text-muted-foreground text-right border-r flex-shrink-0">
                {hour.toString().padStart(2, "0")}:00
              </div>

              {/* Time slots (2 per hour: :00 and :30) */}
              <div className="flex-1 relative">
                <div
                  onClick={() => onTimeSlotClick(setMinutes(setHours(currentDate, hour), 0))}
                  className={cn(
                    "h-6 border-b border-dashed cursor-pointer hover:bg-muted/50 transition-colors",
                    hourEvents.length > 0 && "pointer-events-none"
                  )}
                />
                <div
                  onClick={() => onTimeSlotClick(setMinutes(setHours(currentDate, hour), 30))}
                  className="h-6 cursor-pointer hover:bg-muted/50 transition-colors"
                />

                {/* Events */}
                {hourEvents.map((event) => {
                  const startMinutes = new Date(event.startDate).getMinutes();
                  const endDate = new Date(event.endDate);
                  const durationMinutes =
                    (endDate.getTime() - new Date(event.startDate).getTime()) / 60000;
                  const heightPx = Math.max(24, (durationMinutes / 60) * 48); // 48px per hour

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="absolute left-1 right-1 rounded p-2 cursor-pointer hover:opacity-80 overflow-hidden"
                      style={{
                        top: `${(startMinutes / 60) * 48}px`,
                        height: `${heightPx}px`,
                        backgroundColor: event.color || event.category?.color || "#3b82f6",
                        color: "white",
                      }}
                    >
                      <div className="text-sm font-medium truncate">
                        {format(new Date(event.startDate), "HH:mm")} - {event.title}
                      </div>
                      {heightPx > 40 && event.location && (
                        <div className="text-xs opacity-80 truncate">{event.location}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
