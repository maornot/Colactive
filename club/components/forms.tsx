"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin, enterPassword, joinList, openList, register, type FormState } from "@/app/actions";
import { DEFAULT_CAPACITY } from "@/lib/types";

function Submit({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn ${className}`}>
      {pending ? "רגע..." : children}
    </button>
  );
}

function Status({ state }: { state: FormState }) {
  if (state?.error) return <p role="alert" className="text-sm text-bad">{state.error}</p>;
  if (state?.message) return <p role="status" className="text-sm text-ok">{state.message}</p>;
  return null;
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-cream-2">{text}</span>
      {children}
    </label>
  );
}

export function GateForm() {
  const [state, action] = useActionState(enterPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <input
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="off"
        placeholder="סיסמה"
        aria-label="סיסמה"
        className="field text-center text-lg tracking-[0.3em]"
      />
      <Submit className="w-full">כניסה</Submit>
      <Status state={state} />
    </form>
  );
}

export function JoinForm() {
  const [state, action] = useActionState(register, undefined);
  return (
    <form action={action} className="space-y-4">
      <Label text="שם מלא">
        <input name="fullName" required autoComplete="name" className="field" />
      </Label>
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <Label text="טלפון">
          <input name="phone" type="tel" required dir="ltr" autoComplete="tel" placeholder="050-0000000" className="field text-right" />
        </Label>
        <Label text="גיל">
          <input name="age" type="number" required min={18} max={120} inputMode="numeric" className="field" />
        </Label>
      </div>
      <Label text="מייל">
        <input name="email" type="email" required dir="ltr" autoComplete="email" className="field text-right" />
      </Label>
      <Label text="אינסטגרם (לא חובה)">
        <input name="instagram" dir="ltr" placeholder="@" className="field text-right" />
      </Label>
      <label className="flex items-start gap-3 text-sm text-cream-2">
        <input name="rules" type="checkbox" required className="mt-1 accent-amber" />
        <span>אני מעל גיל 18, מאשר/ת את חוקי המועדון ושומר/ת על הפרטיות של כולם.</span>
      </label>
      <Submit className="w-full">הרשמה ופתיחת האתר</Submit>
      <Status state={state} />
    </form>
  );
}

export function JoinListForm({ listId }: { listId: string }) {
  const [state, action] = useActionState(joinList, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listId" value={listId} />
      <Submit className="w-full py-4 text-lg sm:w-auto">שריון מקום ברשימה</Submit>
      <Status state={state} />
    </form>
  );
}

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, undefined);
  return (
    <form action={action} className="space-y-4">
      <input name="password" type="password" required autoFocus placeholder="סיסמת ניהול" aria-label="סיסמת ניהול" className="field" />
      <Submit className="w-full">כניסה לניהול</Submit>
      <Status state={state} />
    </form>
  );
}

export function OpenListForm() {
  const [state, action] = useActionState(openList, undefined);
  return (
    <form action={action} className="space-y-4">
      <Label text="שם הערב">
        <input name="title" required placeholder="שישי על הגג" className="field" />
      </Label>
      <Label text="מתי (טקסט חופשי, יוצג לחברים)">
        <input name="eventAt" placeholder="שישי 22:00, פלורנטין" className="field" />
      </Label>
      <Label text="פרטים">
        <textarea name="details" rows={3} className="field" />
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <Label text="פתוחה לכמה דקות">
          <input name="minutes" type="number" required min={1} defaultValue={60} className="field" />
        </Label>
        <Label text={`מקומות (עד ${DEFAULT_CAPACITY})`}>
          <input name="capacity" type="number" required min={1} max={DEFAULT_CAPACITY} defaultValue={DEFAULT_CAPACITY} className="field" />
        </Label>
      </div>
      <Submit>פתיחת רשימה</Submit>
      <Status state={state} />
    </form>
  );
}
