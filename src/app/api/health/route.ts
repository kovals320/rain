import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return "missing environment variables";
  try {
    const auth = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, cache: "no-store" });
    if (!auth.ok) return `auth status ${auth.status}`;
    // Confirms the rain data table can be read.
    const db = await fetch(`${url}/rest/v1/rain_daily?select=date&limit=1`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return db.ok ? "connected" : `database status ${db.status}`;
  } catch {
    return "unreachable";
  }
}

export async function GET() {
  const supabase = await checkSupabase();
  const ok = supabase === "connected";
  return NextResponse.json({ ok, supabase }, { status: ok ? 200 : 502 });
}
