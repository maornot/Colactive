import { Logo } from "@/components/Logo";
import { JoinForm } from "@/components/forms";

export default function JoinPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <Logo />
        <h1 className="font-display text-3xl font-bold">כמעט בפנים.</h1>
        <p className="text-cream-2">הסיסמה נכונה. עוד הרשמה קצרה והאתר נפתח.</p>
      </div>
      <div className="rounded-2xl border border-line bg-night-2/60 p-5 sm:p-7">
        <JoinForm />
      </div>
    </div>
  );
}
