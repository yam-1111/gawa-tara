"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CalendarGrid() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()

  return (
    <Card className="p-8 space-y-8 bg-card shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-heading font-bold text-primary">
          {monthName} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft className="size-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-secondary p-4 text-center font-bold text-sm text-primary uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="bg-background min-h-[140px] p-4" />
        ))}
        
        {days.map((day) => (
          <div 
            key={day} 
            className={cn(
              "bg-background min-h-[140px] p-4 hover:bg-secondary/30 transition-colors cursor-pointer group",
              day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && "bg-secondary/50"
            )}
          >
            <span className={cn(
              "text-lg font-bold",
              day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && "text-primary"
            )}>
              {day}
            </span>
            
            <div className="mt-2 space-y-1">
              {/* Mock Schedule Blocks */}
              {day % 3 === 0 && (
                <div className="h-2 bg-primary/40 rounded-full w-full" />
              )}
              {day % 5 === 0 && (
                <div className="h-2 bg-accent/40 rounded-full w-3/4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
