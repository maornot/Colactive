# קולאקטייב

מאגר עצמאי וחינמי שמרכז קולות קוראים, מכרזים ומסגרות הסכם מגופים ציבוריים בישראל — משרדי ממשלה, רשויות מקומיות,
עמותות וקרנות — ומסנן אותם לעולם העיצוב: עיצוב גרפי, אנימציה ומושן, איור, UX ודיגיטל, צילום, קופי ותוכן ועיצוב
תערוכות. משתמש נרשם, מסמן תחומים, ומקבל מייל עם קישור ישיר לפרסום ברגע שהוא מתגלה.

Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres + Auth), Resend לשליחת מיילים.

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # למלא לפי הפרק הבא
npm run dev
```

בלי משתני הסביבה של Supabase, האתר עולה ומציג את לוח המקורות המאומתים (סטטי, `lib/data/verified-sources.ts`),
אבל הרשמה/כניסה, מעקב מתמשך, ולוח הניהול דורשים חיבור אמיתי.

## הקמת הסביבה

1. **Supabase** — פרויקט חדש ב-[supabase.com](https://supabase.com). ב-SQL Editor הריצו לפי הסדר:
   - `supabase/schema.sql` — טבלאות, טריגרים (יצירת פרופיל בהרשמה, סנכרון מייל/אימות), RLS.
   - `supabase/seed.sql` — עשרת הגופים המאומתים (ראו "Verified Sources" למטה).
   - ב-Authentication → URL Configuration הוסיפו את `<האתר שלכם>/auth/callback` לרשימת ה-Redirect URLs (וגם
     `http://localhost:3000/auth/callback` לפיתוח).
   - העתיקו את ה-URL, ה-anon key וה-service role key ל-`.env.local`.
   - כדי לתת למישהו הרשאת ניהול: `update profiles set is_admin = true where email = '...';`

2. **Resend** — מפתח API מ-[resend.com](https://resend.com/api-keys), דומיין מאומת לשליחה (`NOTIFICATIONS_FROM_EMAIL`).
   בלי `RESEND_API_KEY` הסריקה והאישורים עדיין עובדים, אבל שום מייל לא באמת נשלח.

3. **`CRON_SECRET`** — כל מחרוזת אקראית. אם פורסים ל-Vercel ומגדירים את המשתנה שם, Vercel Cron Jobs מוסיף אוטומטית
   כותרת `Authorization: Bearer <הערך>` לכל קריאת cron (`vercel.json` כבר מגדיר את שלושת המשימות).

## מבנה הפרויקט

```
app/                מסכי ה-SPA המקורי כראוטים אמיתיים: / (לוח), /sources (גופים), /me (אישי), /admin (ניהול)
app/api/cron/*       שלוש משימות ה-cron: scan (סריקה), reminders (תזכורת סגירה), digest (סיכום שבועי)
app/actions/         server actions (אישור/דחיית פרסום בלוח הניהול)
components/          רכיבי React (חלקם server, חלקם client לאינטראקטיביות)
lib/data/            שאילתות Supabase לכל מסך
lib/supabase/        לקוחות Supabase (browser / server / service-role)
lib/email/           תבניות מייל ושליחה דרך Resend
lib/notify.ts         לוגיקת ההתאמה בין פרסום מאושר לנרשמים (topics ∩ prefs)
scanner/              סורק המקורות: adapters/, classify.ts (סינון + ניקוד), run.ts (התזמורת), cli.ts (הרצה ידנית)
supabase/schema.sql   הסכימה + RLS
supabase/seed.sql     עשרת המקורות המאומתים
```

## הסורק

מודול לכל גוף מפרסם מאחורי ממשק `SourceAdapter` אחד (`scanner/adapters/types.ts`). כרגע קיים מתאם אחד —
**מינהל הרכש הממשלתי** (`scanner/adapters/mr-gov-il.ts`), הרווח הגדול ביותר לפי README המקורי (כל משרדי הממשלה
חוץ ממשרד הביטחון, במקום אחד).

> **הערה חשובה:** לסביבת הפיתוח שבה הפרויקט הזה נבנה אין גישת רשת ל-mr.gov.il, כך שהסלקטורים ב-`mr-gov-il.ts`
> **לא אומתו** מול ה-DOM האמיתי של האתר — הם בנויים לפי התבנית הטיפוסית של פלטפורמת ה-SAP Commerce שהאתר רץ
> עליה, אבל צריך לבדוק (וכנראה לכוונן) אותם מול העמוד החי לפני שסומכים על הסריקה. לבדיקה מהירה בלי לכתוב למסד:
> ```bash
> npm run scan:mr-gov-il -- --dry-run
> ```
> זה מדפיס כל פריט שנמצא, אם עבר את סינון מילות המפתח, ובאיזה תחומים ובאיזו ודאות הוא סווג — בלי לגעת ב-DB.
>
> הרצה אמיתית (סורקת, מסווגת, כותבת ל-Supabase, שולחת התראות): `npm run scan:mr-gov-il` (דורש
> `SUPABASE_SERVICE_ROLE_KEY`).

המשך המתווה לפי ה-README המקורי, לפי החזר על מאמץ: `pob.education.gov.il` (משרד החינוך), הרשויות הגדולות
(תל אביב, ירושלים, חיפה, גבעתיים — כל אחת עם מבנה שונה), `alefalefalef.co.il/opencal` (תערוכות ומלגות), ואז לפי
בקשות משתמשים בפועל.

הסיווג (`scanner/classify.ts`) הוא כרגע היוריסטיקה מבוססת מילות מפתח — סינון גס ואז ניקוד תחומים — ולא קריאה
בפועל למודל שפה. זו נקודת פתיחה מכוונת: מדרג האישור (`confidence ≥ 0.85` → אישור אוטומטי, מתחת → תור האישורים
בלוח הניהול) לא תלוי באיך `classify()` מחושב מבפנים, כך שהחלפתה בקריאה אמיתית ל-LLM לא דורשת לגעת בשאר הצינור.

## התראות

שלוש משימות cron (`vercel.json`):
- **`scan`** — כל 30 דקות. סורק, מסווג, כותב `tenders` חדשים, ושולח מייל מיידי לכל מי שסימן `prefs.instant`
  ותחום תואם.
- **`reminders`** — יומי. תזכורת שלושה ימים לפני `deadline_at`, למי שסימן את הגוף במעקב (`saved_sources`) והפעיל
  `prefs.closing`.
- **`digest`** — יום ראשון. סיכום שבועי למי שהפעיל `prefs.digest`.

## שקיפות

הלוח מציג רק מקורות שנבדקו ידנית מול אתר הגוף (`lib/data/verified-sources.ts`) — לגופים בלי קישור מאומת אין
כתובת מומצאת; הם מוצגים עם תג "חיפוש בפרסומי הגוף" וקישור לחיפוש. המידע המחייב (תאריכים, תקציבים) הוא תמיד זה
שמופיע במסמכי ההליך אצל הגוף המפרסם עצמו.
