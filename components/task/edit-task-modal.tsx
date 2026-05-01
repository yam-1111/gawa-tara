"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Users, Trash2, AlertTriangle } from "lucide-react"

interface EditTaskModalProps {
  task: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTaskModal({ task, open, onOpenChange, onSuccess }: EditTaskModalProps) {
  const isBacklog = task && !task.isComplete && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0))
  const overdueDays = isBacklog ? Math.floor((new Date().getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Edit your task details.</DialogDescription>
        </DialogHeader>

        {task && (
          <div className="bg-card px-10 pt-10 pb-2 rounded-t-xl flex flex-col gap-2 relative">
             <div className="flex items-center gap-2 mb-2">
                {task.priority === "DO" && <AlertCircle className="w-5 h-5 text-primary" />}
                {task.priority === "SCHEDULE" && <Clock className="w-5 h-5 text-secondary-foreground" />}
                {task.priority === "DELEGATE" && <Users className="w-5 h-5 text-amber-500" />}
                {task.priority === "DELETE" && <Trash2 className="w-5 h-5 text-gray-500" />}
                <Badge variant={task.priority} className="font-bold tracking-wider w-fit">
                  {task.priority}
                </Badge>
             </div>
             {isBacklog && (
                <Badge variant="destructive" className="font-bold tracking-wider flex items-center gap-1 w-fit absolute top-10 right-10">
                  <AlertTriangle className="w-3 h-3" />
                  Backlog - {overdueDays} days
                </Badge>
             )}
          </div>
        )}

        <TaskForm 
          initialData={task} 
          onSubmitSuccess={() => {
            onSuccess()
            onOpenChange(false)
          }} 
        />
      </DialogContent>
    </Dialog>
  )
}
