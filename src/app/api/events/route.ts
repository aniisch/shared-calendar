import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

// GET /api/events - Liste des événements
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "month"; // day, week, month, year
    const dateStr = searchParams.get("date"); // Date de référence
    const includePartner = searchParams.get("includePartner") === "true";

    // Date de référence
    const referenceDate = dateStr ? new Date(dateStr) : new Date();

    // Calculer la plage de dates selon la vue
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case "day":
        startDate = startOfDay(referenceDate);
        endDate = endOfDay(referenceDate);
        break;
      case "week":
        startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
        endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
        break;
      case "year":
        startDate = new Date(referenceDate.getFullYear(), 0, 1);
        endDate = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case "month":
      default:
        // Pour la vue mois, inclure les jours adjacents visibles
        const monthStart = startOfMonth(referenceDate);
        const monthEnd = endOfMonth(referenceDate);
        startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        break;
    }

    // Construire la requête
    const userIds = [session.user.id];

    // Inclure les événements du partenaire si demandé
    if (includePartner && session.user.partnerId) {
      userIds.push(session.user.partnerId);
    }

    const events = await prisma.event.findMany({
      where: {
        ownerId: { in: userIds },
        OR: [
          // Événements dans la plage
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
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
      orderBy: { startDate: "asc" },
    });

    // Filtrer les événements du partenaire selon leur visibilité
    const filteredEvents = events.map((event) => {
      // Si c'est notre événement, tout afficher
      if (event.ownerId === session.user.id) {
        return event;
      }

      // Événement du partenaire - appliquer la visibilité
      switch (event.visibility) {
        case "SHARED":
          return event; // Tout visible
        case "BUSY_ONLY":
          return {
            ...event,
            title: "Occupé(e)",
            description: null,
            location: null,
          };
        case "PRIVATE":
        default:
          return null; // Ne pas afficher
      }
    }).filter(Boolean);

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error("Erreur GET /api/events:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/events - Créer un événement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Valider les données
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        ownerId: session.user.id,
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
        action: "CREATED",
        changes: JSON.parse(JSON.stringify(data)),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/events:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
