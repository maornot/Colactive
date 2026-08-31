import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getLastScanLabel } from "@/lib/data/bodies";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "קולאקטייב — קולות קוראים לעולם העיצוב",
  description:
    "מאגר עצמאי וחינמי שמרכז קולות קוראים, מכרזים ומסגרות הסכם מגופים ציבוריים בישראל, מסונן לעולם העיצוב.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, lastScanLabel] = await Promise.all([getCurrentProfile(), getLastScanLabel()]);

  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} h-full`}>
      <body className="min-h-full font-sans text-ink bg-bg antialiased" style={{ paddingBottom: 90 }}>
        <AuthModalProvider>
          <Header profile={profile} lastScanLabel={lastScanLabel} />
          {children}
          <Footer />
          <AuthModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}
