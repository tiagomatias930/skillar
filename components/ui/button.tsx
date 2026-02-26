import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] disabled:pointer-events-none disabled:opacity-38 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-md active:brightness-95',
        destructive:
          'bg-destructive text-destructive-foreground hover:brightness-110 hover:shadow-md active:brightness-95',
        outline:
          'border border-[var(--md3-outline)] bg-transparent text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.12]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        tonal:
          'bg-[var(--md3-secondary-container)] text-[var(--md3-on-secondary-container)] hover:brightness-110 hover:shadow-sm active:brightness-95',
        ghost:
          'text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.12]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-4 text-xs has-[>svg]:px-3',
        lg: 'h-12 rounded-2xl px-8 text-base has-[>svg]:px-5',
        icon: 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp: any = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  )
}

export { Button, buttonVariants }
