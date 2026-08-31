// כתובות שנבדקו מול המקור באוגוסט 2026. ראו README, "Verified Sources".
// זהו מקור האמת היחיד לרשימת הגופים המאומתים — supabase/seed.sql משוכפל ממנו.

export interface Hub {
  name: string;
  url: string;
  note: string;
}

export interface DirectoryItem {
  name: string;
  url?: string;
  via?: string | null;
}

export interface DirectoryGroup {
  group: string;
  items: DirectoryItem[];
}

export interface VerifiedSource {
  body: string;
  initials: string;
  kind: string;
  cat: string;
  title: string;
  note: string;
  tags: string[];
  url: string;
}

const MR = "https://mr.gov.il/ilgstorefront/he/search/?s=TENDER";
export const FALLBACK_SEARCH = MR;

export const HUBS: Hub[] = [
  {
    name: "מינהל הרכש הממשלתי",
    url: "https://mr.gov.il/ilgstorefront/he/search/?s=TENDER",
    note: "כל מכרזי משרדי הממשלה למעט משרד הביטחון — למעלה מ-21,000 פרסומים",
  },
  {
    name: "קולות קוראים של משרד החינוך",
    url: "https://pob.education.gov.il/kolotkorim/kolkore/",
    note: "רשימת הקולות הקוראים של המשרד, כולל תבחינים ונספחים",
  },
  {
    name: "מועצת הפיס לתרבות ואמנות",
    url: "https://culture.pais.co.il/",
    note: "קולות קוראים בתחומי התרבות, האמנות והיצירה",
  },
  {
    name: "סחר אלקטרוני — משרד הביטחון",
    url: "https://www.online.mod.gov.il/Online2016/Pages/General/Balam/BalamList.aspx?Reset=1",
    note: "מכרזי משרד הביטחון, שאינם מפורסמים דרך מינהל הרכש",
  },
  {
    name: "פורטל הספקים הממשלתי",
    url: "https://govextra.gov.il/sigma/suppliers/home/",
    note: "רישום כספק מוכר לממשלה — תנאי מקדים בהליכים רבים",
  },
];

export const DIRECTORY: DirectoryGroup[] = [
  {
    group: "משרדי ממשלה וגופים ממלכתיים",
    items: [
      { name: "משרד התרבות והספורט", url: MR, via: "מינהל הרכש" },
      { name: "משרד החינוך", url: "https://pob.education.gov.il/kolotkorim/kolkore/", via: "עמוד קולות קוראים" },
      { name: "משרד הבריאות", url: MR, via: "מינהל הרכש" },
      { name: "משרד התחבורה והבטיחות בדרכים", url: MR, via: "מינהל הרכש" },
      { name: "משרד המשפטים", url: MR, via: "מינהל הרכש" },
      { name: "משרד החקלאות וביטחון המזון", url: MR, via: "מינהל הרכש" },
      { name: "משרד ראש הממשלה", url: MR, via: "מינהל הרכש" },
      {
        name: "משרד הביטחון",
        url: "https://www.online.mod.gov.il/Online2016/Pages/General/Balam/BalamList.aspx?Reset=1",
        via: "סחר אלקטרוני",
      },
      { name: "רשות הטבע והגנים", url: "https://www.parks.org.il/tenders/", via: "עמוד מכרזים" },
      {
        name: "הרשות לפיתוח ירושלים",
        url: "https://www.jda.gov.il/%D7%9E%D7%9B%D7%A8%D7%96%D7%99%D7%9D/",
        via: "עמוד מכרזים",
      },
    ],
  },
  {
    group: "רשויות מקומיות",
    items: [
      { name: "עיריית ירושלים", url: "https://www.jerusalem.muni.il/he/city/tenders/", via: "עמוד מכרזים" },
      {
        name: "עיריית תל אביב-יפו",
        url: "https://www.tel-aviv.gov.il/Transparency/Pages/Bids.aspx",
        via: "ועדת מכרזים",
      },
      { name: "עיריית חיפה", url: "https://www2.haifa.muni.il/Michrazim/Default.aspx", via: "מערכת מכרזים" },
      { name: "עיריית באר שבע", via: null },
      { name: "עיריית ראשון לציון", via: null },
      { name: "עיריית פתח תקווה", via: null },
      { name: "עיריית נתניה", via: null },
      { name: "עיריית אשדוד", via: null },
      { name: "עיריית רמת גן", via: null },
      { name: "עיריית חולון", via: null },
      { name: "עיריית רחובות", via: null },
      { name: "עיריית כפר סבא", via: null },
      { name: "עיריית הרצליה", via: null },
      { name: "עיריית מודיעין-מכבים-רעות", via: null },
      { name: "עיריית עכו", via: null },
      { name: "עיריית נצרת", via: null },
      { name: "עיריית אילת", via: null },
      { name: "עיריית טבריה", via: null },
    ],
  },
  {
    group: "עמותות, קרנות ומועצות ציבוריות",
    items: [
      { name: "מועצת הפיס לתרבות ואמנות", url: "https://culture.pais.co.il/", via: "קולות קוראים" },
      { name: "מפעל הפיס", via: null },
      { name: "מרכז השלטון המקומי", via: null },
      { name: "מוזיאון ישראל", via: null },
      { name: "רשות החדשנות", via: null },
      { name: "הקרן לעידוד הקולנוע הישראלי", via: null },
      { name: "מועצת הספרייה הלאומית", via: null },
    ],
  },
];

