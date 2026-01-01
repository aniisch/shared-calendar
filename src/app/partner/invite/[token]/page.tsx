"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Heart,
  Calendar,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InvitationData {
  id: string;
  email: string;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

export default function PartnerInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger l'invitation
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/partner/invite/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invitation non trouvée");
          return;
        }

        setInvitation(data);
      } catch {
        setError("Erreur lors du chargement de l'invitation");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!session?.user) {
      // Rediriger vers la connexion avec retour ici
      router.push(`/login?callbackUrl=/partner/invite/${token}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/partner/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Partenariat créé avec succès !");
      setTimeout(() => {
        router.push("/calendar");
      }, 2000);
    } catch {
      setError("Erreur lors de l'acceptation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/partner/invite/${token}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/partner/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Invitation refusée");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setError("Erreur lors du refus");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Invitation invalide</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild className="mt-4">
                <Link href="/">Retour à l&apos;accueil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">{success}</h2>
              <p className="text-muted-foreground">Redirection en cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invitation already processed
  if (invitation && invitation.status !== "PENDING") {
    const statusMessages = {
      ACCEPTED: "Cette invitation a déjà été acceptée",
      DECLINED: "Cette invitation a été refusée",
      EXPIRED: "Cette invitation a expiré",
      CANCELLED: "Cette invitation a été annulée",
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Invitation non disponible</h2>
              <p className="text-muted-foreground">
                {statusMessages[invitation.status]}
              </p>
              <Button asChild className="mt-4">
                <Link href={session ? "/calendar" : "/login"}>
                  {session ? "Aller au calendrier" : "Se connecter"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main invitation view
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 dark:to-background">
      <div className="container max-w-lg mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold">Invitation Partenaire</h1>
          <p className="text-muted-foreground mt-2">
            Vous avez reçu une invitation à partager un calendrier
          </p>
        </div>

        {/* Invitation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {invitation?.sender.name || "Quelqu'un"} vous invite !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sender Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-14 w-14">
                <AvatarImage src={invitation?.sender.avatar || undefined} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {invitation?.sender.name || "Utilisateur"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invitation?.sender.email}
                </p>
              </div>
            </div>

            {/* Message */}
            {invitation?.message && (
              <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-pink-500">
                <p className="text-sm italic">&ldquo;{invitation.message}&rdquo;</p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                En acceptant, vous pourrez :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-500" />
                  Voir et partager des événements
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-pink-500" />
                  Créer des tâches communes
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Organiser votre vie ensemble
                </li>
              </ul>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Not logged in warning */}
            {!session?.user && (
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-lg">
                Vous devez être connecté(e) pour accepter cette invitation.
                <br />
                <span className="text-xs">
                  Connectez-vous avec l&apos;adresse : {invitation?.email}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDecline}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </>
                )}
              </Button>
              <Button
                className="flex-1 bg-pink-500 hover:bg-pink-600"
                onClick={handleAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Accepter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Cette invitation expire le{" "}
          {invitation &&
            new Date(invitation.expiresAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
        </p>
      </div>
    </div>
  );
}
