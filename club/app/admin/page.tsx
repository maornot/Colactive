import { cookies } from "next/headers";
import { closeList, adminLogout } from "@/app/actions";
import { AdminLoginForm, OpenListForm } from "@/components/forms";
import { Logo } from "@/components/Logo";
import { Countdown } from "@/components/Countdown";
import { ADMIN_COOKIE, verify } from "@/lib/session";
import { getStore, usingSupabase } from "@/lib/store";
import { isListOpen } from "@/lib/types";

export const metadata = { title: "ניהול" };

const dateFmt = new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" });

export default async function AdminPage() {
  const isAdmin = await verify("admin", (await cookies()).get(ADMIN_COOKIE)?.value);

  if (!isAdmin) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <Logo />
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const store = getStore();
  const [list, members] = await Promise.all([store.getCurrentList(), store.listMembers()]);
  const signups = list ? await store.listSignups(list.id) : [];
  const open = list ? isListOpen(list, signups.length) : false;

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <Logo />
          <span className="text-cream-3">ניהול</span>
        </div>
        <form action={adminLogout}>
          <button className="text-sm text-cream-3 hover:text-cream">יציאה</button>
        </form>
      </header>

      {!usingSupabase && (
        <p className="rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          מצב פיתוח: הנתונים נשמרים בקובץ מקומי (.data/club.json). לפני העלאה לאוויר צריך לחבר Supabase.
        </p>
      )}

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-6">
          <h2 className="mb-5 font-display text-2xl font-bold">פתיחת רשימה חדשה</h2>
          <OpenListForm />
        </div>

        <div className="rounded-2xl border border-line p-6">
          <h2 className="mb-5 font-display text-2xl font-bold">הרשימה הנוכחית</h2>
          {!list ? (
            <p className="text-cream-2">עוד לא נפתחה רשימה.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold">{list.title}</p>
                <p className="text-sm text-cream-2">
                  {signups.length}/{list.capacity} ·{" "}
                  {open ? (
                    <>
                      פתוחה, ננעלת בעוד <Countdown until={list.closesAt} />
                    </>
                  ) : (
                    "נעולה"
                  )}
                </p>
              </div>
              {open && (
                <form action={closeList}>
                  <input type="hidden" name="listId" value={list.id} />
                  <button className="btn btn-ghost text-sm">נעילה עכשיו</button>
                </form>
              )}
              <ol className="divide-y divide-line/60 text-sm">
                {signups.map((s, i) => (
                  <li key={s.memberId} className="flex justify-between gap-3 py-2">
                    <span>
                      {i + 1}. {s.member.fullName}
                    </span>
                    <span dir="ltr" className="text-cream-2">{s.member.phone}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-2xl font-bold">חברים רשומים ({members.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-night-2 text-right text-cream-2">
              <tr>
                {["שם", "טלפון", "מייל", "אינסטגרם", "גיל", "נרשם/ה"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{m.fullName}</td>
                  <td dir="ltr" className="px-4 py-3 text-right whitespace-nowrap">{m.phone}</td>
                  <td dir="ltr" className="px-4 py-3 text-right">{m.email}</td>
                  <td dir="ltr" className="px-4 py-3 text-right">{m.instagram && `@${m.instagram}`}</td>
                  <td className="px-4 py-3">{m.age}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-cream-2">{dateFmt.format(new Date(m.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
