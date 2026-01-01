"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  isSystem: boolean;
}

const COLOR_OPTIONS = [
  "#3b82f6", "#22c55e", "#ef4444", "#f59e0b",
  "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
  "#84cc16", "#f97316", "#06b6d4", "#a855f7",
];

// Icon options for future use
// const ICON_OPTIONS = [
//   { value: "briefcase", label: "Travail" },
//   { value: "user", label: "Personnel" },
//   { value: "heart", label: "Couple" },
//   { value: "heart-pulse", label: "Santé" },
//   { value: "gamepad", label: "Loisirs" },
//   { value: "plane", label: "Voyage" },
//   { value: "utensils", label: "Repas" },
//   { value: "home", label: "Maison" },
// ];

export default function CategoriesSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState<string | null>(null);

  // Charger les catégories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setColor(COLOR_OPTIONS[0]);
    setIcon(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });

      if (response.ok) {
        await fetchCategories();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        setDeleteCategory(null);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsDeleting(false);
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Catégories
            </CardTitle>
            <CardDescription>
              Organisez vos événements avec des catégories personnalisées
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune catégorie. Créez-en une pour commencer.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                    {category.isSystem && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        Système
                      </span>
                    )}
                  </div>
                  {!category.isSystem && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modifiez les informations de la catégorie"
                : "Créez une nouvelle catégorie pour organiser vos événements"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sport, Rendez-vous..."
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      color === c
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              La catégorie &quot;{deleteCategory?.name}&quot; sera supprimée.
              Les événements associés ne seront pas supprimés mais n&apos;auront plus de catégorie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
