import { Card, Page } from "@/components/Header";
import { CumulativeLines, Legend, MonthBars, Responsive, SeasonBars, type Line } from "@/components/charts";
import { getDays } from "@/lib/rain";
import { SEASON_MONTHS, averageCumulative, cumulative, monthLabel, seasonDayOffset, summarize, todayIL } from "@/lib/seasons";

export const metadata = { title: "גרפים – משקעים ניר אליהו" };

export default async function ChartsPage() {
  const days = await getDays();
  const sum = summarize(days);
  const last = sum.complete[sum.complete.length - 1];
  const cur = sum.seasons.find((s) => s.season === sum.current);
  const hasCurrent = !!cur && cur.rainDays > 0;

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

  const monthData = SEASON_MONTHS.map((k) => ({ label: monthLabel(k, true), mm: sum.monthAverages[String(k)] }));
  const bars = sum.seasons
    .filter((s) => s.season < sum.current || hasCurrent)
    .map((s) => ({ label: s.label, total: s.total, ongoing: s.season === sum.current }));

  return (
    <Page active="/charts">
      <Card>
        <h2 className="text-lg font-bold">גשם בכל עונה</h2>
        <p className="mt-1 text-sm text-muted">
          בירוק-כהה: העונה הגשומה ביותר ({sum.wettest.label}) והשחונה ביותר ({sum.driest.label}). הקו המקווקו הוא הממוצע.
          {hasCurrent && " העמודה הבהירה בסוף היא העונה הנוכחית, עד היום."}
        </p>
        <div className="mt-3">
          <Responsive
            phone={<SeasonBars compact data={bars} average={sum.average} highlight={{ wettest: sum.wettest.label, driest: sum.driest.label }} />}
            wide={<SeasonBars data={bars} average={sum.average} highlight={{ wettest: sum.wettest.label, driest: sum.driest.label }} />}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">גשם מצטבר לאורך העונה</h2>
        <p className="mt-1 text-sm text-muted">
          כמה גשם הצטבר מתחילת העונה ועד כל יום, בהשוואה לממוצע.
          {!hasCurrent && " עדיין אין דיווחים לעונה הנוכחית; היא תופיע כאן עם הדיווח הראשון."}
        </p>
        <div className="mt-3">
          <Legend
            items={[...lines].reverse().map((l) => ({ label: l.label, color: l.color, dash: !!l.dash }))}
          />
        </div>
        <div className="mt-2">
          <Responsive phone={<CumulativeLines compact lines={lines} />} wide={<CumulativeLines lines={lines} />} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">ממוצע לפי חודש</h2>
        <p className="mt-1 text-sm text-muted">כמה גשם יורד בממוצע בכל חודש, במ&quot;מ ({sum.complete.length} עונות).</p>
        <div className="mt-3">
          <Responsive phone={<MonthBars compact data={monthData} />} wide={<MonthBars data={monthData} />} />
        </div>
      </Card>
    </Page>
  );
}
