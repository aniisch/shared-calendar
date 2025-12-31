"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";

import { eventSchema, type EventInput } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  defaultValues?: Partial<EventInput>;
  categories?: Category[];
  mode?: "create" | "edit";
}

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Privé", description: "Visible uniquement par vous" },
  { value: "SHARED", label: "Partagé", description: "Visible par votre partenaire" },
  { value: "BUSY_ONLY", label: "Occupé(e)", description: "Votre partenaire voit juste que vous êtes occupé(e)" },
];

const STATUS_OPTIONS = [
  { value: "BUSY", label: "Occupé(e)" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "TENTATIVE", label: "Provisoire" },
  { value: "OUT_OF_FRANCE", label: "Absent(e)" },
];

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Bleu" },
  { value: "#22c55e", label: "Vert" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#14b8a6", label: "Turquoise" },
];

export function EventForm({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  defaultValues,
  categories = [],
  mode = "create",
}: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      isAllDay: false,
      visibility: "PRIVATE",
      status: "BUSY",
      categoryId: null,
      color: null,
      isRecurring: false,
      recurrenceRule: null,
      recurrenceEnd: null,
      ...defaultValues,
    },
  });

  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchIsAllDay = watch("isAllDay");
  const watchColor = watch("color");
  const watchVisibility = watch("visibility");
  const watchStatus = watch("status");
  const watchCategoryId = watch("categoryId");

  // Réinitialiser le formulaire quand les defaultValues changent
  useEffect(() => {
    if (open) {
      const startDate = defaultValues?.startDate || new Date();
      const endDate = defaultValues?.endDate || new Date();

      reset({
        title: defaultValues?.title || "",
        description: defaultValues?.description || "",
        location: defaultValues?.location || "",
        startDate: startDate instanceof Date ? startDate : new Date(startDate),
        endDate: endDate instanceof Date ? endDate : new Date(endDate),
        isAllDay: defaultValues?.isAllDay || false,
        visibility: defaultValues?.visibility || "PRIVATE",
        status: defaultValues?.status || "BUSY",
        categoryId: defaultValues?.categoryId || null,
        color: defaultValues?.color || null,
        isRecurring: defaultValues?.isRecurring || false,
        recurrenceRule: defaultValues?.recurrenceRule || null,
        recurrenceEnd: defaultValues?.recurrenceEnd || null,
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = async (data: EventInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvel événement" : "Modifier l'événement"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouvel événement dans votre calendrier"
              : "Modifiez les détails de votre événement"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Titre de l'événement"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Journée entière */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isAllDay">Journée entière</Label>
            <Switch
              id="isAllDay"
              checked={watchIsAllDay}
              onCheckedChange={(checked) => setValue("isAllDay", checked)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchStartDate
                      ? format(watchStartDate, watchIsAllDay ? "PP" : "Pp", { locale: fr })
                      : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchStartDate}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        if (!watchIsAllDay && watchStartDate) {
                          newDate.setHours(watchStartDate.getHours());
                          newDate.setMinutes(watchStartDate.getMinutes());
                        }
                        setValue("startDate", newDate);
                        // Ajuster la date de fin si nécessaire
                        if (newDate > watchEndDate) {
                          setValue("endDate", newDate);
                        }
                      }
                    }}
                    locale={fr}
                    initialFocus
                  />
                  {!watchIsAllDay && (
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={watchStartDate ? format(watchStartDate, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(watchStartDate || new Date());
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setValue("startDate", newDate);
                        }}
                      />
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchEndDate
                      ? format(watchEndDate, watchIsAllDay ? "PP" : "Pp", { locale: fr })
                      : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchEndDate}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        if (!watchIsAllDay && watchEndDate) {
                          newDate.setHours(watchEndDate.getHours());
                          newDate.setMinutes(watchEndDate.getMinutes());
                        }
                        setValue("endDate", newDate);
                      }
                    }}
                    locale={fr}
                    disabled={(date) => date < new Date(watchStartDate)}
                    initialFocus
                  />
                  {!watchIsAllDay && (
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={watchEndDate ? format(watchEndDate, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(watchEndDate || new Date());
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setValue("endDate", newDate);
                        }}
                      />
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              placeholder="Ajouter un lieu"
              {...register("location")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Ajouter une description"
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Visibilité */}
          <div className="space-y-2">
            <Label>Visibilité</Label>
            <Select
              value={watchVisibility}
              onValueChange={(value) => setValue("visibility", value as EventInput["visibility"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la visibilité" />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={watchStatus}
              onValueChange={(value) => setValue("status", value as EventInput["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catégorie */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={watchCategoryId || "none"}
                onValueChange={(value) =>
                  setValue("categoryId", value === "none" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Couleur personnalisée */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    watchColor === color.value
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
              <button
                type="button"
                onClick={() => setValue("color", null)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-xs",
                  !watchColor ? "border-foreground" : "border-muted-foreground"
                )}
                title="Par défaut"
              >
                ✕
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="mr-auto"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Supprimer
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
