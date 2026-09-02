import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";
import { MenusApp } from "@/components/MenusApp";

export default async function CardapiosPage() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header userName={session?.user?.name} userImage={session?.user?.image} />
      <NavTabs />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <MenusApp />
      </main>
    </>
  );
}
