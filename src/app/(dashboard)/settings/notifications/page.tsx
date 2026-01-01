"use client";

import { useState, useEffect } from "react";
import { Loader2, Bell, Mail, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const REMINDER_OPTIONS = [
  { value: "0", label: "Au moment de l'événement" },
  { value: "5", label: "5 minutes avant" },
  { value: "15", label: "15 minutes avant" },
  { value: "30", label: "30 minutes avant" },
  { value: "60", label: "1 heure avant" },
  { value: "120", label: "2 heures avant" },
  { value: "1440", label: "1 jour avant" },
];

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDefault: number;
  shareLocationWithPartner: boolean;
  showBusyToPartner: boolean;
}

export default function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    pushNotifications: true,
    reminderDefault: 30,
    shareLocationWithPartner: true,
    showBusyToPartner: true,
  });

  // Charger les paramètres
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            emailNotifications: data.emailNotifications ?? true,
            pushNotifications: data.pushNotifications ?? true,
            reminderDefault: data.reminderDefault ?? 30,
            shareLocationWithPartner: data.shareLocationWithPartner ?? true,
            showBusyToPartner: data.showBusyToPartner ?? true,
          });
        }
      } catch (error) {
        console.error("Erreur chargement paramètres:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setMessage({ type: "success", text: "Paramètres enregistrés" });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez comment vous souhaitez être notifié
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les rappels et mises à jour
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications push
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications dans l&apos;application
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, pushNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rappels
          </CardTitle>
          <CardDescription>
            Configurez les rappels par défaut pour vos événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Rappel par défaut</Label>
            <Select
              value={String(settings.reminderDefault)}
              onValueChange={(value) =>
                setSettings((s) => ({ ...s, reminderDefault: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Ce rappel sera ajouté automatiquement à vos nouveaux événements
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidentialité avec le partenaire</CardTitle>
          <CardDescription>
            Contrôlez ce que votre partenaire peut voir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Partager ma localisation</Label>
              <p className="text-sm text-muted-foreground">
                Votre partenaire peut voir où vous êtes
              </p>
            </div>
            <Switch
              checked={settings.shareLocationWithPartner}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, shareLocationWithPartner: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Afficher quand je suis occupé(e)</Label>
              <p className="text-sm text-muted-foreground">
                Votre partenaire voit votre statut d&apos;occupation
              </p>
            </div>
            <Switch
              checked={settings.showBusyToPartner}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, showBusyToPartner: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm",
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
