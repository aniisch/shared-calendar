import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      );
    }

    // Trouver le token
    const verificationToken = await prisma.token.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (verificationToken.type !== "EMAIL_VERIFICATION") {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    if (verificationToken.expiresAt < new Date()) {
      await prisma.token.delete({ where: { id: verificationToken.id } });
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez vous réinscrire." },
        { status: 400 }
      );
    }

    // Vérifier si déjà utilisé
    if (verificationToken.usedAt) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    // Marquer le token comme utilisé
    await prisma.token.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
