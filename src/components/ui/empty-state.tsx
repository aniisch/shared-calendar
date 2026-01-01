import { LucideIcon, Calendar, ListTodo, Bell, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoEventsState({ onCreateEvent }: { onCreateEvent?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="Aucun événement"
      description="Vous n'avez pas encore d'événements. Créez-en un pour commencer."
      action={
        onCreateEvent
          ? { label: "Créer un événement", onClick: onCreateEvent }
          : undefined
      }
    />
  );
}

export function NoTodosState({ onCreateTodo }: { onCreateTodo?: () => void }) {
  return (
    <EmptyState
      icon={ListTodo}
      title="Aucune tâche"
      description="Votre liste de tâches est vide. Ajoutez une tâche pour commencer."
      action={
        onCreateTodo
          ? { label: "Ajouter une tâche", onClick: onCreateTodo }
          : undefined
      }
    />
  );
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={Bell}
      title="Aucune notification"
      description="Vous êtes à jour ! Aucune notification pour le moment."
    />
  );
}
