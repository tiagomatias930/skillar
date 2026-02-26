import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-[var(--md3-outline)] flex h-12 w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-base transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-38 md:text-sm',
        'focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] focus-visible:border-2',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'hover:border-[var(--md3-on-surface)]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
