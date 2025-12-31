import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { magicLinkSchema } from "@/lib/validators";
import { sendMagicLinkEmail } from "@/lib/mail";

// POST - Envoyer un magic link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const result = magicLinkSchema.safeParse(body);
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

    // Ne pas révéler si l'email existe ou non
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, vous recevrez un lien de connexion.",
      });
    }

    // Vérifier que l'email est vérifié
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Veuillez d'abord vérifier votre email" },
        { status: 400 }
      );
    }

    // Supprimer les anciens magic links pour cet email
    await prisma.token.deleteMany({
      where: {
        email: user.email,
        type: "MAGIC_LINK",
      },
    });

    // Créer un nouveau token
    const magicToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.token.create({
      data: {
        token: magicToken,
        type: "MAGIC_LINK",
        email: user.email,
        expiresAt,
      },
    });

    // Envoyer l'email
    await sendMagicLinkEmail(user.email, magicToken);

    return NextResponse.json({
      message: "Si un compte existe avec cet email, vous recevrez un lien de connexion.",
    });
  } catch (error) {
    console.error("Erreur magic link:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// GET - Valider le magic link et connecter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Trouver le token
    const magicToken = await prisma.token.findUnique({
      where: { token },
    });

    if (!magicToken) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Vérifier le type
    if (magicToken.type !== "MAGIC_LINK") {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Vérifier l'expiration
    if (magicToken.expiresAt < new Date()) {
      await prisma.token.delete({ where: { id: magicToken.id } });
      return NextResponse.redirect(new URL("/login?error=TokenExpired", request.url));
    }

    // Vérifier si déjà utilisé
    if (magicToken.usedAt) {
      return NextResponse.redirect(new URL("/login?error=TokenUsed", request.url));
    }

    // Marquer le token comme utilisé
    await prisma.token.update({
      where: { id: magicToken.id },
      data: { usedAt: new Date() },
    });

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: magicToken.email },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=UserNotFound", request.url));
    }

    // Rediriger vers une page qui va gérer la connexion côté client
    // Car signIn() ne fonctionne pas directement dans une route GET
    return NextResponse.redirect(
      new URL(`/login?magicEmail=${encodeURIComponent(user.email)}&verified=true`, request.url)
    );
  } catch (error) {
    console.error("Erreur validation magic link:", error);
    return NextResponse.redirect(new URL("/login?error=ServerError", request.url));
  }
}
