import * as React from "react"
import { TaskForm } from "@/components/task/task-form"

export default function CreateTaskPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-heading font-bold text-primary">Plant a New Task</h2>
        <p className="text-muted-foreground italic">Add a task to your daily garden.</p>
      </div>
      
      <TaskForm />
    </div>
  )
}
