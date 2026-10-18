import { Card, Page } from "@/components/Header";
import {
  CumulativeLines,
  DecadeBars,
  HeatLegend,
  Heatmap,
  Legend,
  MonthBars,
  Responsive,
  SeasonBars,
  TrendChart,
  type Line,
} from "@/components/charts";
import { getDays } from "@/lib/rain";
import {
  SEASON_MONTHS,
  averageCumulative,
  cumulative,
  decades,
  formatMm,
  linearTrend,
  monthLabel,
  movingAverage,
  seasonDayOffset,
  summarize,
  todayIL,
  type MonthKey,
} from "@/lib/seasons";
import { SeasonCompare } from "./SeasonCompare";

export const metadata = { title: "גרפים – משקעים ניר אליהו" };

const MA = 5; // seasons in the moving average

const SECTIONS = [
  { id: "seasons", label: "משקעים שנתיים" },
  { id: "trend", label: "מגמה ארוכת טווח" },
  { id: "decades", label: "השוואה בין עשורים" },
  { id: "cumulative", label: "גשם מצטבר" },
  { id: "months", label: "התפלגות עונתית" },
  { id: "compare", label: "השוואת עונות" },
  { id: "heatmap", label: "מפת חום" },
];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <section id={id} className="scroll-mt-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
        <div className="mt-3">{children}</div>
      </section>
    </Card>
  );
}

