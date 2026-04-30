"use client"

import * as React from "react"
import { MoreVertical, X, Minus, Check, Edit2, Trash2, AlertCircle, Clock, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EditTaskModal } from "./edit-task-modal"
import { startOfDay, differenceInDays } from "date-fns"

interface TaskCardProps {
  task: {
    id: string
    name: string
    description?: string | null
    priority: "DO" | "SCHEDULE" | "URGENT" | "DELETE"
    recurrence: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY"
    duration: number
    dueDate?: string | null
    isComplete: boolean
    isDeleted: boolean
  }
  onRefresh?: () => void
  isArchiveView?: boolean
}

export function TaskCard({ task, onRefresh, isArchiveView }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleUpdate = async (data: any) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      })
      if (res.ok && onRefresh) onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this task?")) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE"
      })
      if (res.ok && onRefresh) onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSnooze = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    handleUpdate({ dueDate: tomorrow.toISOString() })
  }

  // Backlog Logic
  const isBacklog = React.useMemo(() => {
    if (!task.dueDate || task.isComplete) return false
    const due = startOfDay(new Date(task.dueDate))
    const today = startOfDay(new Date())
    return due < today
  }, [task.dueDate, task.isComplete])

  const backlogDays = React.useMemo(() => {
    if (!isBacklog || !task.dueDate) return 0
    const due = startOfDay(new Date(task.dueDate))
    const today = startOfDay(new Date())
    return differenceInDays(today, due)
  }, [isBacklog, task.dueDate])

  // Iconography Mapping
  const PriorityIcon = React.useMemo(() => {
    if (isBacklog) return AlertTriangle
    if (task.priority === "DO") return AlertCircle
    if (task.priority === "SCHEDULE") return Clock
    if (task.priority === "URGENT") return Users
    if (task.priority === "DELETE") return Trash2
    return Clock
  }, [isBacklog, task.priority])

  return (
    <>
      <Card className={cn(
        "group relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 min-h-[160px]",
        isUpdating && "opacity-50 pointer-events-none",
        isArchiveView && "bg-card/50 border-dashed",
        isBacklog && "border-destructive/50 shadow-destructive/10"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Badge variant={isBacklog ? "destructive" : task.priority as any} className="font-bold tracking-wider">
              {isBacklog ? `BACKLOG - ${backlogDays} DAYS` : task.priority}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isArchiveView ? (
                <>
                  <DropdownMenuItem onClick={() => handleUpdate({ isComplete: false, isDeleted: false })}>
                    <Check className="mr-2 h-4 w-4" />
                    <span>Restore</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Permanently</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2 items-start mt-4 flex-1">
          <PriorityIcon className={cn("mt-1 shrink-0 size-5", isBacklog ? "text-destructive" : "text-muted-foreground")} />
          <h3 className={cn(
            "text-lg font-bold font-body",
            (task.isComplete || isArchiveView) && "line-through text-muted-foreground"
          )}>
            {task.name}
          </h3>
        </div>

        {!isArchiveView && (
          <div className="flex justify-end gap-2 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-full border-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    onClick={handleSnooze}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Did Not Do / Move Tomorrow</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-full border-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                    onClick={handleSnooze}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snooze / Move Tomorrow</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={task.isComplete ? "default" : "outline"} 
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-full",
                      !task.isComplete && "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => handleUpdate({ isComplete: !task.isComplete })}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{task.isComplete ? "Mark Uncomplete" : "Complete"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </Card>

      <EditTaskModal 
        task={task} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        onSuccess={() => onRefresh && onRefresh()} 
      />
    </>
  )
}
