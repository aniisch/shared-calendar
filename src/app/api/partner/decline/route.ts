import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/partner/decline - Refuser une invitation partenaire
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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      );
    }

    // Trouver l'invitation
    const invitation = await prisma.partnerInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer l'email de l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    // Vérifier que l'invitation est pour cet utilisateur
    if (invitation.email.toLowerCase() !== currentUser?.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Cette invitation n'est pas pour vous" },
        { status: 403 }
      );
    }

    // Vérifier le statut
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    // Refuser l'invitation
    await prisma.partnerInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "DECLINED",
        receiverId: session.user.id,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation refusée",
    });
  } catch (error) {
    console.error("Erreur POST /api/partner/decline:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
