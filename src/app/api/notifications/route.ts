import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Liste des notifications
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
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      userId: session.user.id,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
          todo: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Erreur GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Marquer comme lu
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } else if (ids && Array.isArray(ids)) {
      // Marquer les notifications spécifiées comme lues
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }

    // Retourner le nouveau compte non lu
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Erreur PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Supprimer des notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      // Supprimer toutes les notifications lues
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          read: true,
        },
      });
    } else if (id) {
      // Supprimer une notification spécifique
      await prisma.notification.deleteMany({
        where: {
          id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
