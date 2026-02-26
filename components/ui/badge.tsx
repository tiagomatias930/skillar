import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:brightness-110',
        secondary:
          'border-transparent bg-[var(--md3-secondary-container)] text-[var(--md3-on-secondary-container)] [a&]:hover:brightness-110',
        destructive:
          'border-transparent bg-destructive/20 text-destructive [a&]:hover:bg-destructive/30',
        outline:
          'border-[var(--md3-outline)] text-[var(--md3-on-surface-variant)] [a&]:hover:bg-foreground/[0.08]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp: any = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...(props as any)}
    />
  )
}

export { Badge, badgeVariants }
