import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  isShared: boolean;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  owner: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
}

interface FetchTodosParams {
  filter?: "all" | "active" | "completed";
  shared?: boolean;
  priority?: string;
}

async function fetchTodos(params: FetchTodosParams = {}): Promise<Todo[]> {
  const searchParams = new URLSearchParams();
  if (params.filter) searchParams.set("filter", params.filter);
  if (params.shared !== undefined) searchParams.set("shared", String(params.shared));
  if (params.priority) searchParams.set("priority", params.priority);

  const response = await fetch(`/api/todos?${searchParams}`);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des tâches");
  }
  return response.json();
}

interface TodoInput {
  title: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | null;
  isShared?: boolean;
  assigneeId?: string | null;
  categoryId?: string | null;
}

async function createTodo(data: TodoInput): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création");
  }
  return response.json();
}

async function updateTodo({
  id,
  data,
}: {
  id: string;
  data: TodoInput;
}): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la modification");
  }
  return response.json();
}

async function toggleTodo(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la modification");
  }
  return response.json();
}

async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression");
  }
}

export function useTodos(params: FetchTodosParams = {}) {
  return useQuery({
    queryKey: ["todos", params],
    queryFn: () => fetchTodos(params),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
