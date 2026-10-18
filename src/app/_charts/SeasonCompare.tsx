"use client";

import { useState } from "react";

type S = { season: number; label: string; total: number; months: Record<string, number> };

const COLORS = ["#1d4fc4", "#0b7a74", "#c2410c"]; // blue, teal, burnt orange: distinct, and readable on white
const fmt = (n: number) => n.toLocaleString("he-IL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Chart({
  picked,
  months,
  average,
  compact,
}: {
  picked: S[];
  months: { key: string; label: string }[];
  average: Record<string, number>;
  compact?: boolean;
}) {
  const W = compact ? 420 : 960, H = compact ? 260 : 320, L = compact ? 42 : 52, R = compact ? 4 : 12, T = 12, B = 30;
  const fs = compact ? 13 : 14;
  const top = Math.max(50, ...picked.flatMap((s) => months.map((m) => s.months[m.key] ?? 0)), ...months.map((m) => average[m.key] ?? 0));
  const step = top > 300 ? 100 : 50;
  const max = Math.ceil(top / step) * step;
  const gw = (W - L - R) / months.length;
  const bw = (gw * 0.8) / Math.max(1, picked.length);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="השוואת עונות לפי חודשים" style={{ direction: "ltr" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#dbe7f0" />
          <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize={fs} fill="#55687a">
            {t}
          </text>
        </g>
      ))}
      {months.map((m, j) => {
        const gx = L + j * gw + gw * 0.1;
        const avg = average[m.key] ?? 0;
        return (
          <g key={m.key}>
            {picked.map((s, k) => {
              const v = s.months[m.key] ?? 0;
              return (
                <rect key={s.season} x={gx + k * bw + 0.5} y={y(v)} width={bw - 1} height={y(0) - y(v)} rx={1.5} fill={COLORS[k]}>
                  <title>{`${s.label}, ${m.label}: ${fmt(v)} מ"מ`}</title>
                </rect>
              );
            })}
            <line x1={L + j * gw + gw * 0.05} x2={L + (j + 1) * gw - gw * 0.05} y1={y(avg)} y2={y(avg)} stroke="#12283a" strokeWidth={2} strokeDasharray="4 3">
              <title>{`ממוצע ${m.label}: ${fmt(avg)} מ"מ`}</title>
            </line>
            <text x={L + j * gw + gw / 2} y={H - 10} textAnchor="middle" fontSize={fs} fill="#55687a">
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function SeasonCompare({
  seasons,
  months,
  average,
  averageTotal,
  initial,
}: {
  seasons: S[]; // newest first
  months: { key: string; label: string }[];
  average: Record<string, number>;
  averageTotal: number;
  initial: number[];
}) {
  const [sel, setSel] = useState<number[]>(initial);
  const picked = sel.map((n) => seasons.find((s) => s.season === n)!).filter(Boolean);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {sel.map((n, k) => (
          <label key={k} className="flex items-center gap-2 rounded-xl border border-line bg-card px-2.5 py-1.5">
            <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[k] }} />
            <span className="sr-only">עונה {k + 1}</span>
            <select
              value={n}
              onChange={(e) => setSel(sel.map((v, i) => (i === k ? Number(e.target.value) : v)))}
              className="bg-transparent tabular-nums outline-none"
            >
              {seasons.map((s) => (
                <option key={s.season} value={s.season}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-sm tabular-nums text-muted">{fmt(picked[k]?.total ?? 0)} מ&quot;מ</span>
          </label>
        ))}
        <span className="flex items-center gap-2 px-1 text-sm text-muted">
          <svg aria-hidden width="20" height="6">
            <line x1="1" x2="19" y1="3" y2="3" stroke="#12283a" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          ממוצע ({fmt(averageTotal)} מ&quot;מ)
        </span>
      </div>
      <div className="mt-3 sm:hidden">
        <Chart compact picked={picked} months={months} average={average} />
      </div>
      <div className="mt-3 hidden sm:block">
        <Chart picked={picked} months={months} average={average} />
      </div>
    </div>
  );
}
