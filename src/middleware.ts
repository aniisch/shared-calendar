import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Routes API publiques
const publicApiRoutes = [
  "/api/auth",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/magic-link",
  "/api/partner/invite", // Vérification token invitation
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Vérifier si c'est une API publique
  const isPublicApi = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Fichiers statiques et assets
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  // Autoriser les fichiers statiques
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Autoriser les API publiques
  if (isPublicApi) {
    return NextResponse.next();
  }

  // Si connecté et sur une page d'auth, rediriger vers le calendrier
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/calendar", nextUrl));
  }

  // Si non connecté et route protégée, rediriger vers login
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
