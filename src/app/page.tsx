import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";
import { PantryApp } from "@/components/PantryApp";
import { Footer } from "@/components/Footer";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header userName={session?.user?.name} userImage={session?.user?.image} />
      <NavTabs />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <PantryApp userName={session?.user?.name} />
      </main>
      <Footer />
    </>
  );
}
