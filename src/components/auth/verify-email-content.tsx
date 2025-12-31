"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">(
    token ? "loading" : "waiting"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Une erreur est survenue");
        }
      } catch {
        setStatus("error");
        setMessage("Une erreur est survenue");
      }
    };

    verifyEmail();
  }, [token]);

  if (status === "loading") {
    return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
  }

  if (status === "waiting") {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Un email de vérification a été envoyé.
          <br />
          Cliquez sur le lien dans l&apos;email pour activer votre compte.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-center text-muted-foreground">{message}</p>
        <Button onClick={() => router.push("/login")}>Se connecter</Button>
      </>
    );
  }

  return (
    <>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <p className="text-sm text-center text-destructive">{message}</p>
      <Button variant="outline" onClick={() => router.push("/register")}>
        Réessayer l&apos;inscription
      </Button>
    </>
  );
}
