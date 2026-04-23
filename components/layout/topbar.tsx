"use client"

import * as React from "react"
import Link from "next/link"
import { Leaf, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent sticky top-0 z-40 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-110 transition-transform shadow-soft">
          <Leaf className="size-6" />
        </div>
        <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
          Gawa Tara?
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-secondary text-primary transition-all duration-300"
          >
            {theme === "dark" ? (
              <Sun className="size-5 transition-all" />
            ) : (
              <Moon className="size-5 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>
    </header>
  )
}
