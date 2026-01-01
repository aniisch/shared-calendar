import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/partner/accept - Accepter une invitation partenaire
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

    // Vérifier si l'utilisateur a déjà un partenaire
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, partnerId: true },
    });

    if (currentUser?.partnerId) {
      return NextResponse.json(
        { error: "Vous avez déjà un partenaire" },
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
            partnerId: true,
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
        { error: `Cette invitation a déjà été ${invitation.status === "ACCEPTED" ? "acceptée" : invitation.status === "DECLINED" ? "refusée" : "traitée"}` },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    if (invitation.expiresAt < new Date()) {
      await prisma.partnerInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 }
      );
    }

    // Vérifier que l'expéditeur n'a pas déjà un partenaire
    if (invitation.sender.partnerId) {
      await prisma.partnerInvitation.update({
        where: { id: invitation.id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json(
        { error: "L'expéditeur a déjà un partenaire" },
        { status: 400 }
      );
    }

    // Lier les deux utilisateurs en transaction
    await prisma.$transaction([
      // Mettre à jour le partenaire de l'utilisateur actuel
      prisma.user.update({
        where: { id: session.user.id },
        data: { partnerId: invitation.senderId },
      }),
      // Mettre à jour le partenaire de l'expéditeur
      prisma.user.update({
        where: { id: invitation.senderId },
        data: { partnerId: session.user.id },
      }),
      // Mettre à jour l'invitation
      prisma.partnerInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          receiverId: session.user.id,
          respondedAt: new Date(),
        },
      }),
      // Annuler toutes les autres invitations en attente pour ces deux utilisateurs
      prisma.partnerInvitation.updateMany({
        where: {
          OR: [
            { senderId: session.user.id, status: "PENDING" },
            { senderId: invitation.senderId, status: "PENDING" },
            { email: currentUser?.email, status: "PENDING" },
            { email: invitation.sender.email, status: "PENDING" },
          ],
          id: { not: invitation.id },
        },
        data: { status: "CANCELLED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Partenariat créé avec succès",
      partner: {
        id: invitation.sender.id,
        name: invitation.sender.name,
        email: invitation.sender.email,
      },
    });
  } catch (error) {
    console.error("Erreur POST /api/partner/accept:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
