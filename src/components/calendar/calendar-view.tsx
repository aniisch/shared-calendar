"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears,
  format,
  setHours,
  setMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { YearView } from "./year-view";
import { EventForm, type CalendarEvent } from "@/components/events";
import type { EventInput } from "@/lib/validators";

export type CalendarViewType = "month" | "week" | "day" | "year";

interface Category {
  id: string;
  name: string;
  color: string;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        view,
        date: currentDate.toISOString(),
        includePartner: "true",
      });

      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, view]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const goToToday = () => setCurrentDate(new Date());

  const goToPrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "year":
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const getTitle = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: fr });
      case "week":
        return `Semaine du ${format(currentDate, "d MMMM yyyy", { locale: fr })}`;
      case "day":
        return format(currentDate, "EEEE d MMMM yyyy", { locale: fr });
      case "year":
        return format(currentDate, "yyyy", { locale: fr });
    }
  };

  const handleDateClick = (date: Date) => {
    if (view === "year") {
      setCurrentDate(date);
      setView("month");
    } else if (view === "month") {
      // En vue mois, clic = ouvrir le jour
      setCurrentDate(date);
      setView("day");
    } else {
      // En vue semaine/jour, clic = créer événement
      openCreateEvent(date);
    }
  };

  const openCreateEvent = (date?: Date) => {
    const eventDate = date || currentDate;
    // Si la date n'a pas d'heure définie, mettre 9h par défaut
    const startDate = eventDate.getHours() === 0
      ? setMinutes(setHours(eventDate, 9), 0)
      : eventDate;

    setSelectedDate(startDate);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  const handleCreateEvent = async (data: EventInput) => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la création");
    }

    // Rafraîchir les événements
    await fetchEvents();
  };

  const handleUpdateEvent = async (data: EventInput) => {
    if (!editingEvent) return;

    const response = await fetch(`/api/events/${editingEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la modification");
    }

    // Rafraîchir les événements
    await fetchEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la suppression");
    }

    // Rafraîchir les événements
    await fetchEvents();
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // Préparer les defaultValues pour le formulaire
  const getFormDefaultValues = (): Partial<EventInput> | undefined => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        description: editingEvent.description,
        location: editingEvent.location,
        startDate: new Date(editingEvent.startDate),
        endDate: new Date(editingEvent.endDate),
        isAllDay: editingEvent.isAllDay,
        visibility: editingEvent.visibility,
        status: editingEvent.status,
        categoryId: editingEvent.category?.id || null,
        color: editingEvent.color,
      };
    }

    if (selectedDate) {
      const endDate = new Date(selectedDate);
      endDate.setHours(endDate.getHours() + 1);
      return {
        startDate: selectedDate,
        endDate,
      };
    }

    return undefined;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold capitalize">{getTitle()}</h1>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Aujourd&apos;hui
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View Selector */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {(["month", "week", "day", "year"] as CalendarViewType[]).map((v) => (
              <Button
                key={v}
                variant={view === v ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                className="capitalize"
              >
                {v === "month" && "Mois"}
                {v === "week" && "Semaine"}
                {v === "day" && "Jour"}
                {v === "year" && "Année"}
              </Button>
            ))}
          </div>

          {/* Create Event Button */}
          <Button onClick={() => openCreateEvent()}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Événement</span>
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="border rounded-lg bg-card overflow-hidden">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            onDateClick={handleDateClick}
            events={events}
            onEventClick={handleEventClick}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            onDateClick={handleDateClick}
            events={events}
            onEventClick={handleEventClick}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            onTimeSlotClick={handleDateClick}
            events={events}
            onEventClick={handleEventClick}
          />
        )}
        {view === "year" && (
          <YearView
            currentDate={currentDate}
            onMonthClick={handleDateClick}
          />
        )}
      </div>

      {/* Event Form Modal */}
      <EventForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        defaultValues={getFormDefaultValues()}
        categories={categories}
        mode={editingEvent ? "edit" : "create"}
      />
    </div>
  );
}
