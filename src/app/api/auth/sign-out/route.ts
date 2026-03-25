import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://" + (process.env.VERCEL_URL ?? "localhost:3000") : "http://localhost:3000"), {
    status: 302,
  })
}
