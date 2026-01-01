import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";
import { notifyEventUpdated, notifyEventDeleted } from "@/lib/notifications";

// GET /api/events/[id] - Récupérer un événement
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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reminders: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'accès
    const isOwner = event.ownerId === session.user.id;
    const isPartner = event.ownerId === session.user.partnerId;

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Si c'est l'événement du partenaire, appliquer la visibilité
    if (isPartner && !isOwner) {
      switch (event.visibility) {
        case "PRIVATE":
          return NextResponse.json(
            { error: "Événement privé" },
            { status: 403 }
          );
        case "BUSY_ONLY":
          return NextResponse.json({
            ...event,
            title: "Occupé(e)",
            description: null,
            location: null,
          });
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Erreur GET /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Modifier un événement
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

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (existingEvent.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que vos propres événements" },
        { status: 403 }
      );
    }

    // Valider les données
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Mettre à jour l'événement
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        isAllDay: data.isAllDay,
        visibility: data.visibility,
        status: data.status,
        categoryId: data.categoryId,
        color: data.color,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule,
        recurrenceEnd: data.recurrenceEnd,
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Créer une entrée d'historique
    await prisma.eventHistory.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        action: "UPDATED",
        changes: {
          before: JSON.parse(JSON.stringify(existingEvent)),
          after: JSON.parse(JSON.stringify(data)),
        },
      },
    });

    // Notifier le partenaire si l'événement est partagé
    if (data.visibility === "SHARED" && session.user.partnerId) {
      await notifyEventUpdated(
        session.user.partnerId,
        event.title,
        event.id,
        session.user.name || "Votre partenaire"
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Erreur PUT /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Supprimer un événement
export async function DELETE(
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

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (existingEvent.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres événements" },
        { status: 403 }
      );
    }

    // Notifier le partenaire si l'événement était partagé
    if (existingEvent.visibility === "SHARED" && session.user.partnerId) {
      await notifyEventDeleted(
        session.user.partnerId,
        existingEvent.title,
        session.user.name || "Votre partenaire"
      );
    }

    // Supprimer l'événement (cascade supprimera les relations)
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
