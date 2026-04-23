import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Initialize user and sync avatar
      // We can call our internal sync-avatar API or do it here.
      // Since it's an internal call from a server component/route, it's safer to do it here or via a server-side fetch.
      try {
        await fetch(`${origin}/api/user/sync-avatar`, {
          method: "POST",
          headers: {
            Cookie: request.headers.get("Cookie") || ""
          }
        })
      } catch (e) {
        console.error("Failed to sync avatar on first login:", e)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
