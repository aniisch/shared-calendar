import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleButton } from "@/components/auth/login-form";

export const metadata = {
  title: "Inscription | Calendrier Couple",
  description: "Créez votre compte pour partager un calendrier avec votre partenaire",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Commencez à organiser votre vie à deux
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google OAuth */}
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              ou avec email
            </span>
          </div>
        </div>

        {/* Register Form */}
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            politique de confidentialité
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
