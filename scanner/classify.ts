import type { RawItem } from "./adapters/types";

// שלב 1: סינון גס במילות מפתח — פסילה מהירה של כל מה שלא שייך לעולם העיצוב.
const GROSS_KEYWORDS = [
  "עיצוב",
  "מיתוג",
  "גרפי",
  "גרפיקה",
  "אנימציה",
  "מונפש",
  "מושן",
  "וידאו",
  "סרטון",
  "איור",
  "מאייר",
  "צילום",
  "צלם",
  "קופי",
  "קופירייטינג",
  "תוכן",
  "UX",
  "UI",
  "חוויית משתמש",
  "שילוט",
  "דפוס",
  "קטלוג",
  "תערוכה",
];

// שלב 2: סיווג לתחומים ולניקוד רלוונטיות. היוריסטיקה מבוססת-מילות-מפתח כאן
// היא נקודת התחלה מכוונת — README מתאר את מדרג האישור (0.85+) שהיא מזינה;
// היא ניתנת להחלפה בקריאה למודל שפה בלי לשנות את שאר צינור הסריקה.
const TOPIC_KEYWORDS: Record<string, string[]> = {
  "עיצוב גרפי": ["עיצוב גרפי", "גרפיקה", "גרפי", "מיתוג", "דפוס", "קטלוג", "שילוט", "לוגו"],
  "אנימציה ומושן": ["אנימציה", "מונפש", "מושן", "מוצן", "וידאו", "סרטון", "הנפשה"],
  איור: ["איור", "מאייר", "מאיירת", "איורים"],
  "UX ודיגיטל": ["UX", "UI", "חוויית משתמש", "ממשק משתמש", "אפליקציה", "פורטל", "מערכת עיצוב", "דיגיטלי"],
  צילום: ["צילום", "צלם", "צלמת", "צילומים"],
  "קופי ותוכן": ["קופי", "קופירייטינג", "תוכן", "כתיבה", "עריכה לשונית"],
  "עיצוב תערוכה": ["תערוכה", "מוזיאון", "אוצרות", "תצוגה"],
};

export interface ClassifiedItem {
  topics: string[];
  confidence: number;
}

export function passesGrossFilter(item: RawItem): boolean {
  const text = `${item.title} ${item.summary ?? ""}`;
  return GROSS_KEYWORDS.some((kw) => text.includes(kw));
}

export function classify(item: RawItem): ClassifiedItem {
  const text = `${item.title} ${item.summary ?? ""}`;
  const topics: string[] = [];
  let matchedKeywordCount = 0;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const hits = keywords.filter((kw) => text.includes(kw)).length;
    if (hits > 0) {
      topics.push(topic);
      matchedKeywordCount += hits;
    }
  }

  if (item.procedureType === "מסגרת הסכם" && topics.length > 0) {
    topics.push("מסגרות הסכם");
  }

  // שני תחומים תואמים או יותר, או שלוש מילות מפתח, נחשבים ודאות גבוהה.
  const confidence = topics.length === 0 ? 0 : Math.min(1, Math.max(topics.length / 2, matchedKeywordCount / 3));

  return { topics, confidence: Math.round(confidence * 100) / 100 };
}
