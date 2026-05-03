import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function HabitCard({ habit, habitLogs, onRefresh }: { habit: any, habitLogs: any[], onRefresh: () => void }) {
  const isDaily = habit.recurrence === "DAILY"
  
  const toggleHabit = async (date: string, currentStatus: boolean) => {
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

  const getLast5Days = () => {
    const days = [];
    const curr = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(curr);
      d.setDate(curr.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }

  const getWeekPeriod = () => {
    const curr = new Date();
    // Simple week identifier (e.g., Year-Week)
    const startDate = new Date(curr.getFullYear(), 0, 1);
    const days = Math.floor((curr.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return `${curr.getFullYear()}-W${weekNumber}`;
  }

  const periods = isDaily ? getLast5Days() : [getWeekPeriod()];

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div>
        <h4 className="font-heading font-bold text-lg">{habit.name}</h4>
        {habit.description && <p className="text-sm opacity-80">{habit.description}</p>}
        <span className="text-xs uppercase tracking-wider font-bold opacity-60 bg-accent px-2 py-1 rounded mt-2 inline-block">
          {habit.recurrence}
        </span>
      </div>

      <div className="flex gap-2 justify-between">
        {periods.map(period => {
          const log = habitLogs.find(l => l.taskId === habit.id && l.date === period);
          const isDone = !!log && log.status === "DONE";
          
          return (
            <div key={period} className="flex flex-col items-center gap-1">
              <button
                onClick={() => toggleHabit(period, isDone)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isDone ? "bg-primary text-primary-foreground" : "bg-accent-foreground/5 hover:bg-accent-foreground/10"
                )}
              >
                {isDone ? "✓" : ""}
              </button>
              <span className="text-[10px] font-bold uppercase opacity-60">
                {isDaily ? new Date(period).toLocaleDateString('en-US', { weekday: 'narrow' }) : "THIS WEEK"}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
