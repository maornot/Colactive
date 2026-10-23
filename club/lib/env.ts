const isProd = process.env.NODE_ENV === "production";

// Dev gets working defaults so `npm run dev` runs with no setup; production
// refuses to start a request without real values.
function read(name: string, devDefault: string) {
  const value = process.env[name];
  if (value) return value;
  if (isProd) throw new Error(`Missing environment variable ${name}`);
  return devDefault;
}

export const env = {
  get sitePassword() {
    return read("SITE_PASSWORD", "club");
  },
  get adminPassword() {
    return read("ADMIN_PASSWORD", "admin");
  },
  get sessionSecret() {
    return read("SESSION_SECRET", "dev-only-secret-change-me");
  },
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
