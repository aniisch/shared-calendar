import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todoSchema } from "@/lib/validators";
import { notifyTodoAssigned, notifyTodoCompleted } from "@/lib/notifications";

// GET /api/todos/[id] - Récupérer un todo
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

    const todo = await prisma.todo.findUnique({
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
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'accès
    const isOwner = todo.ownerId === session.user.id;
    const isAssignee = todo.assigneeId === session.user.id;
    const isPartnerShared = todo.isShared && todo.ownerId === session.user.partnerId;

    if (!isOwner && !isAssignee && !isPartnerShared) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Erreur GET /api/todos/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - Modifier un todo
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

    // Vérifier que le todo existe
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: "Todo non trouvé" },
        { status: 404 }
      );
    }

    // Seul le propriétaire peut modifier
    if (existingTodo.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que vos propres todos" },
        { status: 403 }
      );
    }

    // Valider les données
    const validationResult = todoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Mettre à jour le todo
    const todo = await prisma.todo.update({
      where: { id },
      data: {
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

    // Notifier si assignation a changé
    if (data.assigneeId && data.assigneeId !== existingTodo.assigneeId) {
      await notifyTodoAssigned(
        data.assigneeId,
        todo.title,
        todo.id,
        session.user.name || "Votre partenaire"
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Erreur PUT /api/todos/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Supprimer un todo
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

    // Vérifier que le todo existe
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: "Todo non trouvé" },
        { status: 404 }
      );
    }

    // Seul le propriétaire peut supprimer
    if (existingTodo.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres todos" },
        { status: 403 }
      );
    }

    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/todos/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/[id] - Toggle completion
export async function PATCH(
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

    // Vérifier que le todo existe
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: "Todo non trouvé" },
        { status: 404 }
      );
    }

    // Le propriétaire ou l'assigné peuvent toggle
    const isOwner = existingTodo.ownerId === session.user.id;
    const isAssignee = existingTodo.assigneeId === session.user.id;

    if (!isOwner && !isAssignee) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Toggle completed
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !existingTodo.completed,
        completedAt: !existingTodo.completed ? new Date() : null,
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

    // Notifier le partenaire si la tâche partagée est terminée
    if (todo.completed && existingTodo.isShared && session.user.partnerId) {
      // Notifier l'autre personne (propriétaire ou assigné)
      const notifyUserId = isOwner
        ? existingTodo.assigneeId
        : existingTodo.ownerId;

      if (notifyUserId && notifyUserId !== session.user.id) {
        await notifyTodoCompleted(
          notifyUserId,
          todo.title,
          todo.id,
          session.user.name || "Votre partenaire"
        );
      }
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Erreur PATCH /api/todos/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
