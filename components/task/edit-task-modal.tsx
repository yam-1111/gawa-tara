"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form"

interface EditTaskModalProps {
  task: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTaskModal({ task, open, onOpenChange, onSuccess }: EditTaskModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
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
