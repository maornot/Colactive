import { getListState } from "@/lib/current-list";
import { Countdown } from "@/components/Countdown";
import { JoinListForm } from "@/components/forms";

export const metadata = { title: "הרשימה" };

export default async function ListPage() {
  const state = await getListState();

  return (
    <div className="grain">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-amber">הרשימה</p>
        {!state ? (
          <Locked title="עוד לא נפתחה רשימה." text="רשימה נפתחת לזמן קצר לפני כל ערב. שווה לבדוק כאן." />
        ) : (
          <>
            <h1 className="font-display text-4xl font-black sm:text-6xl">{state.list.title}</h1>
            {state.list.eventAt && <p className="mt-3 text-xl text-cream-2">{state.list.eventAt}</p>}
            {state.list.details && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-cream-2">{state.list.details}</p>
            )}

            <Spots taken={state.count} capacity={state.list.capacity} />

            <div className="mt-10">
              {state.joined ? (
                <div className="rounded-2xl border border-ok/40 bg-ok/10 p-6">
                  <p className="font-display text-2xl font-bold text-ok">את/ה ברשימה.</p>
                  <p className="mt-2 text-cream-2">את הכתובת המדויקת נשלח לטלפון לפני הערב.</p>
                </div>
              ) : state.open ? (
                <div className="space-y-5">
                  <p className="text-cream-2">
                    הרשימה ננעלת בעוד{" "}
                    <strong className="text-2xl text-cream">
                      <Countdown until={state.list.closesAt} />
                    </strong>{" "}
                    או כשהיא מתמלאת, מה שקורה קודם.
                  </p>
                  <JoinListForm listId={state.list.id} />
                </div>
              ) : (
                <Locked
                  title="הרשימה ננעלה."
                  text={
                    state.count >= state.list.capacity
                      ? "כל המקומות נתפסו. נתראה בערב הבא."
                      : "הזמן נגמר. נתראה בערב הבא."
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Spots({ taken, capacity }: { taken: number; capacity: number }) {
  return (
    <div className="mt-10">
      <div className="mb-3 flex justify-between text-sm text-cream-2">
        <span>
          {taken} מתוך {capacity} מקומות נתפסו
        </span>
        <span>נשארו {Math.max(0, capacity - taken)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-hidden>
        {Array.from({ length: capacity }, (_, i) => (
          <span key={i} className={`size-3.5 rounded-full ${i < taken ? "bg-amber" : "border border-line"}`} />
        ))}
      </div>
    </div>
  );
}

function Locked({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-night-2/70 p-8 text-center">
      <svg viewBox="0 0 24 24" className="mx-auto mb-4 size-10 text-amber" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <p className="font-display text-3xl font-bold">{title}</p>
      <p className="mt-2 text-cream-2">{text}</p>
    </div>
  );
}
