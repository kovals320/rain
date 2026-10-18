import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { signOut } from "@/app/actions";

export function DropIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={`${className} fill-none stroke-current`} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M11 6c3 4.5 5.5 7.6 5.5 10.6a5.5 5.5 0 0 1-11 0C5.5 13.6 8 10.5 11 6z" />
      <path d="M22 11c2.6 3.8 4.6 6.4 4.6 9a4.6 4.6 0 0 1-9.2 0c0-2.6 2-5.2 4.6-9z" />
    </svg>
  );
}

const tabs = [
  { href: "/", label: "עמוד ראשי" },
  // More tabs (monthly, daily, charts, about) will be added with the data.
];

export async function Header({ active = "/" }: { active?: string }) {
  const { isAdmin } = await getViewer();

  return (
    <header className="border-b border-line bg-card/80 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-rain">
              <DropIcon />
            </span>
            <span className="text-2xl font-bold leading-tight sm:text-3xl">משקעים ניר אליהו</span>
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-1 text-sm">
              <Link href="/admin" className="rounded-full px-3 py-1.5 text-muted hover:bg-sky hover:text-ink">
                ניהול
              </Link>
              <form action={signOut}>
                <button className="rounded-full px-3 py-1.5 text-muted hover:bg-sky hover:text-ink">יציאה</button>
              </form>
            </div>
          )}
        </div>

        <nav aria-label="ניווט" className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const on = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={
                  on
                    ? "rounded-xl bg-rain px-5 py-2.5 font-medium text-white shadow-sm"
                    : "rounded-xl bg-sky px-5 py-2.5 font-medium text-ink hover:bg-line"
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
