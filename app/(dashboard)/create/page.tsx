import * as React from "react"
import { TaskForm } from "@/components/task/task-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, CalendarClock, Send, Trash2, AlertTriangle } from "lucide-react"

export default function CreateTaskPage() {
  return (
    <div className="mx-auto p-10 space-y-8 bg-card shadow-soft border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl rounded-3xl mt-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-heading font-bold text-primary">Plant a New Task</h2>
        <p className="text-muted-foreground italic">Add a task to your daily garden.</p>
      </div>

      <Card className="p-6 space-y-6 rounded-2xl bg-card/60 border-border/50">
        <div>
          <h3 className="text-lg font-bold text-primary">Task Priority System</h3>
          <p className="text-sm text-muted-foreground">Classify your tasks based on required immediate action.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Zap className="w-5 h-5 mt-1 text-muted-foreground" />
            <Badge className="rounded-full text-white bg-blue-600 hover:bg-blue-700 shrink-0 min-w-[90px] justify-center">DO</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Execute immediately. High importance and urgency.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <CalendarClock className="w-5 h-5 mt-1 text-muted-foreground" />
            <Badge className="rounded-full text-white bg-violet-600 hover:bg-violet-700 shrink-0 min-w-[90px] justify-center">SCHEDULE</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Important but not urgent. Assign a future execution time.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <Send className="w-5 h-5 mt-1 text-muted-foreground" />
            <Badge className="rounded-full text-white bg-amber-500 hover:bg-amber-600 shrink-0 min-w-[90px] justify-center">DELEGATE</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Action required, but not by you. Transfer responsibility.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <Trash2 className="w-5 h-5 mt-1 text-muted-foreground" />
            <Badge className="rounded-full text-white bg-gray-500 hover:bg-gray-600 shrink-0 min-w-[90px] justify-center">DELETE</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No value. Remove to reduce cognitive load.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 mt-1 text-muted-foreground" />
            <Badge className="rounded-full text-white bg-red-600 hover:bg-red-700 shrink-0 min-w-[90px] justify-center">DEADLINE</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hard time constraint. Failure if missed.
            </p>
          </div>
        </div>
      </Card>

      <TaskForm />
    </div>
  )
}
