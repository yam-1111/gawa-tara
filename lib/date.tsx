import { format, isAfter, endOfDay } from "date-fns"

/**
 * Checks if a habit log attempt for a specific period is valid.
 * @param habit The task/habit object
 * @param period The date string (YYYY-MM-DD) or period identifier (YYYY-Www, YYYY-MM)
 * @returns { valid: boolean, message?: string }
 */
export function checkHabitValidity(habit: any, period: string) {
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")
  
  // Check if habit has reached its due date (end date)
  if (habit.dueDate) {
    const endOfDue = endOfDay(new Date(habit.dueDate))
    if (isAfter(now, endOfDue)) {
      return { valid: false, message: "This habit has already ended" }
    }
  }

  if (habit.recurrence === "DAILY") {
    if (period !== todayStr) {
      return { 
        valid: false, 
        message: period > todayStr ? "Please check tomorrow" : "Please check today" 
      }
    }
  }

  if (habit.recurrence === "WEEKLY") {
    const currentWeek = format(now, "yyyy-'W'II")
    if (period !== currentWeek) {
      return { valid: false, message: "Please check this week" }
    }
  }

  if (habit.recurrence === "MONTHLY") {
    const currentMonth = format(now, "yyyy-MM")
    if (period !== currentMonth) {
      return { valid: false, message: "Please check this month" }
    }
  }

  if (habit.recurrence === "YEARLY") {
    const currentYear = format(now, "yyyy")
    if (period !== currentYear) {
      return { valid: false, message: "Please check this year" }
    }
  }

  return { valid: true }
}
