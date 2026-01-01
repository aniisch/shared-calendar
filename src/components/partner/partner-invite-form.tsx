"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, Heart, X, Mail } from "lucide-react";

import { partnerInviteSchema, type PartnerInviteInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SentInvitation {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface PartnerInviteFormProps {
  sentInvitations: SentInvitation[];
  onInviteSent: () => void;
  onCancelInvitation: (id: string) => Promise<void>;
}

export function PartnerInviteForm({
  sentInvitations,
  onInviteSent,
  onCancelInvitation,
}: PartnerInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnerInviteInput>({
    resolver: zodResolver(partnerInviteSchema),
    defaultValues: {
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: PartnerInviteInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/partner/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return;
      }

      setSuccess(`Invitation envoyée à ${data.email}`);
      reset();
      onInviteSent();
    } catch {
      setError("Erreur lors de l'envoi de l'invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    setCancellingId(id);
    try {
      await onCancelInvitation(id);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-pink-500" />
          Inviter un partenaire
        </CardTitle>
        <CardDescription>
          Envoyez une invitation pour partager votre calendrier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email du partenaire *</Label>
            <Input
              id="email"
              type="email"
              placeholder="partenaire@email.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message personnalisé (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Un petit mot pour accompagner votre invitation..."
              rows={3}
              {...register("message")}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-lg">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Envoyer l&apos;invitation
          </Button>
        </form>

        {/* Pending Invitations */}
        {sentInvitations.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Invitations en attente</h4>
            <div className="space-y-2">
              {sentInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{inv.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvitation(inv.id)}
                    disabled={cancellingId === inv.id}
                  >
                    {cancellingId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
