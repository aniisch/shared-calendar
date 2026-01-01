"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Heart,
  HeartOff,
  User,
  Mail,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Partner {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  currentStatus: string | null;
  lastSeenAt: Date | string | null;
}

interface PartnerCardProps {
  partner: Partner;
  onUnlink: () => Promise<void>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponible", color: "bg-green-500" },
  BUSY: { label: "Occupé(e)", color: "bg-red-500" },
  OUT_OF_FRANCE: { label: "Absent(e)", color: "bg-orange-500" },
  DO_NOT_DISTURB: { label: "Ne pas déranger", color: "bg-purple-500" },
  OFFLINE: { label: "Hors ligne", color: "bg-gray-400" },
};

export function PartnerCard({ partner, onUnlink }: PartnerCardProps) {
  const [isUnlinking, setIsUnlinking] = useState(false);

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      await onUnlink();
    } finally {
      setIsUnlinking(false);
    }
  };

  const statusInfo = STATUS_LABELS[partner.currentStatus || "OFFLINE"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-pink-500" />
          Mon Partenaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Partner Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={partner.avatar || undefined} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {partner.name || "Mon partenaire"}
              </h3>
              <span
                className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`}
                title={statusInfo.label}
              />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {partner.email}
            </p>
            {partner.lastSeenAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Vu(e) {format(new Date(partner.lastSeenAt), "PPp", { locale: fr })}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span
            className={`w-3 h-3 rounded-full ${statusInfo.color}`}
          />
          <span className="text-sm">{statusInfo.label}</span>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <HeartOff className="h-4 w-4 mr-2" />
                Dissocier le partenaire
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Dissocier le partenaire ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va supprimer la liaison avec{" "}
                  <strong>{partner.name || partner.email}</strong>.
                  <br /><br />
                  Les événements et tâches partagés seront convertis en éléments privés.
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnlink}
                  disabled={isUnlinking}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isUnlinking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <HeartOff className="h-4 w-4 mr-2" />
                  )}
                  Dissocier
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
