"use client"

import * as React from "react"
import { User as UserIcon, Camera, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const [user, setUser] = React.useState<any>(null)
  const [username, setUsername] = React.useState("")
  const [confirmUsername, setConfirmUsername] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user")
      const data = await res.json()
      setUser(data)
      setUsername(data.username)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUser()
  }, [])

  const handleSaveUsername = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ username })
      })
      if (res.ok) {
        alert("Username updated!")
        fetchUser()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData
      })
      if (res.ok) {
        fetchUser()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch("/api/user", { method: "DELETE" })
      if (res.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = "/login"
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin size-10 text-primary" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-4xl font-heading font-bold text-primary">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="p-8 flex flex-col items-center space-y-6">
            <div className="relative group">
              <Avatar className={cn("size-32 border-4 border-secondary shadow-soft", isUploading && "opacity-50")}>
                <AvatarImage src={user?.userPicture || ""} />
                <AvatarFallback className="bg-secondary text-primary">
                  {user?.username?.[0] || <UserIcon className="size-16" />}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold">{user?.username}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </Card>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h3 className="text-2xl font-heading font-bold text-primary border-b border-border pb-2">Profile Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input value={user?.email || ""} disabled className="h-12 bg-muted/50" />
              </div>
              <Button size="lg" className="mt-4" onClick={handleSaveUsername} disabled={isSaving || username === user?.username}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-heading font-bold text-destructive border-b border-destructive/20 pb-2">Danger Zone</h3>
            <Card className="p-6 border-destructive/20 bg-destructive/5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your tasks from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm font-medium">
                      To confirm, type <span className="font-bold">"{user?.username}"</span> below:
                    </p>
                    <Input 
                      value={confirmUsername} 
                      onChange={(e) => setConfirmUsername(e.target.value)} 
                      placeholder="Type your username"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="destructive" 
                      disabled={confirmUsername !== user?.username || isDeleting}
                      className="w-full"
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Permanently Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
