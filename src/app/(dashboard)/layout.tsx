import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout";

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
      <Header
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          partnerId: session.user.partnerId,
        }}
      />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
