import * as React from "react"
import { CalendarGrid } from "@/components/planner/calendar-grid"

export default function PlannerPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-heading font-bold text-primary">Your Planner</h2>
      </div>
      
      <CalendarGrid />
    </div>
  )
}
