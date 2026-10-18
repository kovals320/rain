// Charts drawn as plain SVG on the server: fast, no chart library, readable on a phone.
// Time runs left to right (the usual convention for charts, also in Hebrew).

import { SEASON_LENGTH, formatMm } from "@/lib/seasons";

const C = {
  bar: "#2563eb",
  barSoft: "#93b4f5",
  teal: "#0b7a74",
  ink: "#12283a",
  muted: "#55687a",
  grid: "#dbe7f0",
  gray: "#9aa9b6",
};

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function SeasonBars({
  data,
  average,
  highlight,
  compact,
}: {
  data: { label: string; total: number; ongoing?: boolean }[];
  average: number;
  highlight: { wettest: string; driest: string };
  compact?: boolean;
}) {
  const W = compact ? 420 : 960, H = compact ? 260 : 340, L = compact ? 36 : 48, R = compact ? 6 : 12, T = 22, B = compact ? 30 : 36;
  const fs = compact ? 11 : 12;
  const every = compact ? 10 : 5;
  const max = niceMax(Math.max(...data.map((d) => d.total)), 200);
  const bw = (W - L - R) / data.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / 200 + 1 }, (_, i) => i * 200);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="כמות הגשם בכל עונה" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={fs} fill={C.muted}>
            {t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = L + i * bw;
        const fill = d.ongoing ? C.barSoft : d.label === highlight.wettest || d.label === highlight.driest ? C.teal : C.bar;
        return (
          <g key={d.label}>
            <rect x={x + bw * 0.15} y={y(d.total)} width={bw * 0.7} height={Math.max(0, y(0) - y(d.total))} rx={2} fill={fill}>
              <title>{`${d.label}: ${formatMm(d.total)} מ"מ${d.ongoing ? " (עונה נוכחית)" : ""}`}</title>
            </rect>
            {(i % every === 0 || (i === data.length - 1 && i % every >= every * 0.6)) && (
              <text
                x={i === data.length - 1 ? W - R : x + bw / 2}
                y={H - B + 18}
                textAnchor={i === data.length - 1 ? "end" : "middle"}
                fontSize={fs}
                fill={C.muted}
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
      <line x1={L} x2={W - R} y1={y(average)} y2={y(average)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
      <AvgLabel x={W - R} y={T - 6} fs={fs + 1} value={average} />
    </svg>
  );
}

// Month starts as day offsets from 1 September.
const MONTH_TICKS = [
  { off: 0, label: "ספט׳" }, { off: 30, label: "אוק׳" }, { off: 61, label: "נוב׳" }, { off: 91, label: "דצמ׳" },
  { off: 122, label: "ינו׳" }, { off: 153, label: "פבר׳" }, { off: 181, label: "מרץ" }, { off: 212, label: "אפר׳" },
  { off: 242, label: "מאי" },
];

export type Line = { label: string; values: number[]; color: string; width?: number; dash?: string; upTo?: number };

export function CumulativeLines({ lines, compact }: { lines: Line[]; compact?: boolean }) {
  const W = compact ? 420 : 960, H = compact ? 280 : 360, L = compact ? 36 : 48, R = compact ? 8 : 16, T = 16, B = 32;
  const fs = compact ? 11 : 12;
  const max = niceMax(Math.max(...lines.flatMap((l) => l.values.slice(0, (l.upTo ?? SEASON_LENGTH) + 1))), 200);
  const x = (i: number) => L + (W - L - R) * (i / SEASON_LENGTH);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / 200 + 1 }, (_, i) => i * 200);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="גשם מצטבר לאורך העונה" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={fs} fill={C.muted}>
            {t}
          </text>
        </g>
      ))}
      {MONTH_TICKS.map((m) => (
        <text key={m.off} x={x(m.off + 15)} y={H - 10} textAnchor="middle" fontSize={fs} fill={C.muted}>
          {m.label}
        </text>
      ))}
      {lines.map((l) => {
        const end = l.upTo ?? SEASON_LENGTH;
        const pts = l.values.slice(0, end + 1).map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
        const last = l.values[end];
        return (
          <g key={l.label}>
            <polyline points={pts} fill="none" stroke={l.color} strokeWidth={l.width ?? 2} strokeDasharray={l.dash} strokeLinejoin="round">
              <title>{`${l.label}: ${formatMm(last)} מ"מ`}</title>
            </polyline>
            <circle cx={x(end)} cy={y(last)} r={3.5} fill={l.color} />
          </g>
        );
      })}
    </svg>
  );
}

export function MonthBars({ data, compact }: { data: { label: string; mm: number }[]; compact?: boolean }) {
  const W = compact ? 420 : 960, H = compact ? 240 : 280, L = compact ? 32 : 48, R = compact ? 4 : 12, T = 24, B = 32;
  const fs = compact ? 10.5 : 12;
  const max = niceMax(Math.max(...data.map((d) => d.mm)), 50);
  const bw = (W - L - R) / data.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / 50 + 1 }, (_, i) => i * 50);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="ממוצע גשם לפי חודש" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={fs} fill={C.muted}>
            {t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = L + i * bw;
        return (
          <g key={d.label}>
            <rect x={x + bw * 0.2} y={y(d.mm)} width={bw * 0.6} height={Math.max(0, y(0) - y(d.mm))} rx={3} fill={C.bar}>
              <title>{`${d.label}: ${formatMm(d.mm)} מ"מ בממוצע`}</title>
            </rect>
            <text x={x + bw / 2} y={y(d.mm) - 6} textAnchor="middle" fontSize={fs + 1} fontWeight="600" fill={C.ink}>
              {Math.round(d.mm)}
            </text>
            <text x={x + bw / 2} y={H - 10} textAnchor="middle" fontSize={fs} fill={C.muted}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dash?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <svg aria-hidden width="22" height="8">
            <line x1="1" x2="21" y1="4" y2="4" stroke={i.color} strokeWidth="3" strokeDasharray={i.dash ? "5 3" : undefined} />
          </svg>
          {i.label}
        </li>
      ))}
    </ul>
  );
}

// "ממוצע 597.6": the word and the number as separate pieces, so mixed Hebrew and digits can't reorder.
function AvgLabel({ x, y, fs, value }: { x: number; y: number; fs: number; value: number }) {
  return (
    <g>
      <line x1={x - 22} x2={x} y1={y - fs / 3} y2={y - fs / 3} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={x - 28} y={y} textAnchor="end" fontSize={fs} fontWeight="600" fill={C.ink}>
        {formatMm(value)}
      </text>
      <text x={x - 28 - fs * 3.2} y={y} textAnchor="end" fontSize={fs} fill={C.ink}>
        ממוצע
      </text>
    </g>
  );
}

// Each chart drawn twice: a compact version for phones and a wide one for larger screens.
export function Responsive({ phone, wide }: { phone: React.ReactNode; wide: React.ReactNode }) {
  return (
    <>
      <div className="sm:hidden">{phone}</div>
      <div className="hidden sm:block">{wide}</div>
    </>
  );
}
