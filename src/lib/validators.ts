import { z } from "zod";

// Validation de l'inscription
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
  name: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

// Validation de la connexion
export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Validation mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});

// Validation reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
});

// Validation magic link
export const magicLinkSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});

// Validation événement
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z.string().max(1000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isAllDay: z.boolean().default(false),
  visibility: z.enum(["PRIVATE", "SHARED", "BUSY_ONLY"]).default("PRIVATE"),
  status: z.enum(["BUSY", "AVAILABLE", "OUT_OF_FRANCE", "TENTATIVE"]).default("BUSY"),
  categoryId: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional().nullable(),
  recurrenceEnd: z.coerce.date().optional().nullable(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: "La date de fin doit être après la date de début", path: ["endDate"] }
);

// Validation todo
export const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional().nullable(),
  isShared: z.boolean().default(false),
  assigneeId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

// Validation catégorie
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide").default("#6366f1"),
  icon: z.string().max(50).optional().nullable(),
});

// Validation invitation partenaire
export const partnerInviteSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  message: z.string().max(500).optional(),
});

// Validation mise à jour profil
export const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  firstName: z.string().max(50).optional().nullable(),
  lastName: z.string().max(50).optional().nullable(),
});

// Validation settings
export const settingsSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  calendarStartDay: z.number().min(0).max(6).optional(),
  defaultCalendarView: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
  timeFormat: z.enum(["H12", "H24"]).optional(),
  dateFormat: z.string().max(20).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderDefault: z.number().min(0).max(10080).optional(), // Max 1 semaine
  shareLocationWithPartner: z.boolean().optional(),
  showBusyToPartner: z.boolean().optional(),
});

// Types inférés
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PartnerInviteInput = z.infer<typeof partnerInviteSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
