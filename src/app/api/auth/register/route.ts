import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/mail";

// Emails autorisés (toi et ta copine uniquement)
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
const MAX_USERS = 2;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Vérifier si l'email est autorisé
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json(
        { error: "Cette application est réservée à un usage privé" },
        { status: 403 }
      );
    }

    // Vérifier le nombre maximum d'utilisateurs
    const userCount = await prisma.user.count();
    if (userCount >= MAX_USERS) {
      return NextResponse.json(
        { error: "Le nombre maximum d'utilisateurs a été atteint" },
        { status: 403 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
      },
    });

    // Créer les paramètres par défaut
    await prisma.userSettings.create({
      data: { userId: user.id },
    });

    // Créer les catégories par défaut
    const defaultCategories = [
      { name: "Travail", color: "#3b82f6", icon: "briefcase" },
      { name: "Personnel", color: "#22c55e", icon: "user" },
      { name: "Couple", color: "#ec4899", icon: "heart" },
      { name: "Santé", color: "#ef4444", icon: "heart-pulse" },
      { name: "Loisirs", color: "#f59e0b", icon: "gamepad" },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        userId: user.id,
      })),
    });

    // Créer le token de vérification
    const verificationToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.token.create({
      data: {
        token: verificationToken,
        type: "EMAIL_VERIFICATION",
        email: user.email,
        expiresAt,
      },
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json(
      {
        message: "Compte créé ! Vérifiez votre email pour activer votre compte.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
