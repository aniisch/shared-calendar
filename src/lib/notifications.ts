import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  todoId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  eventId,
  todoId,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        eventId,
        todoId,
      },
    });
  } catch (error) {
    console.error("Erreur création notification:", error);
    return null;
  }
}

// Notifications pour les événements
export async function notifyEventCreated(
  partnerId: string,
  eventTitle: string,
  eventId: string,
  creatorName: string
) {
  return createNotification({
    userId: partnerId,
    type: "EVENT_CREATED",
    title: "Nouvel événement partagé",
    message: `${creatorName} a créé "${eventTitle}"`,
    eventId,
  });
}

export async function notifyEventUpdated(
  partnerId: string,
  eventTitle: string,
  eventId: string,
  updaterName: string
) {
  return createNotification({
    userId: partnerId,
    type: "EVENT_UPDATED",
    title: "Événement modifié",
    message: `${updaterName} a modifié "${eventTitle}"`,
    eventId,
  });
}

export async function notifyEventDeleted(
  partnerId: string,
  eventTitle: string,
  deleterName: string
) {
  return createNotification({
    userId: partnerId,
    type: "EVENT_DELETED",
    title: "Événement supprimé",
    message: `${deleterName} a supprimé "${eventTitle}"`,
  });
}

// Notifications pour les todos
export async function notifyTodoAssigned(
  assigneeId: string,
  todoTitle: string,
  todoId: string,
  assignerName: string
) {
  return createNotification({
    userId: assigneeId,
    type: "TODO_ASSIGNED",
    title: "Nouvelle tâche assignée",
    message: `${assignerName} vous a assigné "${todoTitle}"`,
    todoId,
  });
}

export async function notifyTodoCompleted(
  partnerId: string,
  todoTitle: string,
  todoId: string,
  completerName: string
) {
  return createNotification({
    userId: partnerId,
    type: "TODO_COMPLETED",
    title: "Tâche terminée",
    message: `${completerName} a terminé "${todoTitle}"`,
    todoId,
  });
}

// Notifications partenaire
export async function notifyPartnerAccepted(
  userId: string,
  partnerName: string
) {
  return createNotification({
    userId,
    type: "PARTNER_ACCEPTED",
    title: "Partenaire accepté",
    message: `${partnerName} a accepté votre invitation !`,
  });
}

export async function notifyPartnerInvitation(
  userId: string,
  senderName: string
) {
  return createNotification({
    userId,
    type: "PARTNER_INVITATION",
    title: "Nouvelle invitation",
    message: `${senderName} vous invite à partager un calendrier`,
  });
}
