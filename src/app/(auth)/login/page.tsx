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
import { LoginForm, GoogleButton, MagicLinkForm, MagicLinkAutoLogin } from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion | Calendrier Couple",
  description: "Connectez-vous à votre calendrier partagé",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Accédez à votre calendrier partagé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-login pour magic link */}
        <Suspense fallback={null}>
          <MagicLinkAutoLogin />
        </Suspense>

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
              ou continuez avec
            </span>
          </div>
        </div>

        {/* Email/Password Login */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              ou sans mot de passe
            </span>
          </div>
        </div>

        {/* Magic Link */}
        <Suspense fallback={null}>
          <MagicLinkForm />
        </Suspense>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
