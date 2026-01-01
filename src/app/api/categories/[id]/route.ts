import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide"),
  icon: z.string().nullable().optional(),
});

// GET /api/categories/[id] - Récupérer une catégorie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier l'accès
    if (category.userId && category.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur GET /api/categories/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Modifier une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier l'accès (seul le propriétaire peut modifier)
    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que vos propres catégories" },
        { status: 403 }
      );
    }

    // Vérifier si c'est une catégorie système
    if (existingCategory.isSystem) {
      return NextResponse.json(
        { error: "Les catégories système ne peuvent pas être modifiées" },
        { status: 400 }
      );
    }

    // Valider les données
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Vérifier l'unicité du nom
    const duplicate = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur PUT /api/categories/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier l'accès
    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres catégories" },
        { status: 403 }
      );
    }

    // Vérifier si c'est une catégorie système
    if (existingCategory.isSystem) {
      return NextResponse.json(
        { error: "Les catégories système ne peuvent pas être supprimées" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/categories/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
