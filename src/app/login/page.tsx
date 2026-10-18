import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { DropIcon } from "@/components/Header";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "כניסה – משקעים ניר אליהו" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await getViewer();
  if (user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <span className="text-rain">
          <DropIcon className="h-10 w-10" />
        </span>
        <h1 className="mt-3 text-3xl font-bold">משקעים ניר אליהו</h1>
        <p className="mt-1 text-muted">כניסת מנהל</p>
        <LoginForm linkError={error === "link"} />
      </div>
    </main>
  );
}
