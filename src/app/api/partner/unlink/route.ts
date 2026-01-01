import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/partner/unlink - Dissocier le partenaire actuel
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec son partenaire
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, partnerId: true },
    });

    if (!currentUser?.partnerId) {
      return NextResponse.json(
        { error: "Vous n'avez pas de partenaire" },
        { status: 400 }
      );
    }

    const partnerId = currentUser.partnerId;

    // Dissocier les deux utilisateurs en transaction
    await prisma.$transaction([
      // Retirer le partenaire de l'utilisateur actuel
      prisma.user.update({
        where: { id: session.user.id },
        data: { partnerId: null },
      }),
      // Retirer le partenaire de l'autre utilisateur
      prisma.user.update({
        where: { id: partnerId },
        data: { partnerId: null },
      }),
      // Optionnel: Convertir les todos partagés en personnels
      prisma.todo.updateMany({
        where: {
          OR: [
            { ownerId: session.user.id, isShared: true },
            { ownerId: partnerId, isShared: true },
          ],
        },
        data: {
          isShared: false,
          assigneeId: null,
        },
      }),
      // Optionnel: Mettre les événements partagés en privé
      prisma.event.updateMany({
        where: {
          OR: [
            { ownerId: session.user.id, visibility: "SHARED" },
            { ownerId: partnerId, visibility: "SHARED" },
          ],
        },
        data: { visibility: "PRIVATE" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Partenariat dissocié avec succès",
    });
  } catch (error) {
    console.error("Erreur DELETE /api/partner/unlink:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
