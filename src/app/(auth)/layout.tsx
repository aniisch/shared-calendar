import { Heart } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simple */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-semibold">Calendrier Couple</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Fait avec amour pour les couples organisés</p>
      </footer>
    </div>
  );
}
