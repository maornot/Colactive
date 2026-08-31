export const CATS = [
  "הכל",
  "עיצוב גרפי",
  "אנימציה",
  "איור",
  "UX / דיגיטל",
  "צילום",
  "קופי ותוכן",
  "עיצוב תערוכה",
] as const;

export const TOPICS = [
  "עיצוב גרפי",
  "אנימציה ומושן",
  "איור",
  "UX ודיגיטל",
  "צילום",
  "קופי ותוכן",
  "עיצוב תערוכה",
  "מסגרות הסכם",
] as const;

export const ROLES = [
  "מעצב/ת גרפי",
  "אנימטור/ית / מושן",
  "מאייר/ת",
  "מעצב/ת UX/UI",
  "צלם/ת",
  "קופירייטר/ית",
  "סטודיו / משרד יצירתי",
] as const;

export const PROCEDURE_TYPES = [
  "קול קורא",
  "מכרז פומבי",
  "מסגרת הסכם",
  "בקשה להצעות",
] as const;

export type Category = (typeof CATS)[number];
export type Topic = (typeof TOPICS)[number];
export type Role = (typeof ROLES)[number];

export const SITE_EMAIL = "hello@collactive.co.il";

export const DEFAULT_PREFS = {
  instant: true,
  closing: true,
  digest: false,
};

export const PREF_ROWS: Array<{ key: keyof typeof DEFAULT_PREFS; label: string; note: string }> = [
  { key: "instant", label: "מייל מיידי על כל פרסום חדש", note: "נשלח תוך דקות מרגע שהפרסום נאסף" },
  { key: "closing", label: "תזכורת שלושה ימים לפני מועד ההגשה", note: "רק על הליכים שסימנתם למעקב" },
  { key: "digest", label: "סיכום שבועי ביום ראשון", note: "כל מה שהתפרסם בשבוע שעבר בתחומים שלכם" },
];
