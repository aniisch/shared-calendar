"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Check,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarPlus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoOwner {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface TodoCategory {
  id: string;
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: Date | string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | string | null;
  isShared: boolean;
  category: TodoCategory | null;
  owner: TodoOwner;
  ownerId: string;
  assignee: TodoOwner | null;
  assigneeId: string | null;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onConvert: (id: string) => void;
  currentUserId?: string;
}

const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MEDIUM: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

const PRIORITY_LABELS = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onConvert,
  currentUserId,
}: TodoItemProps) {
  const isOwner = currentUserId === todo.ownerId;
  const isOverdue =
    todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-colors",
        todo.completed
          ? "bg-muted/50 border-muted"
          : "bg-card hover:bg-muted/30 border-border"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={cn(
          "flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors",
          todo.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/50 hover:border-primary"
        )}
      >
        {todo.completed && <Check className="w-3 h-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p
              className={cn(
                "font-medium",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {todo.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={() => onEdit(todo)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {!todo.completed && (
                <DropdownMenuItem onClick={() => onConvert(todo.id)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Convertir en événement
                </DropdownMenuItem>
              )}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(todo.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Priority */}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              PRIORITY_COLORS[todo.priority]
            )}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>

          {/* Category */}
          {todo.category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${todo.category.color}20`,
                color: todo.category.color,
              }}
            >
              {todo.category.name}
            </span>
          )}

          {/* Due date */}
          {todo.dueDate && (
            <span
              className={cn(
                "text-xs flex items-center gap-1",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(todo.dueDate), "d MMM", { locale: fr })}
            </span>
          )}

          {/* Shared indicator */}
          {todo.isShared && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Partagé
            </span>
          )}

          {/* Assignee */}
          {todo.assignee && (
            <span className="text-xs text-muted-foreground">
              → {todo.assignee.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