export default async function ChartsPage() {
  const days = await getDays();
  const sum = summarize(days);
  const last = sum.complete[sum.complete.length - 1];
  const cur = sum.seasons.find((s) => s.season === sum.current);
  const hasCurrent = !!cur && cur.rainDays > 0;
  // "קיץ" (June–August) keeps the month labels short enough for phone charts.
  const months = SEASON_MONTHS.map((k) => ({ key: String(k), label: k === "summer" ? "קיץ" : monthLabel(k, true) }));

  // 1. Season totals with a moving average.
  const bars = sum.seasons
    .filter((s) => s.season < sum.current || hasCurrent)
    .map((s) => ({ label: s.label, total: s.total, ongoing: s.season === sum.current }));
  const ma = movingAverage(sum.complete.map((s) => s.total), MA);

  // 2. Long-term trend, complete seasons only.
  const points = sum.complete.map((s) => ({ season: s.season, label: s.label, total: s.total }));
  const trend = linearTrend(points.map((p) => ({ x: p.season, y: p.total })));
  const perDecade = Math.round(trend.slope * 10);
  const first = points[0], lastP = points[points.length - 1];

  // 3. Decades.
  const dec = decades(sum.complete).map((d) => ({
    label: d.label,
    average: d.average,
    seasons: d.seasons,
    min: d.min.total,
    max: d.max.total,
    minLabel: d.min.label,
    maxLabel: d.max.label,
  }));

  // 4. Running total through the season.
  const lines: Line[] = [
    { label: `${sum.wettest.label} (הגשומה ביותר)`, values: cumulative(days, sum.wettest.season), color: "#9aa9b6", dash: "6 4", width: 1.5 },
    { label: `${sum.driest.label} (השחונה ביותר)`, values: cumulative(days, sum.driest.season), color: "#9aa9b6", width: 1.5 },
    { label: "ממוצע", values: averageCumulative(days, sum.complete.map((s) => s.season)), color: "#0b7a74", width: 3 },
    { label: `${last.label} (העונה הקודמת)`, values: cumulative(days, last.season), color: "#93b4f5", width: 2 },
  ];
  if (hasCurrent) {
    lines.push({
      label: `${cur!.label} (העונה הנוכחית)`,
      values: cumulative(days, sum.current),
      color: "#1d4fc4",
      width: 3.5,
      upTo: seasonDayOffset(todayIL()),
    });
  }

  // 5. Monthly distribution.
  const monthData = months.map((m) => ({ label: m.label, mm: sum.monthAverages[m.key] }));
  const share = (k: string) => Math.round((sum.monthAverages[k] / sum.average) * 100);
  const peak = SEASON_MONTHS.map(String).reduce((a, b) => (sum.monthAverages[b] > sum.monthAverages[a] ? b : a));
  const winter = share("12") + share("1") + share("2");

  // 6. Compare seasons.
  const compareSeasons = [...sum.seasons]
    .filter((s) => s.rainDays > 0)
    .reverse()
    .map((s) => ({ season: s.season, label: s.label, total: s.total, months: s.months }));
  const initial = [hasCurrent ? sum.current : last.season, sum.wettest.season, sum.driest.season];

  // 7. Heatmap: complete seasons plus the current one if it has reports.
  const heatSeasons = sum.seasons.filter((s) => s.season < sum.current || hasCurrent);

  return (
    <Page active="/charts">
      <nav aria-label="גרפים בעמוד" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:bg-sky">
            {s.label}
          </a>
        ))}
      </nav>

      <Section
        id="seasons"
        title="משקעים שנתיים עם ממוצע נע"
        intro={
          <>
            כל עמודה היא עונה. הקו הירוק הוא ממוצע נע של {MA} העונות האחרונות, שמחליק את התנודות משנה לשנה; הקו המקווקו הוא
            הממוצע הכללי.{hasCurrent && " העמודה הבהירה בסוף היא העונה הנוכחית, עד היום."}
          </>
        }
      >
        <Legend
          items={[
            { label: `ממוצע נע (${MA} עונות)`, color: "#0b7a74" },
            { label: `ממוצע כללי (${formatMm(sum.average)})`, color: "#12283a", dash: true },
          ]}
        />
        <div className="mt-2">
          <Responsive
            phone={<SeasonBars compact data={bars} average={sum.average} movingAvg={ma} />}
            wide={<SeasonBars data={bars} average={sum.average} movingAvg={ma} />}
          />
        </div>
      </Section>

      <Section
        id="trend"
        title={`מגמת משקעים ארוכת טווח (${first.label}–${lastP.label})`}
        intro={
          <>
            כל נקודה היא עונה, והקו הוא המגמה הלינארית: {perDecade === 0 ? "ללא שינוי" : `${perDecade > 0 ? "עלייה" : "ירידה"} של כ-${Math.abs(perDecade)} מ"מ בכל עשור`}
            .{" "}
            {trend.r2 < 0.1
              ? "המגמה חלשה מאוד ביחס להבדלים הגדולים בין עונה לעונה, כך שאין כאן שינוי ברור לאורך השנים."
              : `המגמה מסבירה כ-${Math.round(trend.r2 * 100)}% מההבדלים בין העונות.`}
          </>
        }
      >
        <Responsive phone={<TrendChart compact points={points} trend={trend} />} wide={<TrendChart points={points} trend={trend} />} />
      </Section>

      <Section
        id="decades"
        title="השוואת משקעים בין עשורים"
        intro="העמודה היא העונה הממוצעת בכל עשור; הקו הדק מראה את הטווח מהעונה השחונה ביותר בעשור ועד הגשומה ביותר. שנות ה-70 הן העונות 70/71 עד 79/80, וכן הלאה."
      >
        <Responsive phone={<DecadeBars compact data={dec} />} wide={<DecadeBars data={dec} />} />
      </Section>

      <Section
        id="cumulative"
        title="גשם מצטבר לאורך העונה"
        intro={
          <>
            כמה גשם הצטבר מתחילת העונה ועד כל יום, בהשוואה לממוצע.
            {!hasCurrent && " עדיין אין דיווחים לעונה הנוכחית; היא תופיע כאן עם הדיווח הראשון."}
          </>
        }
      >
        <Legend items={[...lines].reverse().map((l) => ({ label: l.label, color: l.color, dash: !!l.dash }))} />
        <div className="mt-2">
          <Responsive phone={<CumulativeLines compact lines={lines} />} wide={<CumulativeLines lines={lines} />} />
        </div>
      </Section>

      <Section
        id="months"
        title="התפלגות עונתית – ממוצע משקעים חודשי"
        intro={
          <>
            כמה גשם יורד בממוצע בכל חודש, במ&quot;מ ({sum.complete.length} עונות). החודש הגשום ביותר הוא{" "}
            {monthLabel((peak === "summer" ? "summer" : Number(peak)) as MonthKey)}, ובדצמבר–פברואר יורדים כ-{winter}% מגשם העונה.
          </>
        }
      >
        <Responsive phone={<MonthBars compact data={monthData} />} wide={<MonthBars data={monthData} />} />
      </Section>

      <Section
        id="compare"
        title="השוואת עונות – התפלגות משקעים"
        intro="בחרו עד שלוש עונות כדי לראות איך הגשם התחלק בין החודשים בכל אחת, לעומת הממוצע (הקו המקווקו בכל חודש)."
      >
        <SeasonCompare
          seasons={compareSeasons}
          months={months}
          average={sum.monthAverages}
          averageTotal={sum.average}
          initial={initial}
        />
      </Section>

      <Section
        id="heatmap"
        title="מפת חום – משקעים חודשיים לפי שנים"
        intro="כל משבצת היא חודש בעונה מסוימת; ככל שהצבע כהה יותר, ירד יותר גשם. במחשב, מעבר עם העכבר על משבצת מראה את הכמות המדויקת."
      >
        <HeatLegend />
        <div className="mt-3">
          <Responsive
            phone={<Heatmap compact seasons={heatSeasons} months={months} />}
            wide={<Heatmap seasons={heatSeasons} months={months} />}
          />
        </div>
      </Section>
    </Page>
  );
}
