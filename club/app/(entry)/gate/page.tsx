import { Logo } from "@/components/Logo";
import { GateForm } from "@/components/forms";
import { brand } from "@/lib/brand";

export default function GatePage() {
  return (
    <div className="space-y-10 text-center">
      <div className="space-y-3">
        <Logo size="lg" />
        <p className="font-display text-xl text-cream-2">{brand.tagline}</p>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-cream-3">מועדון פרטי. הכניסה עם סיסמה בלבד.</p>
        <GateForm />
      </div>
    </div>
  );
}
