"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ListTodo, Users, Filter } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoItem, TodoForm, type Todo } from "@/components/todos";
import type { TodoInput } from "@/lib/validators";

interface Category {
  id: string;
  name: string;
  color: string;
}

type FilterType = "all" | "active" | "completed";
type TabType = "personal" | "shared";

export default function TodosPage() {
  const { data: session } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [filter, setFilter] = useState<FilterType>("all");

  // Modal state
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        shared: activeTab === "shared" ? "true" : "false",
      });

      const response = await fetch(`/api/todos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des todos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, activeTab]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handlers
  const handleCreateTodo = async (data: TodoInput) => {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        isShared: activeTab === "shared" ? true : data.isShared,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la création");
    }

    await fetchTodos();
  };

  const handleUpdateTodo = async (data: TodoInput) => {
    if (!editingTodo) return;

    const response = await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la modification");
    }

    await fetchTodos();
  };

  const handleDeleteTodo = async () => {
    if (!editingTodo) return;

    const response = await fetch(`/api/todos/${editingTodo.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la suppression");
    }

    await fetchTodos();
    setShowTodoForm(false);
    setEditingTodo(null);
  };

  const handleToggleTodo = async (id: string) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
    });

    if (response.ok) {
      await fetchTodos();
    }
  };

  const handleConvertTodo = async (id: string) => {
    const response = await fetch(`/api/todos/${id}/convert`, {
      method: "POST",
    });

    if (response.ok) {
      await fetchTodos();
    }
  };

  const openCreateTodo = () => {
    setEditingTodo(null);
    setShowTodoForm(true);
  };

  const openEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowTodoForm(true);
  };

  // Stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;

  // Form default values
  const getFormDefaultValues = (): Partial<TodoInput> | undefined => {
    if (editingTodo) {
      return {
        title: editingTodo.title,
        description: editingTodo.description,
        priority: editingTodo.priority,
        dueDate: editingTodo.dueDate ? new Date(editingTodo.dueDate) : null,
        isShared: editingTodo.isShared,
        assigneeId: editingTodo.assigneeId,
        categoryId: editingTodo.category?.id || null,
      };
    }

    return {
      isShared: activeTab === "shared",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes Tâches</h1>
          <p className="text-muted-foreground">
            {activeTodos} en cours, {completedTodos} terminée{completedTodos > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreateTodo}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "personal" ? "default" : "outline"}
            onClick={() => setActiveTab("personal")}
            className="flex-1 sm:flex-none"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Personnelles
          </Button>
          <Button
            variant={activeTab === "shared" ? "default" : "outline"}
            onClick={() => setActiveTab("shared")}
            className="flex-1 sm:flex-none"
          >
            <Users className="h-4 w-4 mr-2" />
            Partagées
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as FilterType)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="active">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Todo List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {activeTab === "personal" ? "Tâches personnelles" : "Tâches partagées"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune tâche pour le moment</p>
              <Button variant="link" onClick={openCreateTodo} className="mt-2">
                Créer votre première tâche
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onEdit={openEditTodo}
                  onDelete={(id) => {
                    if (confirm("Supprimer cette tâche ?")) {
                      fetch(`/api/todos/${id}`, { method: "DELETE" }).then(() =>
                        fetchTodos()
                      );
                    }
                  }}
                  onConvert={handleConvertTodo}
                  currentUserId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todo Form Modal */}
      <TodoForm
        open={showTodoForm}
        onOpenChange={setShowTodoForm}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        onDelete={editingTodo ? handleDeleteTodo : undefined}
        defaultValues={getFormDefaultValues()}
        categories={categories}
        partner={
          session?.user?.partnerId
            ? { id: session.user.partnerId, name: "Mon partenaire" }
            : null
        }
        mode={editingTodo ? "edit" : "create"}
      />
    </div>
  );
}
