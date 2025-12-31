import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header sera ajouté plus tard */}
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
