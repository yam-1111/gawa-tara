"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EditTaskModal } from "@/components/task/edit-task-modal"
import { Badge } from "@/components/ui/badge"

export function CalendarGrid() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [tasks, setTasks] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedTask, setSelectedTask] = React.useState<any>(null)

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTasks()
  }, [])
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()

  // Recurrence Logic
  const getDailyEvents = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    targetDate.setHours(0, 0, 0, 0)

    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)

      if (targetDate < taskDate) return false // Doesn't start until dueDate

      if (task.recurrence === "NONE") {
        return targetDate.getTime() === taskDate.getTime()
      }

      if (task.recurrence === "DAILY") {
        return true
      }

      if (task.recurrence === "WEEKLY") {
        return targetDate.getDay() === taskDate.getDay()
      }

      if (task.recurrence === "MONTHLY") {
        return targetDate.getDate() === taskDate.getDate()
      }

      return false
    })
  }

  if (isLoading) {
    return (
      <Card className="p-8 space-y-8 bg-card shadow-soft flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary size-10" />
      </Card>
    )
  }

  return (
    <Card className="p-8 space-y-8 bg-card shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-heading font-bold text-primary">
          {monthName} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft className="size-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-secondary p-4 text-center font-bold text-sm text-primary uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="bg-background min-h-[140px] p-4" />
        ))}
        
        {days.map((day) => {
          const dailyTasks = getDailyEvents(day)
          return (
            <div
              key={day}
              className={cn(
                "bg-background min-h-[140px] p-2 hover:bg-secondary/30 transition-colors group flex flex-col gap-1",
                day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && "bg-secondary/50"
              )}
            >
              <span className={cn(
                "text-lg font-bold px-2",
                day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && "text-primary"
              )}>
                {day}
              </span>

              <div className="mt-1 space-y-1 overflow-y-auto flex-1 no-scrollbar">
                {dailyTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={task.priority}
                      className="w-full justify-start text-xs font-normal truncate opacity-90 hover:opacity-100"
                    >
                      {task.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onSuccess={() => {
            fetchTasks()
            setSelectedTask(null)
          }}
        />
      )}
    </Card>
  )
}
