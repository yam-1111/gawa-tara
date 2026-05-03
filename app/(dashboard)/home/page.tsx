"use client"

import * as React from "react"
import { LayoutGrid, List, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ProgressCircle } from "@/components/ui/progress-circle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "@/components/task/task-card"
import { HabitCard } from "@/components/task/habit-card"
import { CheckinModal } from "@/components/checkin/checkin-modal"
import { quotes } from "@/data/quotes"

const getWeekDates = () => {
  const days = [];
  const curr = new Date();

  // Return the last 5 days ending on the current day
  for (let i = 4; i >= 0; i--) {
    const d = new Date(curr);
    d.setDate(curr.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const getEmotionEmoji = (data: any) => {
  if (!data || data.energy === null) return null;
  const score = Math.round((data.energy + data.focus + (6 - data.stress)) / 3);
  if (score >= 5) return "productive.png";
  if (score >= 4) return "happy.png";
  if (score >= 3) return "neutral.png";
  if (score >= 2) return "sad.png";
  return "cry.png";
}

const LikertBar = ({ label, value }: { label: string, value: number }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="opacity-80">{label}</span>
      <span className="font-bold">{value}/5</span>
    </div>
    <div className="h-2 w-full bg-accent-foreground/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-accent-foreground rounded-full transition-all duration-500"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
)

export default function HomePage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [quote, setQuote] = React.useState<string>("")
  const [user, setUser] = React.useState<any>(null)
  const [checkinData, setCheckinData] = React.useState<any>(null)
  const [weekData, setWeekData] = React.useState<Record<string, any>>({})
  const [isCheckinModalOpen, setIsCheckinModalOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [showAllTasks, setShowAllTasks] = React.useState(false)
  const [habitsData, setHabitsData] = React.useState<any[]>([])
  const [rawTasks, setRawTasks] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])

    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]
      const weekDatesList = getWeekDates()

      try {
        const weekFetches = weekDatesList.map(d =>
          fetch(`/api/checkin?date=${d}`).then(res => res.ok ? res.json() : null)
        )

        const results = await Promise.all([
          fetch("/api/user"),
          fetch("/api/tasks"),
          fetch("/api/habits"),
          ...weekFetches
        ])

        const userRes = results[0] as Response
        const tasksRes = results[1] as Response
        const habitsRes = results[2] as Response
        const weekResults = results.slice(3)

        if (userRes.status === 401 || tasksRes.status === 401) {
          setIsLoading(false)
          return
        }

        if (!userRes.ok || !tasksRes.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const userData = await userRes.json()
        const tasksData = await tasksRes.json()
        const habitsDataRes = await habitsRes.json()

        const newWeekData: Record<string, any> = {}
        weekDatesList.forEach((date, i) => {
          newWeekData[date] = weekResults[i]
        })
        setWeekData(newWeekData)

        const todayCheckin = newWeekData[today]
        if (todayCheckin) {
          setCheckinData(todayCheckin)
          if (todayCheckin.energy === null) setIsCheckinModalOpen(true)
        } else {
          setIsCheckinModalOpen(true)
        }

        setUser(userData)
        setRawTasks(Array.isArray(tasksData) ? tasksData : [])
        setHabitsData(Array.isArray(habitsDataRes) ? habitsDataRes : [])
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
      const [tasksRes, habitsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/habits")
      ])
      const tasksData = await tasksRes.json()
      const habitsDataRes = await habitsRes.json()
      setRawTasks(Array.isArray(tasksData) ? tasksData : [])
      setHabitsData(Array.isArray(habitsDataRes) ? habitsDataRes : [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCheckinComplete = (data: any) => {
    const today = new Date().toISOString().split('T')[0]
    const dateUpdated = selectedDate || today

    if (dateUpdated === today) {
      setCheckinData(data)
    }

    setWeekData(prev => ({
      ...prev,
      [dateUpdated]: data
    }))
    setIsCheckinModalOpen(false)
    setSelectedDate(null)
  }

  const today = new Date().toDateString()

  // Filter active tasks
  let habitTasks = rawTasks.filter(t => !t.isDeleted && t.recurrence !== "NONE")
  let activeTasks = rawTasks.filter(t => !t.isComplete && !t.isDeleted && t.recurrence === "NONE")


  // Filter DO task only to count for Critical Tasks Progress
  const totalCriticalTasks = activeTasks.filter(t => t.priority === "DO").length + rawTasks.filter(t => t.priority === "DO" && t.isComplete && !t.isDeleted && t.recurrence === "NONE").length;
  const completedCriticalTasks = rawTasks.filter(t => t.priority === "DO" && t.isComplete && !t.isDeleted && t.recurrence === "NONE").length;

  // Apply adaptation layer logic based on checkin data
  let mode = "normal"
  if (checkinData && checkinData.energy !== null) {
    if (checkinData.stress >= 4) {
      mode = "stress"
      if (!showAllTasks) activeTasks = activeTasks.filter(t => t.priority === "DO")
    } else if (checkinData.energy <= 2 || checkinData.focus <= 2) {
      mode = "reduced"
      if (!showAllTasks) activeTasks = activeTasks.filter(t => t.priority === "DO" || t.priority === "DELEGATE")
    } else if (checkinData.energy >= 4 && checkinData.focus >= 4) {
      mode = "full"
    }
  }

  // Backlog and Prioritization Engine
  const priorityScore = {
    DO: 3,
    SCHEDULE: 2,
    DELEGATE: 1,
    DELETE: 0
  }

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))

  activeTasks.sort((a, b) => {
    const aIsBacklog = a.dueDate && new Date(a.dueDate) < todayStart
    const bIsBacklog = b.dueDate && new Date(b.dueDate) < todayStart

    if (aIsBacklog && !bIsBacklog) return -1
    if (!aIsBacklog && bIsBacklog) return 1

    if (aIsBacklog && bIsBacklog) {
      // sort by urgency
      const aPriority = priorityScore[a.priority as keyof typeof priorityScore] || 0
      const bPriority = priorityScore[b.priority as keyof typeof priorityScore] || 0
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      const aOverdue = todayStart.getTime() - new Date(a.dueDate).getTime()
      const bOverdue = todayStart.getTime() - new Date(b.dueDate).getTime()
      return bOverdue - aOverdue // larger duration first
    }

    return priorityScore[b.priority as keyof typeof priorityScore] - priorityScore[a.priority as keyof typeof priorityScore]
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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-primary text-primary-foreground p-10 flex flex-col md:flex-row justify-between items-center gap-6 min-h-[220px]">
          <div className="w-full">
            <h2 className="text-4xl font-heading font-bold mb-4 flex flex-wrap items-center gap-3">
              Hi {user?.username || "there"}!
              {mode === "reduced" && <Badge variant="secondary" className="text-sm bg-accent text-accent-foreground border-none shadow-none">Reduced Load</Badge>}
              {mode === "stress" && <Badge variant="destructive" className="text-sm border-none  shadow-none">Critical Tasks Only</Badge>}
              {mode === "full" && <Badge variant="secondary" className="text-sm bg-accent text-accent-foreground border-none shadow-none">Full Power</Badge>}
            </h2>
            <p className="text-xl opacity-90 italic mb-6">
              {quote ? `"${quote}"` : "..."}
            </p>

            {(mode === "reduced" || mode === "stress") && (
              <div className="w-full max-w-sm bg-primary-foreground/10 p-4 rounded-xl border border-primary-foreground/20">
                <div className="flex justify-between text-sm mb-2 opacity-90 font-bold">
                  <span>Critical Tasks Progress</span>
                  <span>{completedCriticalTasks}/{totalCriticalTasks}</span>
                </div>
                <div className="h-2 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                    style={{ width: `${totalCriticalTasks > 0 ? (completedCriticalTasks / totalCriticalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0">
            <ProgressCircle
              value={progressValue}
              size={140}
              className="text-primary-foreground"
              text={<span className="text-2xl font-sans tracking-wide">{completedToday} / {totalTasks}</span>}
            />
          </div>
        </Card>

        <Card className="bg-accent text-accent-foreground p-8 flex flex-col justify-center min-h-[220px]">
          <h3 className="font-heading text-2xl font-bold mb-6">State & Mood</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
            <div className="space-y-1 xl:border-r border-accent-foreground/20 xl:pr-6">
              {checkinData && checkinData.energy !== null ? (
                <>
                  <LikertBar label="Energy" value={checkinData.energy} />
                  <LikertBar label="Focus" value={checkinData.focus} />
                  <LikertBar label="Stress" value={checkinData.stress} />
                </>
              ) : (
                <div className="opacity-80 italic text-sm py-4">No state recorded for today.</div>
              )}
            </div>
            <div className="xl:pl-2">
              <h4 className="text-sm font-medium opacity-80 uppercase tracking-wider mb-4">5-Day Progress</h4>
              <div className="flex gap-2 justify-between xl:justify-start">
                {getWeekDates().map((dateStr) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isFuture = dateStr > todayStr;
                  const dataForDay = weekData[dateStr];
                  const emojiFile = getEmotionEmoji(dataForDay);

                  return (
                    <div
                      key={dateStr}
                      className={cn("flex flex-col items-center gap-1", !isFuture && "cursor-pointer hover:opacity-80 transition-opacity")}
                      onClick={() => {
                        if (!isFuture) {
                          setSelectedDate(dateStr)
                          setIsCheckinModalOpen(true)
                        }
                      }}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center bg-accent-foreground/5",
                        isFuture && "opacity-40 grayscale"
                      )}>
                        {!isFuture && emojiFile ? (
                          <img src={`/assets/png/emoji/${emojiFile}`} alt="mood" className="w-6 h-6 object-contain" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-accent-foreground/20" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase opacity-60">
                        {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Habits Section */}
      {habitTasks.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-heading font-bold text-primary">Your Habits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {habitTasks.map(habit => (
              <HabitCard key={habit.id} habit={habit} habitLogs={habitsData} onRefresh={handleRefresh} />
            ))}
          </div>
        </section>
      )}

      {/* Task Section Header */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-heading font-bold text-primary">Your Tasks</h3>

          <div className="flex gap-4 items-center">
            {(mode === "reduced" || mode === "stress") && (
              <Button variant="outline" size="sm" onClick={() => setShowAllTasks(!showAllTasks)}>
                {showAllTasks ? "Focus on Priorities" : "Show All Backlogs"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedDate(null)
              setIsCheckinModalOpen(true)
            }}>
              Update State
            </Button>
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
            {rawTasks.filter(t => !t.isComplete && !t.isDeleted && t.recurrence === "NONE").length > 0 ? (
              <>
                <p className="text-muted-foreground text-lg italic">
                  You have {rawTasks.filter(t => !t.isComplete && !t.isDeleted && t.recurrence === "NONE").length} backlogged tasks. Finish them up!</p>
                <Button variant="outline" className="mt-6 border-primary text-primary hover:bg-secondary" onClick={() => setShowAllTasks(!showAllTasks)}>
                  {showAllTasks ? "Hide Remaining" : "Show All Remaining Tasks"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-lg italic">No tasks found. Time to grow something new.</p>
                <Button variant="outline" className="mt-6 border-primary text-primary hover:bg-secondary" asChild>
                  <a href="/create">Create your first task</a>
                </Button>
              </>
            )}
          </Card>
        )}
      </section>

      <CheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => {
          if (checkinData?.energy !== null) {
            setIsCheckinModalOpen(false)
            setSelectedDate(null)
          }
        }}
        onComplete={handleCheckinComplete}
        date={selectedDate || undefined}
        initialData={selectedDate ? weekData[selectedDate] : undefined}
      />
    </div>
  )
}
