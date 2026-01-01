import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// PUT /api/user/profile - Mettre à jour le profil
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur PUT /api/user/profile:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// GET /api/user/profile - Récupérer le profil
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        avatar: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur GET /api/user/profile:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
