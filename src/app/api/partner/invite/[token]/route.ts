import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/partner/invite/[token] - Obtenir les détails d'une invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      );
    }

    // Trouver l'invitation
    const invitation = await prisma.partnerInvitation.findUnique({
      where: { token },
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
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si expirée
    const isExpired = invitation.expiresAt < new Date();
    if (isExpired && invitation.status === "PENDING") {
      await prisma.partnerInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
    }

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      message: invitation.message,
      status: isExpired && invitation.status === "PENDING" ? "EXPIRED" : invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      sender: invitation.sender,
    });
  } catch (error) {
    console.error("Erreur GET /api/partner/invite/[token]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