// כל רשומה כאן היא עמוד פרסומים אמיתי שנבדק מול המקור, אוגוסט 2026.
// אין תאריכים או תקציבים מומצאים — המידע המחייב נמצא בעמוד עצמו.
export const REAL: VerifiedSource[] = [
  {
    body: "מינהל הרכש הממשלתי",
    initials: "רכ",
    kind: "פורטל מכרזים ממשלתי",
    cat: "כל התחומים",
    title: "מכרזי כל משרדי הממשלה במקום אחד",
    note: "החיפוש המרכזי של הממשלה. כל המשרדים למעט משרד הביטחון מבצעים כאן את מכרזיהם, כולל הליכי עיצוב, מיתוג, וידאו ודיגיטל.",
    tags: ["עיצוב גרפי", "אנימציה", "UX / דיגיטל", "מסגרות הסכם"],
    url: "https://mr.gov.il/ilgstorefront/he/search/?s=TENDER",
  },
  {
    body: "משרד החינוך",
    initials: "חנ",
    kind: "רשימת קולות קוראים",
    cat: "קולות קוראים",
    title: "רשימת הקולות הקוראים של משרד החינוך",
    note: 'ממוינת לפי תאריך הגשה, עם סטטוס פתוח או סגור לכל קול קורא, תבחינים ורשימת נספחים. ההגשה דרך מרכב"ה, מת"ם או דוא"ל.',
    tags: ["איור", "עיצוב גרפי", "קופי ותוכן"],
    url: "https://pob.education.gov.il/kolotkorim/kolkore/",
  },
  {
    body: "הרשות לפיתוח ירושלים",
    initials: "יר",
    kind: "עמוד מכרזים",
    cat: "עיצוב גרפי",
    title: "הזמנה להצעות למתן שירותי עיצוב גרפי",
    note: "עמוד המכרזים של הרשות, שבו מתפרסמים גם הליכי שילוט, מולטימדיה וקולות קוראים למענקים לאירועי העיר.",
    tags: ["עיצוב גרפי", "שילוט", "עיצוב תערוכה"],
    url: "https://www.jda.gov.il/%D7%9E%D7%9B%D7%A8%D7%96%D7%99%D7%9D%D7%A4%D7%A0%D7%99%D7%9E%D7%99/",
  },
  {
    body: "עיריית תל אביב-יפו",
    initials: "תא",
    kind: "קול קורא לספקים",
    cat: "מאגר ספקים",
    title: "קול קורא להיכלל במאגר הספקים העירוני",
    note: "העירייה מרעננת מעת לעת את מאגר הספקים בתחומים שונים. ניתן להגיש רק כשמופיע בעמוד קול קורא בתוקף. חלק מהליכי מכרז זוטא.",
    tags: ["עיצוב גרפי", "אנימציה", "צילום", "מסגרות הסכם"],
    url: "https://www.tel-aviv.gov.il/AuctionAndCareers/Pages/Suppliers.aspx",
  },
  {
    body: "מועצת הפיס לתרבות ואמנות",
    initials: "פי",
    kind: "קולות קוראים",
    cat: "קולות קוראים",
    title: "קולות קוראים בתחומי התרבות, האמנות והיצירה",
    note: "עמוד הקולות הקוראים של המועצה, כולל הליכים ליוצרים ולגופי תרבות.",
    tags: ["איור", "עיצוב תערוכה", "אנימציה"],
    url: "https://culture.pais.co.il/",
  },
  {
    body: "אות־אות־אות",
    initials: "אא",
    kind: "לוח קולות קוראים לעיצוב",
    cat: "קולות קוראים",
    title: "הזמנות לתערוכות, תחרויות עיצוב ומלגות",
    note: "לוח שמרכז הזמנות להשתתפות בתערוכות, תחרויות עיצוב נושאות פרסים ומלגות בעיצוב גרפי וטיפוגרפיה.",
    tags: ["עיצוב גרפי", "איור", "עיצוב תערוכה"],
    url: "https://alefalefalef.co.il/opencal/",
  },
  {
    body: "עיריית חיפה",
    initials: "חי",
    kind: "מערכת מכרזים עירונית",
    cat: "מכרזים עירוניים",
    title: "מכרזי עיריית חיפה",
    note: "מערכת המכרזים העירונית, כולל הליכי פרסום, שילוט ותוצרי דפוס לאגפי העירייה.",
    tags: ["עיצוב גרפי", "שילוט", "צילום"],
    url: "https://www2.haifa.muni.il/Michrazim/Default.aspx",
  },
  {
    body: "עיריית גבעתיים",
    initials: "גב",
    kind: "מכרזים וקולות קוראים",
    cat: "מכרזים עירוניים",
    title: "מכרזים כלליים, קול קורא ומאגר יועצים",
    note: "עמוד אחד לכל ההליכים העירוניים, כולל מאגר היועצים ומכרזי החברות הכלכליות והעמותות העירוניות.",
    tags: ["עיצוב גרפי", "קופי ותוכן", "מסגרות הסכם"],
    url: "https://www.givatayim.muni.il/bids/",
  },
  {
    body: "רשות הטבע והגנים",
    initials: "טב",
    kind: "עמוד מכרזים",
    cat: "מכרזים",
    title: "מכרזי רשות הטבע והגנים",
    note: "הליכים בתחומי שילוט פרשני, איור, מפות אוריינטציה ותוכן מבקרים לשמורות ולגנים הלאומיים.",
    tags: ["איור", "שילוט", "עיצוב תערוכה"],
    url: "https://www.parks.org.il/tenders/",
  },
  {
    body: "משרד הביטחון",
    initials: "בט",
    kind: "סחר אלקטרוני",
    cat: "מכרזים",
    title: "מכרזי משרד הביטחון",
    note: "המשרד היחיד שאינו מפרסם דרך מינהל הרכש. ההליכים מתפרסמים במערכת הסחר האלקטרוני שלו.",
    tags: ["עיצוב גרפי", "אנימציה", "UX / דיגיטל"],
    url: "https://www.online.mod.gov.il/Online2016/Pages/General/Balam/BalamList.aspx?Reset=1",
  },
];

