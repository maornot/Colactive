"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { getStore } from "@/lib/store";
import { DEFAULT_CAPACITY } from "@/lib/types";
import {
  ADMIN_COOKIE,
  MEMBER_COOKIE,
  PASS_COOKIE,
  cookieOptions,
  safeEqual,
  sign,
  verify,
} from "@/lib/session";

export type FormState = { error?: string; message?: string } | undefined;

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function enterPassword(_: FormState, form: FormData): Promise<FormState> {
  if (!safeEqual(field(form, "password"), env.sitePassword)) return { error: "הסיסמה לא נכונה." };
  (await cookies()).set(PASS_COOKIE, await sign("pass", "ok"), cookieOptions);
  redirect("/join");
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const jar = await cookies();
  if (!(await verify("pass", jar.get(PASS_COOKIE)?.value))) redirect("/gate");

  const fullName = field(form, "fullName");
  const phone = field(form, "phone").replace(/[^\d+]/g, "");
  const email = field(form, "email").toLowerCase();
  const instagram = field(form, "instagram").replace(/^@/, "");
  const age = Number(field(form, "age"));

  if (fullName.length < 2) return { error: "צריך שם מלא." };
  if (!/^\+?\d{9,15}$/.test(phone)) return { error: "מספר הטלפון לא תקין." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "כתובת המייל לא תקינה." };
  if (!Number.isInteger(age) || age < 18 || age > 120) return { error: "הכניסה מגיל 18 בלבד." };
  if (form.get("rules") !== "on") return { error: "צריך לאשר את חוקי המועדון." };

  const member = await getStore().upsertMember({ fullName, phone, email, instagram, age });
  jar.set(MEMBER_COOKIE, await sign("member", member.id), cookieOptions);
  redirect("/");
}

async function currentMemberId() {
  return verify("member", (await cookies()).get(MEMBER_COOKIE)?.value);
}

export async function joinList(_: FormState, form: FormData): Promise<FormState> {
  const memberId = await currentMemberId();
  if (!memberId) redirect("/join");

  const store = getStore();
  if (!(await store.getMember(memberId))) {
    (await cookies()).delete(MEMBER_COOKIE);
    redirect("/join");
  }

  const result = await store.join(field(form, "listId"), memberId);
  revalidatePath("/list");
  switch (result) {
    case "ok":
    case "already":
      return { message: "את/ה ברשימה." };
    case "full":
      return { error: "הרשימה התמלאה. נתראה בפעם הבאה." };
    default:
      return { error: "הרשימה נסגרה." };
  }
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(MEMBER_COOKIE);
  jar.delete(PASS_COOKIE);
  redirect("/gate");
}

// ---- admin ----

async function requireAdmin() {
  if (!(await verify("admin", (await cookies()).get(ADMIN_COOKIE)?.value))) redirect("/admin");
}

export async function adminLogin(_: FormState, form: FormData): Promise<FormState> {
  if (!safeEqual(field(form, "password"), env.adminPassword)) return { error: "סיסמת ניהול שגויה." };
  (await cookies()).set(ADMIN_COOKIE, await sign("admin", "ok"), { ...cookieOptions, maxAge: 60 * 60 * 12 });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function openList(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const title = field(form, "title");
  const minutes = Number(field(form, "minutes"));
  const capacity = Number(field(form, "capacity") || DEFAULT_CAPACITY);

  if (!title) return { error: "צריך שם לערב." };
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 60 * 24 * 14) return { error: "משך פתיחה לא תקין." };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > DEFAULT_CAPACITY) {
    return { error: `מספר המקומות חייב להיות בין 1 ל-${DEFAULT_CAPACITY}.` };
  }

  await getStore().createList({
    title,
    details: field(form, "details"),
    eventAt: field(form, "eventAt") || null,
    closesAt: new Date(Date.now() + minutes * 60_000).toISOString(),
    capacity,
  });
  revalidatePath("/list");
  revalidatePath("/admin");
  return { message: "הרשימה נפתחה." };
}

export async function closeList(form: FormData) {
  await requireAdmin();
  await getStore().closeList(field(form, "listId"));
  revalidatePath("/list");
  revalidatePath("/admin");
}
