import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Check } from "lucide-react"
import { EditTaskModal } from "./edit-task-modal"
import { checkHabitValidity } from "@/lib/date"
import { format } from "date-fns"

export function HabitCard({ habit, habitLogs, onRefresh }: { habit: any, habitLogs: any[], onRefresh: () => void }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const isDaily = habit.recurrence === "DAILY"
  
  const toggleHabit = async (date: string, currentStatus: boolean) => {
    const validity = checkHabitValidity(habit, date)
    
    if (!validity.valid) {
      alert(validity.message)
      return
    }

    try {
      if (currentStatus) {
        await fetch("/api/habits", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: habit.id, date }),
        })
      } else {
        await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: habit.id, date, status: "DONE" }),
        })
      }
      onRefresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await fetch(`/api/tasks/${habit.id}`, { method: "DELETE" })
        onRefresh()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const getPeriods = () => {
    const now = new Date()
    const periods = []
    
    switch (habit.recurrence) {
      case "DAILY":
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          periods.push(format(d, "yyyy-MM-dd"));
        }
        break;
      case "WEEKLY":
        // Using date-fns subWeeks would be better, but let's do it simply
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - (i * 7));
          periods.push(format(d, "yyyy-'W'II"));
        }
        break;
      case "MONTHLY":
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          periods.push(format(d, "yyyy-MM"));
        }
        break;
      case "YEARLY":
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getFullYear() - i, 0, 1);
          periods.push(format(d, "yyyy"));
        }
        break;
      default:
        periods.push(format(now, "yyyy-MM-dd"));
    }
    return periods
  }

  const periods = getPeriods();

  return (
    <Card className="p-6 flex flex-col gap-4 bg-card border-none shadow-soft rounded-lg relative group transition-all hover:shadow-lg">
      {/* Top Section: Badges and Menu */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-bold border-primary/20 text-primary">
            {habit.recurrence}
          </Badge>
          <Badge variant={habit.priority as any} className="uppercase tracking-widest text-[10px] font-bold">
            {habit.priority}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/10 rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border/10">
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer text-primary">
              Edit Habit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
              Delete Habit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Section: Name and Description */}
      <div className="mt-1">
        <h4 className="font-heading font-bold text-xl text-primary leading-tight">{habit.name}</h4>
        {habit.description && (
          <p className="text-sm font-body text-primary/70 mt-1 line-clamp-2 leading-relaxed">
            {habit.description}
          </p>
        )}
      </div>

      {/* Progress Section */}
      <div className="flex gap-3 justify-between mt-2">
        {periods.map(period => {
          const log = habitLogs.find(l => l.taskId === habit.id && l.date === period);
          const isDone = !!log && log.status === "DONE";
          
          let label = ""
          let isCurrent = false
          const now = new Date()
          
          if (habit.recurrence === "DAILY") {
            label = format(new Date(period), "EEE")
            isCurrent = period === format(now, "yyyy-MM-dd")
          } else if (habit.recurrence === "WEEKLY") {
            const currentWeek = format(now, "yyyy-'W'II")
            isCurrent = period === currentWeek
            label = isCurrent ? "NOW" : period.split('-W')[1]
          } else if (habit.recurrence === "MONTHLY") {
            const currentMonth = format(now, "yyyy-MM")
            isCurrent = period === currentMonth
            label = isCurrent ? "NOW" : format(new Date(period + "-01"), "MMM")
          } else if (habit.recurrence === "YEARLY") {
            const currentYear = format(now, "yyyy")
            isCurrent = period === currentYear
            label = isCurrent ? "NOW" : period.slice(-2)
          }

          return (
            <div key={period} className="flex flex-col items-center gap-2 flex-1">
              <button
                onClick={() => toggleHabit(period, isDone)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-sm",
                  isDone 
                    ? "bg-primary text-primary-foreground shadow-primary/20" 
                    : isCurrent
                      ? "bg-accent/10 border-2 border-dashed border-accent/30 hover:border-accent hover:bg-accent/20"
                      : "bg-muted/50 hover:bg-muted"
                )}
              >
                {isDone && <Check className="w-6 h-6 stroke-[3]" />}
              </button>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tighter transition-opacity",
                isCurrent ? "text-accent" : "text-primary/40"
              )}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <EditTaskModal 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        task={habit} 
        onSuccess={onRefresh} 
      />
    </Card>
  )
}