let linksCache: Record<string, { url: string; note: string }> | null = null;

function links() {
  if (linksCache) return linksCache;
  const map: Record<string, { url: string; note: string }> = {};
  for (const source of REAL) {
    map[source.body] = { url: source.url, note: `${source.kind} — ${source.body}` };
  }
  for (const group of DIRECTORY) {
    for (const item of group.items) {
      if (item.url) {
        map[item.name] = { url: item.url, note: item.via ? `${item.via} — ${item.name}` : `עמוד המכרזים של ${item.name}` };
      }
    }
  }
  linksCache = map;
  return map;
}

export function docsFor(body: string): string {
  const entry = links()[body];
  return entry?.url ?? `https://duckduckgo.com/?q=${encodeURIComponent(body + " מכרזים קול קורא")}`;
}

export function docsNoteFor(body: string): string {
  const entry = links()[body];
  return entry?.note ?? `חיפוש בפרסומי ${body} (עמוד מכרזים ייעודי לא אומת)`;
}

export function isVerified(body: string): boolean {
  return Boolean(links()[body]);
}

export function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0];
}

const cataloguedNames = new Set<string>([
  ...REAL.map((r) => r.body),
  ...DIRECTORY.flatMap((g) => g.items.map((i) => i.name)),
]);

export const TOTAL_CATALOGUED_BODIES = cataloguedNames.size;

