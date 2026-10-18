import { DropIcon, Header } from "@/components/Header";

// Placeholder cards until the rain data is connected.
const cards = [
  { label: "ממוצע שנתי", tone: "text-teal" },
  { label: "השנה הגשומה ביותר", tone: "text-teal" },
  { label: "השנה השחונה ביותר", tone: "text-rain" },
];

export default function Home() {
  return (
    <>
      <Header active="/" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        {cards.map((c) => (
          <section
            key={c.label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-5 shadow-sm"
          >
            <div>
              <h2 className="text-muted">{c.label}</h2>
              <p className={`mt-1 text-3xl font-bold tabular-nums ${c.tone}`}>
                —<span className="ms-1.5 text-lg font-medium">מ&quot;מ</span>
              </p>
            </div>
            <span className="text-drop">
              <DropIcon className="h-9 w-9" />
            </span>
          </section>
        ))}
        <p className="mt-2 text-center text-muted">הנתונים יתווספו בקרוב.</p>
      </main>
    </>
  );
}
