import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Emails autorisés (toi et ta copine uniquement)
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
const MAX_USERS = 2;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/calendar",
  },

  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Email/Password
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { settings: true },
        });

        if (!user || !user.password) {
          throw new Error("Identifiants invalides");
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Identifiants invalides");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),

    // Magic Link Callback (pour connexion automatique après vérification)
    Credentials({
      id: "magic-link-callback",
      name: "magic-link-callback",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email requis");
        }

        const email = credentials.email as string;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Première connexion - récupérer les infos complètes
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
            partnerId: true,
            currentStatus: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.avatar = dbUser.avatar;
          token.partnerId = dbUser.partnerId;
          token.currentStatus = dbUser.currentStatus;
        }
      }

      // Update session si demandé
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.avatar) token.avatar = session.avatar;
        if (session.partnerId !== undefined) token.partnerId = session.partnerId;
        if (session.currentStatus) token.currentStatus = session.currentStatus;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.image = token.avatar as string | null;
        session.user.partnerId = token.partnerId as string | null;
        session.user.currentStatus = token.currentStatus as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Vérifier si l'email est autorisé
      if (user.email) {
        const normalizedEmail = user.email.toLowerCase();

        // Vérifier la liste blanche
        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(normalizedEmail)) {
          return false; // Refuser la connexion
        }

        // Pour les nouveaux utilisateurs OAuth (pas credentials ni magic-link-callback)
        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!existingUser) {
            const userCount = await prisma.user.count();
            if (userCount >= MAX_USERS) {
              return false; // Refuser si max atteint
            }
          }
        }
      }

      return true;
    },
  },

  events: {
    async createUser({ user }) {
      // Créer les données par défaut pour les nouveaux utilisateurs OAuth
      if (user.id) {
        await createDefaultUserData(user.id);
      }
    },
  },
});

// Fonction pour créer les données par défaut d'un utilisateur
async function createDefaultUserData(userId: string) {
  // Créer les paramètres par défaut
  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // Créer les catégories par défaut
  const defaultCategories = [
    { name: "Travail", color: "#3b82f6", icon: "briefcase" },
    { name: "Personnel", color: "#22c55e", icon: "user" },
    { name: "Couple", color: "#ec4899", icon: "heart" },
    { name: "Santé", color: "#ef4444", icon: "heart-pulse" },
    { name: "Loisirs", color: "#f59e0b", icon: "gamepad" },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId, name: cat.name } },
      create: { ...cat, userId },
      update: {},
    });
  }
}

// Types étendus pour TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      partnerId: string | null;
      currentStatus: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    partnerId: string | null;
    currentStatus: string;
  }
}
