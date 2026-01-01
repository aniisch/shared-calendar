"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";

import { todoSchema, type TodoInput } from "@/lib/validators";
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

interface Partner {
  id: string;
  name: string | null;
}

interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TodoInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  defaultValues?: Partial<TodoInput>;
  categories?: Category[];
  partner?: Partner | null;
  mode?: "create" | "edit";
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Basse", color: "text-gray-500" },
  { value: "MEDIUM", label: "Moyenne", color: "text-blue-500" },
  { value: "HIGH", label: "Haute", color: "text-orange-500" },
  { value: "URGENT", label: "Urgente", color: "text-red-500" },
];

export function TodoForm({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  defaultValues,
  categories = [],
  partner,
  mode = "create",
}: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: null,
      isShared: false,
      assigneeId: null,
      categoryId: null,
      ...defaultValues,
    },
  });

  const watchDueDate = watch("dueDate");
  const watchPriority = watch("priority");
  const watchIsShared = watch("isShared");
  const watchCategoryId = watch("categoryId");
  const watchAssigneeId = watch("assigneeId");

  // Réinitialiser le formulaire quand les defaultValues changent
  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title || "",
        description: defaultValues?.description || "",
        priority: defaultValues?.priority || "MEDIUM",
        dueDate: defaultValues?.dueDate || null,
        isShared: defaultValues?.isShared || false,
        assigneeId: defaultValues?.assigneeId || null,
        categoryId: defaultValues?.categoryId || null,
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = async (data: TodoInput) => {
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvelle tâche" : "Modifier la tâche"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Ajoutez une nouvelle tâche à votre liste"
              : "Modifiez les détails de votre tâche"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Que devez-vous faire ?"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Détails supplémentaires..."
              rows={2}
              {...register("description")}
            />
          </div>

          {/* Priorité */}
          <div className="space-y-2">
            <Label>Priorité</Label>
            <Select
              value={watchPriority}
              onValueChange={(value) =>
                setValue("priority", value as TodoInput["priority"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la priorité" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label>Date d&apos;échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchDueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchDueDate
                    ? format(new Date(watchDueDate), "PPP", { locale: fr })
                    : "Aucune date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchDueDate ? new Date(watchDueDate) : undefined}
                  onSelect={(date) => setValue("dueDate", date || null)}
                  locale={fr}
                  initialFocus
                />
                {watchDueDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setValue("dueDate", null)}
                    >
                      Effacer la date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
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

          {/* Partager */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isShared">Partager avec mon partenaire</Label>
              <p className="text-xs text-muted-foreground">
                Votre partenaire pourra voir cette tâche
              </p>
            </div>
            <Switch
              id="isShared"
              checked={watchIsShared}
              onCheckedChange={(checked) => {
                setValue("isShared", checked);
                if (!checked) {
                  setValue("assigneeId", null);
                }
              }}
            />
          </div>

          {/* Assigner au partenaire */}
          {watchIsShared && partner && (
            <div className="space-y-2">
              <Label>Assigner à</Label>
              <Select
                value={watchAssigneeId || "none"}
                onValueChange={(value) =>
                  setValue("assigneeId", value === "none" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Personne (juste partagé)</SelectItem>
                  <SelectItem value={partner.id}>
                    {partner.name || "Mon partenaire"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
