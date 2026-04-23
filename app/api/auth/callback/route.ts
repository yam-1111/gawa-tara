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
      // Initialize user and sync avatar
      try {
        await fetch(`${origin}api/user/sync-avatar`, {
          method: "POST",
          headers: {
            Cookie: request.headers.get("Cookie") || ""
          }
        })
      } catch (e) {
        console.error("Failed to sync avatar on first login:", e)
      }

      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next.slice(1) : next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}login?error=auth-failed`)
}
