"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      firstName: session?.user?.firstName || "",
      lastName: session?.user?.lastName || "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      // Mettre à jour la session
      await update({ name: data.name });
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "?";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>
            Votre photo sera visible par votre partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" disabled>
                <Camera className="h-4 w-4 mr-2" />
                Changer la photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou GIF. Max 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Modifiez vos informations de profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom d&apos;affichage</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Votre prénom"
                  {...register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom de famille</Label>
                <Input
                  id="lastName"
                  placeholder="Votre nom de famille"
                  {...register("lastName")}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
