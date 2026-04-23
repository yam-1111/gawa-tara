import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  size?: number
  strokeWidth?: number
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  ({ value, size = 120, strokeWidth = 8, className, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            className="text-muted"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="text-primary transition-all duration-500 ease-in-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold font-heading">
          {Math.round(value)}%
        </div>
      </div>
    )
  }
)
ProgressCircle.displayName = "ProgressCircle"

export { ProgressCircle }
