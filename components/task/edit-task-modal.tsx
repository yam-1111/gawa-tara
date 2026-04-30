"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import { startOfDay, differenceInDays } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface EditTaskModalProps {
  task: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTaskModal({ task, open, onOpenChange, onSuccess }: EditTaskModalProps) {
  const isBacklog = React.useMemo(() => {
    if (!task?.dueDate || task.isComplete) return false
    const due = startOfDay(new Date(task.dueDate))
    const today = startOfDay(new Date())
    return due < today
  }, [task?.dueDate, task?.isComplete])

  const backlogDays = React.useMemo(() => {
    if (!isBacklog || !task?.dueDate) return 0
    const due = startOfDay(new Date(task.dueDate))
    const today = startOfDay(new Date())
    return differenceInDays(today, due)
  }, [isBacklog, task?.dueDate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        {isBacklog && (
          <div className="absolute top-4 left-4 z-50">
             <Badge variant="destructive" className="font-bold tracking-wider px-3 py-1 bg-destructive text-destructive-foreground">
               BACKLOG - {backlogDays} DAYS
             </Badge>
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
