import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventInput } from "@/lib/validators";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  visibility: "PRIVATE" | "SHARED" | "BUSY_ONLY";
  status: "BUSY" | "AVAILABLE" | "OUT_OF_FRANCE" | "TENTATIVE";
  color: string | null;
  isRecurring: boolean;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  owner: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface FetchEventsParams {
  view: string;
  date: Date;
  includePartner?: boolean;
}

async function fetchEvents({
  view,
  date,
  includePartner = true,
}: FetchEventsParams): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    view,
    date: date.toISOString(),
    includePartner: String(includePartner),
  });

  const response = await fetch(`/api/events?${params}`);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des événements");
  }
  return response.json();
}

async function createEvent(data: EventInput): Promise<CalendarEvent> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création");
  }
  return response.json();
}

async function updateEvent({
  id,
  data,
}: {
  id: string;
  data: EventInput;
}): Promise<CalendarEvent> {
  const response = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la modification");
  }
  return response.json();
}

async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`/api/events/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression");
  }
}

export function useEvents(params: FetchEventsParams) {
  return useQuery({
    queryKey: ["events", params.view, params.date.toISOString(), params.includePartner],
    queryFn: () => fetchEvents(params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
