import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/todos/[id]/convert - Convertir un todo en événement
export async function POST(
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

    // Récupérer le todo
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo non trouvé" },
        { status: 404 }
      );
    }

    // Seul le propriétaire peut convertir
    if (todo.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez convertir que vos propres todos" },
        { status: 403 }
      );
    }

    // Vérifier si déjà converti
    const existingEvent = await prisma.event.findUnique({
      where: { convertedFromTodoId: id },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "Ce todo a déjà été converti en événement" },
        { status: 400 }
      );
    }

    // Créer l'événement à partir du todo
    const startDate = todo.dueDate || new Date();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const event = await prisma.event.create({
      data: {
        ownerId: session.user.id,
        title: todo.title,
        description: todo.description,
        startDate,
        endDate,
        isAllDay: !todo.dueDate, // Si pas de date, journée entière
        visibility: todo.isShared ? "SHARED" : "PRIVATE",
        status: "BUSY",
        categoryId: todo.categoryId,
        convertedFromTodoId: id,
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

    // Marquer le todo comme complété
    await prisma.todo.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/todos/[id]/convert:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
