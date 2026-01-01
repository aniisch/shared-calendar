import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerInviteSchema } from "@/lib/validators";
import { sendPartnerInvitationEmail } from "@/lib/mail";

// POST /api/partner/invite - Envoyer une invitation partenaire
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur a déjà un partenaire
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, partnerId: true },
    });

    if (currentUser?.partnerId) {
      return NextResponse.json(
        { error: "Vous avez déjà un partenaire. Dissociez-le d'abord." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Valider les données
    const validationResult = partnerInviteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, message } = validationResult.data;

    // Vérifier que l'utilisateur ne s'invite pas lui-même
    if (email.toLowerCase() === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous inviter vous-même" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est dans la liste autorisée (si configurée)
    const allowedEmails = process.env.ALLOWED_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
    if (allowedEmails.length > 0 && !allowedEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: "Cette adresse email n'est pas autorisée" },
        { status: 400 }
      );
    }

    // Vérifier si une invitation en attente existe déjà
    const existingInvitation = await prisma.partnerInvitation.findFirst({
      where: {
        senderId: session.user.id,
        email: email.toLowerCase(),
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cette adresse" },
        { status: 400 }
      );
    }

    // Vérifier si le destinataire existe et a déjà un partenaire
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, partnerId: true },
    });

    if (targetUser?.partnerId) {
      return NextResponse.json(
        { error: "Cette personne a déjà un partenaire" },
        { status: 400 }
      );
    }

    // Annuler les anciennes invitations en attente (du même sender vers cet email)
    await prisma.partnerInvitation.updateMany({
      where: {
        senderId: session.user.id,
        email: email.toLowerCase(),
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    });

    // Créer l'invitation (expire dans 7 jours)
    const invitation = await prisma.partnerInvitation.create({
      data: {
        senderId: session.user.id,
        email: email.toLowerCase(),
        receiverId: targetUser?.id || null,
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Envoyer l'email d'invitation
    const emailResult = await sendPartnerInvitationEmail(
      email,
      currentUser?.name || session.user.email || "Quelqu'un",
      invitation.token,
      message
    );

    if (!emailResult.success) {
      // Supprimer l'invitation si l'email échoue
      await prisma.partnerInvitation.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation envoyée avec succès",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Erreur POST /api/partner/invite:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/partner/invite - Annuler une invitation envoyée
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
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "ID d'invitation requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.partnerInvitation.findFirst({
      where: {
        id: invitationId,
        senderId: session.user.id,
        status: "PENDING",
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    // Annuler l'invitation
    await prisma.partnerInvitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/partner/invite:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
