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

export const TABS = [
  { href: "/", label: "עמוד ראשי" },
  { href: "/about", label: "אודות" },
  // The charts tab is turned off for now; its page is kept in src/app/_charts (not routed) for later.
  { href: "/daily", label: "נתונים יומיים" },
  { href: "/monthly", label: "נתונים חודשיים" },
];

export async function Header({ active }: { active?: string }) {
  const { isAdmin } = await getViewer();

  return (
    <header className="border-b border-line bg-card/85 backdrop-blur">
      <div className="mx-auto w-full max-w-5xl px-4 pb-4 pt-5">
        {/* Title centred; for the admin, their links sit above it on a phone and at the side on larger screens */}
        <div className="relative flex flex-col items-center gap-1 sm:min-h-10 sm:justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-rain">
              <DropIcon />
            </span>
            <span className="text-3xl font-bold leading-tight">משקעים ניר אליהו</span>
          </Link>
          {isAdmin && (
            <div className="order-first flex items-center gap-1 self-end text-sm sm:absolute sm:left-0 sm:top-1/2 sm:order-none sm:-translate-y-1/2">
              <Link
                href="/admin"
                aria-current={active === "/admin" ? "page" : undefined}
                className="rounded-full px-3 py-1.5 text-muted hover:bg-sky hover:text-ink aria-[current=page]:bg-sky aria-[current=page]:text-ink"
              >
                עדכון נתונים
              </Link>
              <form action={signOut}>
                <button className="rounded-full px-3 py-1.5 text-muted hover:bg-sky hover:text-ink">יציאה</button>
              </form>
            </div>
          )}
        </div>

        <nav aria-label="ניווט" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {TABS.map((t) => {
            const on = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`rounded-2xl px-3 py-3.5 text-center text-lg font-semibold transition-colors sm:py-4 ${
                  on ? "bg-rain text-white shadow-sm" : "bg-sky text-ink hover:bg-line"
                }`}
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

export async function Footer() {
  const { user } = await getViewer();
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 text-center text-sm text-muted">
      {!user && (
        <Link href="/login" className="underline-offset-4 hover:text-ink hover:underline">
          כניסת מנהל
        </Link>
      )}
    </footer>
  );
}

export function Page({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <>
      <Header active={active} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`rounded-2xl border border-line bg-card px-5 py-5 shadow-sm ${className}`}>{children}</section>;
}
