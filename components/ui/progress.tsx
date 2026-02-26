import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-1 w-full overflow-hidden rounded-full bg-[var(--md3-surface-container-highest)]", className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"
export { Progress }
