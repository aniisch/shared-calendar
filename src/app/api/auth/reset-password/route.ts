import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Trouver le token
    const resetToken = await prisma.token.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré" },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (resetToken.type !== "PASSWORD_RESET") {
      return NextResponse.json(
        { error: "Lien invalide" },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    if (resetToken.expiresAt < new Date()) {
      await prisma.token.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez refaire une demande." },
        { status: 400 }
      );
    }

    // Vérifier si déjà utilisé
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Marquer le token comme utilisé
    await prisma.token.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      message: "Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur reset password:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
