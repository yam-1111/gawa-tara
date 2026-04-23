import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LandingPageContent } from "@/components/landing/landing-page-content"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/home")
  }

  return <LandingPageContent />
}
