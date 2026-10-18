import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "סיסמה חדשה – משקעים ניר אליהו" };

export default async function ResetPasswordPage() {
  const { user } = await getViewer();
  if (!user) redirect("/login");
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-bold">בחירת סיסמה חדשה</h1>
        <ResetForm />
      </div>
    </main>
  );
}
