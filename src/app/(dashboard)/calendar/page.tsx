import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, LogOut, User, Heart } from "lucide-react";

export const metadata = {
  title: "Calendrier | Calendrier Couple",
  description: "Votre calendrier partagé",
};

export default async function CalendarPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Bienvenue, {session?.user?.name || "Utilisateur"} !</CardTitle>
                <CardDescription>{session?.user?.email}</CardDescription>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {/* Placeholder Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier
          </CardTitle>
          <CardDescription>
            Votre calendrier partagé sera affiché ici
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground">
            <Calendar className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">Calendrier en construction</p>
            <p className="text-sm">Les vues jour, semaine, mois et année arrivent bientôt !</p>
          </div>
        </CardContent>
      </Card>

      {/* Partner Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Partenaire
          </CardTitle>
          <CardDescription>
            {session?.user?.partnerId
              ? "Vous êtes connecté avec votre partenaire"
              : "Invitez votre partenaire pour partager le calendrier"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!session?.user?.partnerId && (
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Inviter mon/ma partenaire
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
