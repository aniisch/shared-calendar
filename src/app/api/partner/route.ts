import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/partner - Obtenir les infos du partenaire actuel et invitations en attente
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec son partenaire
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            currentStatus: true,
            lastSeenAt: true,
          },
        },
      },
    });

    // Récupérer les invitations envoyées en attente
    const sentInvitations = await prisma.partnerInvitation.findMany({
      where: {
        senderId: session.user.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        status: true,
        message: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Récupérer les invitations reçues en attente
    const receivedInvitations = await prisma.partnerInvitation.findMany({
      where: {
        email: session.user.email!,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      partner: user?.partner || null,
      sentInvitations,
      receivedInvitations,
    });
  } catch (error) {
    console.error("Erreur GET /api/partner:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
