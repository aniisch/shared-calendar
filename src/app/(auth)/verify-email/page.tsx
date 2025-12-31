import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export const metadata = {
  title: "Vérification email | Calendrier Couple",
  description: "Vérifiez votre adresse email",
};

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Vérification email</CardTitle>
        <CardDescription>
          Activation de votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Suspense
          fallback={
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </CardContent>
    </Card>
  );
}
