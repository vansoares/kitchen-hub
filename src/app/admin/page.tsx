import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { Header } from "@/components/Header";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) notFound();

  return (
    <>
      <Header userName={session?.user?.name} userImage={session?.user?.image} isAdmin />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="font-disp mb-5 text-2xl font-bold">🔑 Admin</h2>
        <AdminUsersPanel />
      </main>
    </>
  );
}
