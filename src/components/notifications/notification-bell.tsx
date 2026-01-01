"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, Calendar, ListTodo, Heart, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  event?: {
    id: string;
    title: string;
  } | null;
  todo?: {
    id: string;
    title: string;
  } | null;
}

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  EVENT_REMINDER: Calendar,
  EVENT_CREATED: Calendar,
  EVENT_UPDATED: Calendar,
  EVENT_DELETED: Calendar,
  TODO_ASSIGNED: ListTodo,
  TODO_COMPLETED: ListTodo,
  TODO_DUE_SOON: ListTodo,
  PARTNER_INVITATION: Heart,
  PARTNER_ACCEPTED: Heart,
  PARTNER_STATUS: Heart,
  SYSTEM: AlertCircle,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  EVENT_REMINDER: "text-blue-500",
  EVENT_CREATED: "text-green-500",
  EVENT_UPDATED: "text-orange-500",
  EVENT_DELETED: "text-red-500",
  TODO_ASSIGNED: "text-purple-500",
  TODO_COMPLETED: "text-green-500",
  TODO_DUE_SOON: "text-orange-500",
  PARTNER_INVITATION: "text-pink-500",
  PARTNER_ACCEPTED: "text-pink-500",
  PARTNER_STATUS: "text-pink-500",
  SYSTEM: "text-gray-500",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  }, []);

  // Charger les notifications au montage et périodiquement
  useEffect(() => {
    fetchNotifications();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Rafraîchir quand le popover s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.event) {
      return "/calendar";
    }
    if (notification.todo) {
      return "/todos";
    }
    if (notification.type.startsWith("PARTNER")) {
      return "/settings/partner";
    }
    return null;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const iconColor = NOTIFICATION_COLORS[notification.type] || "text-gray-500";
                const link = getNotificationLink(notification);

                const content = (
                  <div
                    className={cn(
                      "flex gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
                      !notification.read && "bg-muted/30"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );

                return link ? (
                  <Link key={notification.id} href={link} onClick={() => setIsOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full"
              onClick={async () => {
                await fetch("/api/notifications?clearAll=true", {
                  method: "DELETE",
                });
                fetchNotifications();
              }}
            >
              Effacer les notifications lues
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
