"use client"

import * as React from "react"
import { LayoutGrid, List, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ProgressCircle } from "@/components/ui/progress-circle"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/task/task-card"
import { quotes } from "@/data/quotes"
import { startOfDay } from "date-fns"

export default function HomePage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [quote, setQuote] = React.useState<string>("")
  const [user, setUser] = React.useState<any>(null)
  const [checkinData, setCheckinData] = React.useState<any>(null)
  const [rawTasks, setRawTasks] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
    
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]

      try {
        const [userRes, tasksRes, checkinRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/tasks"),
          fetch(`/api/checkin?date=${today}`)
        ])

        if (userRes.status === 401 || tasksRes.status === 401) {
          setIsLoading(false)
          return
        }

        if (!userRes.ok || !tasksRes.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const userData = await userRes.json()
        const tasksData = await tasksRes.json()

        if (checkinRes.ok) {
          const checkin = await checkinRes.json()
          setCheckinData(checkin)
        }

        setUser(userData)
        setRawTasks(Array.isArray(tasksData) ? tasksData : [])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setRawTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const today = new Date().toDateString()
  
  // Filter active tasks
  const todayStart = startOfDay(new Date())
  const allActive = rawTasks.filter(t => !t.isComplete && !t.isDeleted)

  let activeTasks = [...allActive]

  // Apply adaptation layer logic based on checkin data
  let mode = "normal"
  if (checkinData && checkinData.energy !== null) {
    if (checkinData.stress >= 4) {
      // Stress >= 4: prioritize DO tasks only, hide non-critical
      activeTasks = activeTasks.filter(t => t.priority === "DO" || (t.dueDate && startOfDay(new Date(t.dueDate)) < todayStart)) // also keep backlog
      mode = "stress"
    } else if (checkinData.energy <= 2 || checkinData.focus <= 2) {
      // Energy/Focus <= 2: Reduced Load Mode (top priority items only)
      activeTasks = activeTasks.filter(t => t.priority === "DO" || t.priority === "URGENT" || (t.dueDate && startOfDay(new Date(t.dueDate)) < todayStart))
      mode = "reduced"
    } else if (checkinData.energy >= 4 && checkinData.focus >= 4) {
      // Full Mode
      mode = "full"
    }
  }

  // Workload Reduction & Prioritization Engine Sorting
  activeTasks.sort((a, b) => {
    const aStart = a.dueDate ? startOfDay(new Date(a.dueDate)) : null
    const bStart = b.dueDate ? startOfDay(new Date(b.dueDate)) : null

    const isABacklog = aStart && aStart < todayStart
    const isBBacklog = bStart && bStart < todayStart

    // Priority 1: Backlog Tasks Highest Priority
    if (isABacklog && !isBBacklog) return -1
    if (!isABacklog && isBBacklog) return 1

    // If both are backlog, sort by overdue duration (oldest first)
    if (isABacklog && isBBacklog) {
      return aStart!.getTime() - bStart!.getTime()
    }

    // Priority Order Mapping
    const priorityWeight: Record<string, number> = {
      DO: 4,
      SCHEDULE: 3,
      URGENT: 2, // Treated as DELEGATE according to prompt mapping
      DELETE: 1
    }

    // Normal Sorting Logic
    const weightA = priorityWeight[a.priority] || 0
    const weightB = priorityWeight[b.priority] || 0

    if (weightA !== weightB) return weightB - weightA

    // Fallback: sort by nearest due date
    if (aStart && bStart) {
        return aStart.getTime() - bStart.getTime()
    }

    return 0
  })
  
  // Completed tasks TODAY
  const completedToday = rawTasks.filter(t => 
    t.isComplete && 
    new Date(t.updatedAt).toDateString() === today
  ).length

  // Total tasks for progress = active + completed today
  const totalTasks = activeTasks.length + completedToday
  const progressValue = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0
  
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin size-10 text-primary" />
    </div>
  )

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Bento Header Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-primary text-primary-foreground p-10 flex flex-col justify-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Hi {user?.username || "there"}!
            {mode === "reduced" && <span className="ml-2 text-xl font-normal opacity-80">(Reduced Load Mode)</span>}
            {mode === "stress" && <span className="ml-2 text-xl font-normal opacity-80">(Critical Tasks Only)</span>}
            {mode === "full" && <span className="ml-2 text-xl font-normal opacity-80">(Full Power Mode)</span>}
          </h2>
          <p className="text-xl opacity-90 italic">
            {quote ? `"${quote}"` : "..."}
          </p>
        </Card>

        <Card className="bg-accent text-accent-foreground p-10 flex flex-col items-center justify-center">
          <ProgressCircle value={progressValue} size={140} strokeWidth={10} />
          <p className="mt-4 font-heading text-lg font-medium">
            {completedToday} / {totalTasks} Tasks Done
          </p>
        </Card>
      </section>

      {/* Task Section Header */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-heading font-bold text-primary">Your Tasks</h3>

          <div className="flex gap-4 items-center">
            <div className="flex bg-secondary p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="size-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("list")}
              >
                <List className="size-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Task Bento Grid / List */}
        {activeTasks.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} onRefresh={handleRefresh} />
            ))}
          </div>
        ) : (
          <Card className="p-20 flex flex-col items-center justify-center bg-muted/20 border-dashed border-2">
            <p className="text-muted-foreground text-lg italic">No tasks found. Time to grow something new.</p>
            <Button variant="outline" className="mt-6 border-primary text-primary hover:bg-secondary" asChild>
              <a href="/create">Create your first task</a>
            </Button>
          </Card>
        )}
      </section>
    </div>
  )
}
