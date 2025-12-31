import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    }

    // Supprimer les anciens tokens de reset pour cet email
    await prisma.token.deleteMany({
      where: {
        email: user.email,
        type: "PASSWORD_RESET",
      },
    });

    // Créer un nouveau token
    const resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.token.create({
      data: {
        token: resetToken,
        type: "PASSWORD_RESET",
        email: user.email,
        expiresAt,
      },
    });

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    });
  } catch (error) {
    console.error("Erreur forgot password:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
