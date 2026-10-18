import { Header } from "@/components/Header";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "ניהול – משקעים ניר אליהו" };

export default async function AdminPage() {
  const { member } = await requireAdmin();

  return (
    <>
      <Header active="/admin" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="rounded-2xl border border-line bg-card px-5 py-5 shadow-sm">
          <h1 className="text-2xl font-bold">ניהול</h1>
          <p className="mt-2 text-muted">
            שלום {member.display_name ?? member.email}. כאן יתווספו הכלים לעדכון נתוני הגשם.
          </p>
        </section>
      </main>
    </>
  );
}
