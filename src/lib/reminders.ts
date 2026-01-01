import { prisma } from "./prisma";

export const REMINDER_OPTIONS = [
  { value: 0, label: "Au moment de l'événement" },
  { value: 5, label: "5 minutes avant" },
  { value: 15, label: "15 minutes avant" },
  { value: 30, label: "30 minutes avant" },
  { value: 60, label: "1 heure avant" },
  { value: 120, label: "2 heures avant" },
  { value: 1440, label: "1 jour avant" },
  { value: 10080, label: "1 semaine avant" },
];

/**
 * Create a reminder for an event
 */
export async function createReminder(
  eventId: string,
  minutesBefore: number,
  type: "NOTIFICATION" | "EMAIL" | "BOTH" = "NOTIFICATION"
) {
  return prisma.reminder.create({
    data: {
      eventId,
      time: minutesBefore,
      type,
    },
  });
}

/**
 * Get reminders for an event
 */
export async function getEventReminders(eventId: string) {
  return prisma.reminder.findMany({
    where: { eventId },
    orderBy: { time: "asc" },
  });
}

/**
 * Delete all reminders for an event
 */
export async function deleteEventReminders(eventId: string) {
  return prisma.reminder.deleteMany({
    where: { eventId },
  });
}

/**
 * Update reminders for an event
 */
export async function updateEventReminders(
  eventId: string,
  reminders: { time: number; type: "NOTIFICATION" | "EMAIL" | "BOTH" }[]
) {
  // Delete existing reminders
  await deleteEventReminders(eventId);

  // Create new ones
  if (reminders.length > 0) {
    await prisma.reminder.createMany({
      data: reminders.map((r) => ({
        eventId,
        time: r.time,
        type: r.type,
      })),
    });
  }
}

/**
 * Get pending reminders that should be sent
 */
export async function getPendingReminders() {
  const now = new Date();

  // Find events with unsent reminders
  const reminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      event: {
        startDate: { gte: now },
      },
    },
    include: {
      event: {
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Filter reminders that should be sent now
  return reminders.filter((reminder) => {
    const reminderTime = new Date(
      reminder.event.startDate.getTime() - reminder.time * 60 * 1000
    );
    return reminderTime <= now;
  });
}

/**
 * Mark a reminder as sent
 */
export async function markReminderAsSent(reminderId: string) {
  return prisma.reminder.update({
    where: { id: reminderId },
    data: {
      sent: true,
      sentAt: new Date(),
    },
  });
}
