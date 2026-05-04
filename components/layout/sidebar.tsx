"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Home, Calendar, Settings, Archive, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Since DropdownMenu wasn't created yet, I'll create it inline or just create the file first.
// I'll create the dropdown-menu component file before this or use a placeholder.
// Better create it first.

import { createClient } from "@/lib/supabase/client"

const navItems = [
  { icon: Plus, label: "Create Task", href: "/create" },
  { icon: Home, label: "Home", href: "/home" },
  { icon: Calendar, label: "Planner", href: "/planner" },
]


export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const supabase = createClient()

  React.useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (res.status === 401) return null
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data) setUser(data)
      })
      .catch((err) => console.error("Sidebar user fetch error:", err))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-20 flex flex-col items-center justify-between py-8 bg-card rounded-layout shadow-soft z-50 border border-border">
      <div className="flex flex-col items-center gap-8">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300 group",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  )}
                >
                  <item.icon className="size-6 group-hover:scale-110 transition-transform" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none transition-transform hover:scale-105 active:scale-95">
              <Avatar className="size-12 border-2 border-transparent hover:border-accent transition-colors">
                <AvatarImage src={user?.userPicture || ""} />
                <AvatarFallback className="bg-secondary text-primary uppercase">
                  {user?.username?.[0] || <User className="size-6" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 ml-2 backdrop-blur-md bg-card/80">
            <DropdownMenuLabel className="font-heading flex flex-col">
              <span className="text-sm font-bold">{user?.username || "Loading..."}</span>
              <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/archives" className="cursor-pointer">
                <Archive className="mr-2 h-4 w-4" />
                <span>Task Archives</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>User Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

