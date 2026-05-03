import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getURL } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/home"
  const origin = getURL()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      try {
        await fetch(`${origin}/api/user/sync-avatar`, {
          method: "POST",
          headers: {
            cookie: request.headers.get("cookie") || ""
          }
        })
      } catch (e) {
        console.error("Failed to sync avatar on first login:", e)
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth-failed", origin))
}