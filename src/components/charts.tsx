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
  movingAvg,
  compact,
}: {
  data: { label: string; total: number; ongoing?: boolean }[];
  average: number;
  highlight?: { wettest: string; driest: string };
  movingAvg?: (number | null)[];
  compact?: boolean;
}) {
  const W = compact ? 420 : 960, H = compact ? 260 : 340, L = compact ? 42 : 52, R = compact ? 6 : 12, T = 22, B = compact ? 30 : 36;
  const fs = compact ? 13.5 : 14;
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
        const fill = d.ongoing ? C.barSoft : highlight && (d.label === highlight.wettest || d.label === highlight.driest) ? C.teal : C.bar;
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
      {movingAvg && (
        <polyline
          points={movingAvg
            .map((v, i) => (v == null ? null : `${(L + i * bw + bw / 2).toFixed(1)},${y(v).toFixed(1)}`))
            .filter(Boolean)
            .join(" ")}
          fill="none"
          stroke={C.teal}
          strokeWidth={compact ? 2.5 : 3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
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
  const W = compact ? 420 : 960, H = compact ? 280 : 360, L = compact ? 42 : 52, R = compact ? 8 : 16, T = 16, B = 32;
  const fs = compact ? 13.5 : 14;
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
  const W = compact ? 420 : 960, H = compact ? 240 : 280, L = compact ? 42 : 52, R = compact ? 4 : 12, T = 24, B = 32;
  const fs = compact ? 13 : 14;
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

// Season totals as dots, with the straight trend line through them.
export function TrendChart({
  points,
  trend,
  compact,
}: {
  points: { season: number; label: string; total: number }[];
  trend: { at: (x: number) => number };
  compact?: boolean;
}) {
  const W = compact ? 420 : 960, H = compact ? 260 : 320, L = compact ? 42 : 52, R = compact ? 10 : 16, T = 16, B = 30;
  const fs = compact ? 13.5 : 14;
  const x0 = points[0].season, x1 = points[points.length - 1].season;
  const max = niceMax(Math.max(...points.map((p) => p.total)), 200);
  const x = (s: number) => L + (W - L - R) * ((s - x0) / Math.max(1, x1 - x0));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / 200 + 1 }, (_, i) => i * 200);
  const step = compact ? 10 : 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="מגמת משקעים ארוכת טווח" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={fs} fill={C.muted}>
            {t}
          </text>
        </g>
      ))}
      {points
        .filter((p) => p.season % step === 0)
        .map((p) => (
          <text key={p.season} x={x(p.season)} y={H - 10} textAnchor="middle" fontSize={fs} fill={C.muted}>
            {p.label}
          </text>
        ))}
      {points.map((p) => (
        <circle key={p.season} cx={x(p.season)} cy={y(p.total)} r={compact ? 3 : 4.5} fill={C.bar} fillOpacity={0.75}>
          <title>{`${p.label}: ${formatMm(p.total)} מ"מ`}</title>
        </circle>
      ))}
      <line x1={x(x0)} x2={x(x1)} y1={y(trend.at(x0))} y2={y(trend.at(x1))} stroke={C.teal} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

