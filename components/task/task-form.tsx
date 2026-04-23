"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Tag as TagIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const priorities = ["DO", "SCHEDULE", "URGENT", "DELETE"] as const
const recurrences = ["NONE", "WEEKLY", "MONTHLY", "YEARLY"] as const

interface TaskFormProps {
  initialData?: {
    id: string
    name: string
    description?: string | null
    priority: "DO" | "SCHEDULE" | "URGENT" | "DELETE"
    recurrence: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY"
    duration: number
    dueDate?: string | null
  }
  onSubmitSuccess?: () => void
}

export function TaskForm({ initialData, onSubmitSuccess }: TaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Form State
  const [name, setName] = React.useState(initialData?.name || "")
  const [description, setDescription] = React.useState(initialData?.description || "")
  const [priority, setPriority] = React.useState<typeof priorities[number]>(initialData?.priority || "SCHEDULE")
  const [recurrence, setRecurrence] = React.useState<typeof recurrences[number]>(initialData?.recurrence || "NONE")
  const [duration, setDuration] = React.useState(initialData?.duration || 60) // minutes
  const [dueDate, setDueDate] = React.useState(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsSubmitting(true)
    try {
      const url = initialData ? `/api/tasks/${initialData.id}` : "/api/tasks"
      const method = initialData ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        body: JSON.stringify({
          name,
          description,
          priority,
          recurrence,
          duration: Number(duration),
          dueDate: dueDate || null,
        }),
      })

      if (res.ok) {
        if (onSubmitSuccess) {
          onSubmitSuccess()
        } else {
          router.push("/home")
          router.refresh()
        }
      } else {
        const err = await res.json()
        alert(err.error || `Failed to ${initialData ? 'update' : 'create'} task`)
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card className={cn(
        "mx-auto p-10 space-y-8 bg-card shadow-soft border-border/50",
        !initialData && "max-w-3xl"
      )}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Task Name
          </label>
          <Input 
            placeholder="What needs to be done?" 
            className="text-lg h-14" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea 
            className="w-full min-h-[120px] rounded-lg border border-input bg-input p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Priority Level
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" type="button" className="w-full justify-between h-12 border-2">
                  <Badge variant={priority}>{priority}</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                <DropdownMenuRadioGroup value={priority} onValueChange={(v) => setPriority(v as any)}>
                  {priorities.map((p) => (
                    <DropdownMenuRadioItem key={p} value={p}>
                      {p}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recurrence
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" type="button" className="w-full justify-between h-12 border-2">
                  <span>{recurrence}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                <DropdownMenuRadioGroup value={recurrence} onValueChange={(v) => setRecurrence(v as any)}>
                  {recurrences.map((r) => (
                    <DropdownMenuRadioItem key={r} value={r}>
                      {r}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Duration (minutes)
            </label>
            <Input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="h-12 border-2" 
              min={15}
              step={15}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Due Date (Optional)
            </label>
            <Input 
              type="date" 
              className="h-12 border-2" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          {!initialData && (
            <Button 
              type="button"
              variant="outline" 
              size="lg" 
              className="flex-1 border-primary text-primary hover:bg-secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            variant="default" 
            size="lg" 
            className="flex-1 shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 animate-spin h-4 w-4" />}
            {initialData ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </Card>
    </form>
  )
}
