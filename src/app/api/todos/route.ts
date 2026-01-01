import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todoSchema } from "@/lib/validators";
import { Prisma, TodoPriority } from "@prisma/client";
import { notifyTodoAssigned } from "@/lib/notifications";

// GET /api/todos - Liste des todos
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
    const filter = searchParams.get("filter") || "all"; // all, active, completed
    const shared = searchParams.get("shared") === "true";
    const priority = searchParams.get("priority");

    // Construire le filtre
    const where: Prisma.TodoWhereInput = {};

    if (shared) {
      // Todos partagés : ceux que j'ai créés en partagé + ceux qui me sont assignés
      where.OR = [
        { ownerId: session.user.id, isShared: true },
        { assigneeId: session.user.id },
      ];

      // Aussi inclure les todos partagés du partenaire
      if (session.user.partnerId) {
        where.OR.push({ ownerId: session.user.partnerId, isShared: true });
      }
    } else {
      // Mes todos personnels (non partagés)
      where.ownerId = session.user.id;
      where.isShared = false;
    }

    if (filter === "active") {
      where.completed = false;
    } else if (filter === "completed") {
      where.completed = true;
    }

    if (priority && Object.values(TodoPriority).includes(priority as TodoPriority)) {
      where.priority = priority as TodoPriority;
    }

    const todos = await prisma.todo.findMany({
      where,
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { completed: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Erreur GET /api/todos:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Créer un todo
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
    const validationResult = todoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Vérifier que l'assignee est le partenaire (si spécifié)
    if (data.assigneeId && data.assigneeId !== session.user.partnerId) {
      return NextResponse.json(
        { error: "Vous ne pouvez assigner qu'à votre partenaire" },
        { status: 400 }
      );
    }

    // Créer le todo
    const todo = await prisma.todo.create({
      data: {
        ownerId: session.user.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        isShared: data.isShared,
        assigneeId: data.assigneeId,
        categoryId: data.categoryId,
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
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Notifier l'assigné si c'est le partenaire
    if (data.assigneeId) {
      await notifyTodoAssigned(
        data.assigneeId,
        todo.title,
        todo.id,
        session.user.name || "Votre partenaire"
      );
    }

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/todos:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
