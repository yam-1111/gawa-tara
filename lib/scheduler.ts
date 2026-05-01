import { Task, PriorityLevel, ScheduleBlock } from "@prisma/client"

const DAILY_START_HOUR = 9
const DAILY_END_HOUR = 18 // 9 hours capacity
const BUFFER_MINUTES = 15

export function generateSchedule(tasks: Task[], userId: string): Partial<ScheduleBlock>[] {
  const activeTasks = tasks
    .filter(t => !t.isDeleted && !t.isComplete && t.priority !== 'DELETE')
    .sort((a, b) => {
      // 1. Due Date ASC
      if (a.dueDate && b.dueDate) {
        if (a.dueDate.getTime() !== b.dueDate.getTime()) return a.dueDate.getTime() - b.dueDate.getTime()
      } else if (a.dueDate) return -1
      else if (b.dueDate) return 1

      // 2. Priority: DO > DELEGATE > SCHEDULE
      const priorityMap = { DO: 0, DELEGATE: 1, SCHEDULE: 2, DELETE: 3 }
      if (priorityMap[a.priority] !== priorityMap[b.priority]) {
        return priorityMap[a.priority] - priorityMap[b.priority]
      }

      // 3. Duration ASC
      return a.duration - b.duration
    })

  const blocks: Partial<ScheduleBlock>[] = []
  let currentPointer = new Date()
  currentPointer.setHours(DAILY_START_HOUR, 0, 0, 0)
  if (currentPointer < new Date()) {
    currentPointer = new Date()
    // Align to next 15-min mark
    currentPointer.setMinutes(Math.ceil(currentPointer.getMinutes() / 15) * 15, 0, 0)
  }

  const getEndOfDay = (date: Date) => {
    const end = new Date(date)
    end.setHours(DAILY_END_HOUR, 0, 0, 0)
    return end
  }

  const getStartOfNextDay = (date: Date) => {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    next.setHours(DAILY_START_HOUR, 0, 0, 0)
    return next
  }

  for (const task of activeTasks) {
    let remainingDuration = task.duration

    while (remainingDuration > 0) {
      const endOfDay = getEndOfDay(currentPointer)
      
      // If current pointer is past end of day, move to next day
      if (currentPointer >= endOfDay) {
        currentPointer = getStartOfNextDay(currentPointer)
        continue
      }

      const availableMinutesToday = (endOfDay.getTime() - currentPointer.getTime()) / 60000
      const durationToAllocate = Math.min(remainingDuration, availableMinutesToday)

      if (durationToAllocate > 0) {
        const startTime = new Date(currentPointer)
        const endTime = new Date(currentPointer.getTime() + durationToAllocate * 60000)

        blocks.push({
          taskId: task.id,
          userId,
          startTime,
          endTime,
          status: "PLANNED"
        })

        remainingDuration -= durationToAllocate
        currentPointer = new Date(endTime.getTime() + BUFFER_MINUTES * 60000)
      }

      if (remainingDuration > 0) {
        currentPointer = getStartOfNextDay(currentPointer)
      }
    }
  }

  return blocks
}

