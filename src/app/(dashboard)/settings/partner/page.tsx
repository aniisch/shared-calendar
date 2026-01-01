"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Loader2, Inbox, Check, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PartnerCard, PartnerInviteForm } from "@/components/partner";

interface Partner {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  currentStatus: string | null;
  lastSeenAt: Date | string | null;
}

interface SentInvitation {
  id: string;
  email: string;
  status: string;
  message: string | null;
  createdAt: string;
  expiresAt: string;
}

interface ReceivedInvitation {
  id: string;
  email: string;
  message: string | null;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

interface PartnerData {
  partner: Partner | null;
  sentInvitations: SentInvitation[];
  receivedInvitations: ReceivedInvitation[];
}

export default function PartnerSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const fetchPartnerData = useCallback(async () => {
    try {
      const response = await fetch("/api/partner");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const handleUnlink = async () => {
    try {
      const response = await fetch("/api/partner/unlink", {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to get updated session
        router.refresh();
        fetchPartnerData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/partner/invite?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPartnerData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    setProcessingInvitation(token);
    try {
      const response = await fetch("/api/partner/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        router.refresh();
        fetchPartnerData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleDeclineInvitation = async (token: string) => {
    setProcessingInvitation(token);
    try {
      const response = await fetch("/api/partner/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        fetchPartnerData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setProcessingInvitation(null);
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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/calendar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            Partenaire
          </h1>
          <p className="text-muted-foreground">
            Gérez votre relation de calendrier partagé
          </p>
        </div>
      </div>

      {/* Received Invitations */}
      {data?.receivedInvitations && data.receivedInvitations.length > 0 && (
        <Card className="border-pink-200 dark:border-pink-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-pink-500" />
              Invitations reçues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.receivedInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-4 p-4 bg-pink-50 dark:bg-pink-950/30 rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={inv.sender.avatar || undefined} />
                  <AvatarFallback>
                    {inv.sender.name?.[0] || inv.sender.email?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{inv.sender.name || inv.sender.email}</p>
                  {inv.message && (
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{inv.message}&quot;
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvitation(inv.id)}
                    disabled={processingInvitation === inv.id}
                  >
                    {processingInvitation === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600"
                    onClick={() => handleAcceptInvitation(inv.id)}
                    disabled={processingInvitation === inv.id}
                  >
                    {processingInvitation === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Partner Card or Invite Form */}
      {data?.partner ? (
        <PartnerCard partner={data.partner} onUnlink={handleUnlink} />
      ) : (
        <PartnerInviteForm
          sentInvitations={data?.sentInvitations || []}
          onInviteSent={fetchPartnerData}
          onCancelInvitation={handleCancelInvitation}
        />
      )}
    </div>
  );
}
