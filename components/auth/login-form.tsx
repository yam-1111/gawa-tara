"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GoogleIcon } from "@/components/ui/google-icon"
import { TOSDialog } from "./tos"
import { getURL } from "@/lib/utils"

export function LoginForm() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getURL()}api/auth/callback`,
      },
    })
  }

  return (
    <Card className="w-full max-w-md p-10 space-y-8 text-center backdrop-blur-xl bg-card/40 shadow-2xl border-white/20 dark:border-white/10 relative z-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-heading font-bold text-primary">Welcome back</h1>
        <p className="text-muted-foreground font-body">Continue your planning journey</p>
      </div>

      <Button 
        variant="outline" 
        size="lg" 
        className="w-full h-14 text-lg border-2 hover:bg-secondary/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleLogin}
      >
        <GoogleIcon className="mr-3 size-5" />
        Continue with Google
      </Button>

      <p className="text-xs text-muted-foreground font-body">
        By continuing, you agree to Gawa Tara's{" "}
        <TOSDialog>
          <span className="underline cursor-pointer hover:text-primary transition-colors">
            terms of service and privacy policy
          </span>
        </TOSDialog>.
      </p>
    </Card>
  )
}
