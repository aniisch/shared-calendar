import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  primaryColor: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(["H12", "H24"]).optional(),
  calendarStartDay: z.number().min(0).max(6).optional(),
  defaultCalendarView: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderDefault: z.number().min(0).optional(),
  shareLocationWithPartner: z.boolean().optional(),
  showBusyToPartner: z.boolean().optional(),
});

// GET /api/user/settings - Récupérer les paramètres
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Créer les paramètres par défaut si inexistants
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur GET /api/user/settings:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/user/settings - Mettre à jour les paramètres
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
    const validationResult = settingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur PUT /api/user/settings:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
