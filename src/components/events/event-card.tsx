"use client";

import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventOwner {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface EventCategory {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date | string;
  endDate: Date | string;
  isAllDay: boolean;
  visibility: "PRIVATE" | "SHARED" | "BUSY_ONLY";
  status: "BUSY" | "AVAILABLE" | "OUT_OF_FRANCE" | "TENTATIVE";
  color: string | null;
  category: EventCategory | null;
  owner: EventOwner;
  ownerId: string;
}

interface EventCardProps {
  event: CalendarEvent;
  variant?: "compact" | "full";
  onClick?: () => void;
  currentUserId?: string;
}

export function EventCard({
  event,
  variant = "compact",
  onClick,
  currentUserId,
}: EventCardProps) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isOwner = currentUserId === event.ownerId;
  const eventColor = event.color || event.category?.color || "#3b82f6";

  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "text-xs p-1 rounded truncate cursor-pointer transition-opacity hover:opacity-80",
          !isOwner && "opacity-75"
        )}
        style={{
          backgroundColor: eventColor,
          color: "white",
        }}
        title={event.title}
      >
        {!event.isAllDay && (
          <span className="mr-1 font-medium">
            {format(startDate, "HH:mm")}
          </span>
        )}
        {event.title}
      </div>
    );
  }

  // Variant "full"
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md",
        "bg-card"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: eventColor,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm line-clamp-2">{event.title}</h4>
        {!isOwner && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {event.isAllDay ? (
            <span>
              {isSameDay(startDate, endDate)
                ? "Journée entière"
                : `${format(startDate, "d MMM", { locale: fr })} - ${format(endDate, "d MMM", { locale: fr })}`}
            </span>
          ) : (
            <span>
              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
            </span>
          )}
        </div>

        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      {event.category && (
        <div className="mt-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${event.category.color}20`,
              color: event.category.color,
            }}
          >
            {event.category.name}
          </span>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher plusieurs événements dans une cellule du calendrier
interface EventListProps {
  events: CalendarEvent[];
  maxDisplay?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onMoreClick?: () => void;
  currentUserId?: string;
}

export function EventList({
  events,
  maxDisplay = 3,
  onEventClick,
  onMoreClick,
  currentUserId,
}: EventListProps) {
  const displayEvents = events.slice(0, maxDisplay);
  const remainingCount = events.length - maxDisplay;

  return (
    <div className="space-y-1">
      {displayEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          variant="compact"
          onClick={() => onEventClick?.(event)}
          currentUserId={currentUserId}
        />
      ))}
      {remainingCount > 0 && (
        <button
          onClick={onMoreClick}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          +{remainingCount} autre{remainingCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
