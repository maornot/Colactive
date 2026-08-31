import { Resend } from "resend";

const FROM = process.env.NOTIFICATIONS_FROM_EMAIL || "התראות קולאקטייב <notifications@collactive.co.il>";

export const hasResendConfig = Boolean(process.env.RESEND_API_KEY);

let client: Resend | null = null;
function resend() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ id: string | null; error: string | null }> {
  if (!hasResendConfig) {
    return { id: null, error: "RESEND_API_KEY is not configured" };
  }
  const { data, error } = await resend().emails.send({ from: FROM, to, subject, html });
  if (error) return { id: null, error: error.message };
  return { id: data?.id ?? null, error: null };
}