// Average season per decade (bar), with the range from its driest to its wettest season (thin line).
export function DecadeBars({
  data,
  compact,
}: {
  data: { label: string; average: number; min: number; max: number; seasons: number; minLabel: string; maxLabel: string }[];
  compact?: boolean;
}) {
  const W = compact ? 420 : 960, H = compact ? 280 : 320, L = compact ? 42 : 52, R = compact ? 4 : 12, T = 24, B = compact ? 44 : 40;
  const fs = compact ? 13 : 14;
  const max = niceMax(Math.max(...data.map((d) => d.max)), 200);
  const bw = (W - L - R) / data.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / 200 + 1 }, (_, i) => i * 200);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="השוואת משקעים בין עשורים" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={fs} fill={C.muted}>
            {t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = L + i * bw + bw / 2;
        return (
          <g key={d.label}>
            <rect x={cx - bw * 0.3} y={y(d.average)} width={bw * 0.6} height={y(0) - y(d.average)} rx={4} fill={C.bar}>
              <title>{`${d.label}: ממוצע ${formatMm(d.average)} מ"מ (${d.seasons} עונות). השחונה ${d.minLabel}: ${formatMm(d.min)}, הגשומה ${d.maxLabel}: ${formatMm(d.max)}`}</title>
            </rect>
            <line x1={cx} x2={cx} y1={y(d.min)} y2={y(d.max)} stroke={C.ink} strokeWidth={1.5} />
            <line x1={cx - 6} x2={cx + 6} y1={y(d.max)} y2={y(d.max)} stroke={C.ink} strokeWidth={1.5} />
            <line x1={cx - 6} x2={cx + 6} y1={y(d.min)} y2={y(d.min)} stroke={C.ink} strokeWidth={1.5} />
            <rect x={cx - 17} y={y(0) - 24} width={34} height={18} rx={9} fill="#fff" />
            <text x={cx} y={y(0) - 11} textAnchor="middle" fontSize={fs + 1} fontWeight="700" fill={C.ink}>
              {Math.round(d.average)}
            </text>
            <text x={cx} y={H - B + 16} textAnchor="middle" fontSize={fs} fill={C.ink}>
              {d.label.replace("שנות ה-", "")}
            </text>
            <text x={cx} y={H - B + 30} textAnchor="middle" fontSize={fs - 1} fill={C.muted} direction="rtl">
              {`${d.seasons} עונות`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Monthly rain for every season as coloured squares. Bins are fixed so colours mean the same everywhere.
export const HEAT_BINS = [
  { upTo: 0, color: "#eef3f8", label: "0" },
  { upTo: 25, color: "#cfe0f7", label: "עד 25" },
  { upTo: 50, color: "#a3c3f2", label: "25–50" },
  { upTo: 100, color: "#6f9de9", label: "50–100" },
  { upTo: 150, color: "#3f74dc", label: "100–150" },
  { upTo: 250, color: "#1d4fc4", label: "150–250" },
  { upTo: Infinity, color: "#12337f", label: "מעל 250" },
];
const heatColor = (mm: number) => HEAT_BINS.find((b) => mm <= b.upTo)!.color;

export function Heatmap({
  seasons,
  months,
  compact,
}: {
  seasons: { season: number; label: string; months: Record<string, number> }[];
  months: { key: string; label: string }[];
  compact?: boolean;
}) {
  if (compact) {
    // Phone: one row per season (newest on top), months across.
    const rows = [...seasons].reverse();
    const L = 50, T = 24, cw = (420 - L - 4) / months.length, ch = 13, W = 420, H = T + rows.length * ch + 4;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="מפת חום של משקעים חודשיים" style={{ direction: "ltr" }}>
        {months.map((m, j) => (
          <text key={m.key} x={L + j * cw + cw / 2} y={14} textAnchor="middle" fontSize={11.5} fill={C.muted}>
            {m.label}
          </text>
        ))}
        {rows.map((s, i) => (
          <g key={s.season}>
            {s.season % 5 === 0 && (
              <text x={L - 6} y={T + i * ch + ch - 2.5} textAnchor="end" fontSize={11.5} fill={C.muted}>
                {s.label}
              </text>
            )}
            {months.map((m, j) => {
              const mm = s.months[m.key] ?? 0;
              return (
                <rect key={m.key} x={L + j * cw + 0.5} y={T + i * ch + 0.5} width={cw - 1} height={ch - 1} fill={heatColor(mm)}>
                  <title>{`${s.label}, ${m.label}: ${formatMm(mm)} מ"מ`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    );
  }
  // Wide: one column per season (oldest on the left), months down.
  const L = 72, T = 8, R = 4, W = 960, cw = (W - L - R) / seasons.length, ch = 24, H = T + months.length * ch + 26;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="מפת חום של משקעים חודשיים" style={{ direction: "ltr" }}>
      {months.map((m, j) => (
        <text key={m.key} x={L - 8} y={T + j * ch + ch / 2 + 4} textAnchor="end" fontSize={14} fill={C.muted}>
          {m.label}
        </text>
      ))}
      {seasons.map((s, i) => (
        <g key={s.season}>
          {s.season % 5 === 0 && (
            <text x={L + i * cw + cw / 2} y={H - 8} textAnchor="middle" fontSize={13} fill={C.muted}>
              {s.label}
            </text>
          )}
          {months.map((m, j) => {
            const mm = s.months[m.key] ?? 0;
            return (
              <rect key={m.key} x={L + i * cw + 0.5} y={T + j * ch + 0.5} width={cw - 1} height={ch - 1} fill={heatColor(mm)}>
                <title>{`${s.label}, ${m.label}: ${formatMm(mm)} מ"מ`}</title>
              </rect>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export function HeatLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {HEAT_BINS.map((b) => (
        <li key={b.label} className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3.5 w-5 rounded-sm" style={{ backgroundColor: b.color }} />
          {/* Number ranges like 25–50 read left to right, or the browser shows them reversed in Hebrew text */}
          <span dir={/^[\d–]+$/.test(b.label) ? "ltr" : undefined}>{b.label}</span>
        </li>
      ))}
      <li className="text-muted">מ&quot;מ בחודש</li>
    </ul>
  );
}
