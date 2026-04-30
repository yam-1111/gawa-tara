"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, AlertCircle, Clock, Users, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EditTaskModal } from "@/components/task/edit-task-modal"
import { isSameDay, differenceInDays, startOfDay } from "date-fns"

export function CalendarGrid() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [tasks, setTasks] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedTask, setSelectedTask] = React.useState<Record<string, unknown> | null>(null)

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()

  // Recurrence Expansion Logic
  const getOccurrencesForDay = (dayNum: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum)
    const targetStart = startOfDay(targetDate)

    return tasks.filter(task => {
      if (!task.dueDate) return false
      if (task.isComplete || task.isDeleted) return false

      const taskStart = startOfDay(new Date(task.dueDate as string))

      if (isSameDay(taskStart, targetStart)) return true
      if (taskStart > targetStart) return false // Task hasn't started yet

      // If task has recurrence, check if it falls on targetDate
      if (task.recurrence === "WEEKLY") {
        const diff = differenceInDays(targetStart, taskStart)
        return diff % 7 === 0
      }
      if (task.recurrence === "MONTHLY") {
        return taskStart.getDate() === targetStart.getDate()
      }
      if (task.recurrence === "YEARLY") {
        return taskStart.getDate() === targetStart.getDate() && taskStart.getMonth() === targetStart.getMonth()
      }

      return false
    })
  }

  const todayStart = startOfDay(new Date())

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
        
        {isLoading ? (
           <div className="col-span-7 flex justify-center py-20 bg-background"><Loader2 className="animate-spin text-primary size-8" /></div>
        ) : (
          days.map((day) => {
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
            const dayOccurrences = getOccurrencesForDay(day)
            
            return (
              <div
                key={day}
                className={cn(
                  "bg-background min-h-[140px] p-2 hover:bg-secondary/30 transition-colors cursor-pointer group relative flex flex-col",
                  isToday && "bg-secondary/20"
                )}
              >
                <span className={cn(
                  "text-sm font-bold self-end mr-2 mt-1",
                  isToday && "text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                )}>
                  {day}
                </span>

                <div className="mt-2 space-y-1 overflow-y-auto flex-1 max-h-[100px] scrollbar-hide">
                  {dayOccurrences.map(task => {
                    const isBacklog = task.dueDate && new Date(task.dueDate as string) < todayStart && !task.isComplete
                    const priorityIcons = {
                      DO: <AlertCircle className="size-3" />,
                      SCHEDULE: <Clock className="size-3" />,
                      URGENT: <Users className="size-3" />,
                      DELETE: <Trash2 className="size-3" />
                    }

                    return (
                      <div
                        key={task.id as string}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "text-xs p-1.5 rounded-md truncate font-medium flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.02]",
                          isBacklog ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                        )}
                      >
                         {isBacklog ? <AlertTriangle className="size-3 shrink-0" /> : priorityIcons[task.priority as keyof typeof priorityIcons] || <Clock className="size-3 shrink-0" />}
                        <span className="truncate">{task.name as string}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {selectedTask && (
        <EditTaskModal
          task={selectedTask as any}
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
