"use client"

import * as React from "react"
import { MoreVertical, X, Minus, Check, Edit2, Trash2 } from "lucide-react"
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

  return (
    <>
      <Card className={cn(
        "group relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 min-h-[160px]",
        isUpdating && "opacity-50 pointer-events-none",
        isArchiveView && "bg-card/50 border-dashed"
      )}>
        <div className="flex justify-between items-center">
          <Badge variant={task.priority} className="font-bold tracking-wider">
            {task.priority}
          </Badge>
          
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

        <h3 className={cn(
          "text-lg font-bold font-body mt-4 flex-1",
          (task.isComplete || isArchiveView) && "line-through text-muted-foreground"
        )}>
          {task.name}
        </h3>

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
