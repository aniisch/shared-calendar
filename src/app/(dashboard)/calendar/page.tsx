import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { CalendarView } from "@/components/calendar";

export const metadata = {
  title: "Calendrier | Calendrier Couple",
  description: "Votre calendrier partagé",
};

export default async function CalendarPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <CalendarView />

      {/* Partner Status Card */}
      {!session?.user?.partnerId && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-pink-500" />
              Invitez votre partenaire
            </CardTitle>
            <CardDescription>
              Partagez votre calendrier et synchronisez vos emplois du temps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Envoyer une invitation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
