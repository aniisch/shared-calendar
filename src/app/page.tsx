import Link from "next/link";
import { Calendar, Heart, CheckSquare, Users, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="text-xl font-bold">Calendrier Couple</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Commencer
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Organisez votre vie à deux</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Votre calendrier{" "}
            <span className="text-primary">partagé</span>
            <br />
            pour une vie à deux organisée
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Synchronisez vos emplois du temps, partagez vos événements et gérez vos
            tâches ensemble. Tout ce dont vous avez besoin pour une vie de couple organisée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              Créer notre calendrier
              <Heart className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <FeatureCard
            icon={Calendar}
            title="Calendrier partagé"
            description="Visualisez vos événements et ceux de votre partenaire. Plusieurs vues disponibles : jour, semaine, mois, année."
          />
          <FeatureCard
            icon={CheckSquare}
            title="To-Do lists"
            description="Gérez vos tâches personnelles et partagées. Convertissez-les en événements en un clic."
          />
          <FeatureCard
            icon={Users}
            title="Statuts en temps réel"
            description="Voyez quand votre partenaire est disponible, occupé ou hors de France."
          />
          <FeatureCard
            icon={Shield}
            title="Confidentialité"
            description="Choisissez ce que vous partagez : événements privés, partagés ou visibles comme 'occupé'."
          />
          <FeatureCard
            icon={Heart}
            title="Fait pour les couples"
            description="Conçu spécialement pour deux personnes. Invitez votre partenaire et synchronisez vos vies."
          />
          <FeatureCard
            icon={Sparkles}
            title="Interface moderne"
            description="Design élégant avec thème clair/sombre. Intuitive et agréable à utiliser."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-5 w-5 fill-current" />
            <span className="text-sm">Calendrier Couple</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Fait avec amour pour les couples organisés
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
