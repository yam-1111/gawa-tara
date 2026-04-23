"use client"

import * as React from "react"
import { Archive, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/task/task-card"
import { format } from "date-fns"

export default function ArchivesPage() {
  const [tasks, setTasks] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      // Show tasks that are completed OR deleted
      setTasks(Array.isArray(data) ? data.filter((t: any) => t.isComplete || t.isDeleted) : [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Group by date (using updatedAt for archives)
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = format(new Date(task.updatedAt), "MMMM d, yyyy")
    if (!acc[date]) acc[date] = []
    acc[date].push(task)
    return acc
  }, {} as Record<string, any[]>)

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin size-10 text-primary" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Archive className="size-10 text-primary" />
        <h2 className="text-4xl font-heading font-bold text-primary">Task Archives</h2>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-10">
          {Object.entries(groupedTasks).map(([date, tasks]) => (
            <section key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isArchiveView 
                    onRefresh={fetchData} 
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="p-20 flex flex-col items-center justify-center bg-muted/20 border-dashed border-2">
          <p className="text-muted-foreground text-lg italic">No archived tasks yet. Your garden is clean.</p>
        </Card>
      )}
    </div>
  )
}
