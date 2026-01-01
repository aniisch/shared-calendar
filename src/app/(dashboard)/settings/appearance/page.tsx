"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Loader2, Sun, Moon, Monitor, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#22c55e", label: "Vert" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
  { value: "#14b8a6", label: "Turquoise" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "31/12/2025" },
  { value: "MM/dd/yyyy", label: "12/31/2025" },
  { value: "yyyy-MM-dd", label: "2025-12-31" },
  { value: "d MMMM yyyy", label: "31 décembre 2025" },
];

const TIME_FORMAT_OPTIONS = [
  { value: "H24", label: "24 heures (14:30)" },
  { value: "H12", label: "12 heures (2:30 PM)" },
];

const WEEK_START_OPTIONS = [
  { value: "1", label: "Lundi" },
  { value: "0", label: "Dimanche" },
];

interface Settings {
  theme: string;
  primaryColor: string;
  dateFormat: string;
  timeFormat: string;
  calendarStartDay: number;
}

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    primaryColor: "#6366f1",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "H24",
    calendarStartDay: 1,
  });

  // Charger les paramètres
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            theme: data.theme?.toLowerCase() || "system",
            primaryColor: data.primaryColor || "#6366f1",
            dateFormat: data.dateFormat || "dd/MM/yyyy",
            timeFormat: data.timeFormat || "H24",
            calendarStartDay: data.calendarStartDay ?? 1,
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
        body: JSON.stringify({
          theme: settings.theme.toUpperCase(),
          primaryColor: settings.primaryColor,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          calendarStartDay: settings.calendarStartDay,
        }),
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSettings((s) => ({ ...s, theme: newTheme }));
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
          <CardTitle>Thème</CardTitle>
          <CardDescription>
            Choisissez l&apos;apparence de l&apos;application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                >
                  <option.icon className={cn("h-6 w-6", isActive && "text-primary")} />
                  <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                    {option.label}
                  </span>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couleur principale</CardTitle>
          <CardDescription>
            Personnalisez la couleur d&apos;accent de l&apos;application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((color) => {
              const isActive = settings.primaryColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setSettings((s) => ({ ...s, primaryColor: color.value }))}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                    isActive ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                >
                  {isActive && <Check className="h-5 w-5 text-white" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Format de date et heure</CardTitle>
          <CardDescription>
            Personnalisez l&apos;affichage des dates et heures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Format de date</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => setSettings((s) => ({ ...s, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format d&apos;heure</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => setSettings((s) => ({ ...s, timeFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Premier jour de la semaine</Label>
            <Select
              value={String(settings.calendarStartDay)}
              onValueChange={(value) => setSettings((s) => ({ ...s, calendarStartDay: parseInt(value) }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEK_START_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
