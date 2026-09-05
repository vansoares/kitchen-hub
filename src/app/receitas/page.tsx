import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";
import { RecipesApp } from "@/components/RecipesApp";
import { Footer } from "@/components/Footer";

export default async function ReceitasPage() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header
        userName={session?.user?.name}
        userImage={session?.user?.image}
        isAdmin={session?.user?.isAdmin}
      />
      <NavTabs />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <RecipesApp />
      </main>
      <Footer />
    </>
  );
}
