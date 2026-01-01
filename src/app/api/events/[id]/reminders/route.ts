import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reminderSchema = z.object({
  time: z.number().min(0),
  type: z.enum(["NOTIFICATION", "EMAIL", "BOTH"]).default("NOTIFICATION"),
});

const remindersSchema = z.array(reminderSchema);

// GET /api/events/[id]/reminders - Get reminders for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check event exists and user has access
    const event = await prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (event.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const reminders = await prisma.reminder.findMany({
      where: { eventId: id },
      orderBy: { time: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Erreur GET /api/events/[id]/reminders:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/reminders - Update reminders for an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = remindersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Check event exists and user has access
    const event = await prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (event.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const reminders = validationResult.data;

    // Delete existing reminders
    await prisma.reminder.deleteMany({
      where: { eventId: id },
    });

    // Create new reminders
    if (reminders.length > 0) {
      await prisma.reminder.createMany({
        data: reminders.map((r) => ({
          eventId: id,
          time: r.time,
          type: r.type,
        })),
      });
    }

    // Fetch and return updated reminders
    const updatedReminders = await prisma.reminder.findMany({
      where: { eventId: id },
      orderBy: { time: "asc" },
    });

    return NextResponse.json(updatedReminders);
  } catch (error) {
    console.error("Erreur PUT /api/events/[id]/reminders:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
