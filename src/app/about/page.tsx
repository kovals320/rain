import { Card, Page } from "@/components/Header";
import { getDays } from "@/lib/rain";
import { formatDate, summarize } from "@/lib/seasons";

export const metadata = { title: "אודות – משקעים ניר אליהו" };

export default async function AboutPage() {
  const days = await getDays();
  const sum = summarize(days);
  const first = days[0]?.date;

  return (
    <Page active="/about">
      <Card>
        <h1 className="text-2xl font-bold">אודות</h1>
        <div className="mt-3 space-y-3 leading-relaxed">
          <p>
            באתר הזה מרוכזים נתוני הגשם של קיבוץ ניר אליהו: מדידה יומית של כמות הגשם, במילימטרים, החל מ-
            {first ? formatDate(first) : "1970"}. יש כאן {sum.complete.length} עונות גשם שלמות, ועוד העונה הנוכחית שמתעדכנת במהלך
            החורף.
          </p>
          <p>
            <strong>עונת גשם</strong> נמשכת מספטמבר עד מאי, ונקראת לפי השנים שהיא עוברת בהן: העונה שמתחילה בספטמבר 2025 היא{" "}
            <strong>25/26</strong>. גשם שיורד ביוני–אוגוסט, וזה קורה לעתים רחוקות, נספר לעונה שמתחילה בספטמבר שאחריו.
          </p>
          <p>
            <strong>ממוצע שנתי</strong> הוא הממוצע של כל העונות השלמות. העונה הנוכחית לא נכללת בו עד שהיא מסתיימת.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">מה יש בכל לשונית</h2>
        <ul className="mt-3 list-disc space-y-1.5 ps-5 leading-relaxed">
          <li>
            <strong>עמוד ראשי</strong>: העונה הנוכחית בהשוואה לממוצע, שיאים ודיווחים אחרונים.
          </li>
          <li>
            <strong>גרפים</strong>: הגשם בכל עונה, הגשם המצטבר לאורך העונה, וממוצע לפי חודש.
          </li>
          <li>
            <strong>נתונים חודשיים</strong>: טבלה של כל העונות לפי חודשים.
          </li>
          <li>
            <strong>נתונים יומיים</strong>: כל ימי הגשם של עונה שבוחרים.
          </li>
        </ul>
      </Card>
    </Page>
  );
}
