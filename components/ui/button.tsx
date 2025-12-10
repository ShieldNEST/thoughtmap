import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'action'
    | 'action-outline'
    | 'card-cta'
    | 'card-cta-outline'
    | 'tab'
    | 'nav'
    | 'icon'
    | 'ghost'
    | 'link'
    | 'destructive'
  size?:
    | 'default'
    | 'sm'
    | 'lg'
    | 'action'
    | 'action-sm'
    | 'action-lg'
    | 'icon'
    | 'icon-sm'
    | 'tab'
    | 'nav'
  isActive?: boolean
  isLoading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isActive = false,
      isLoading = false,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      action: 'bg-foreground text-background hover:opacity-90 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wide',
      'action-outline': 'bg-transparent border-2 border-foreground text-foreground hover:bg-muted rounded-full font-mono text-[11px] font-semibold uppercase tracking-wide',
      'card-cta': 'bg-foreground text-background hover:opacity-90 rounded-none font-heading text-sm font-semibold px-6 py-3',
      'card-cta-outline': 'bg-transparent border-2 border-foreground text-foreground hover:bg-muted rounded-none',
      tab: isActive
        ? 'bg-[hsl(var(--accent-green))] text-white border-2 border-[hsl(var(--accent-green))] rounded-full'
        : 'bg-transparent text-muted-foreground border-2 border-muted-foreground hover:border-foreground hover:bg-muted/50 rounded-full',
      nav: isActive
        ? 'bg-[hsl(var(--accent-green))/0.2] border-l-4 border-l-[hsl(var(--accent-green))] text-foreground font-semibold'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      icon: 'rounded-lg',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      action: 'h-10 px-6 py-2.5',
      'action-sm': 'h-8 px-4',
      'action-lg': 'h-12 px-8',
      icon: 'h-10 w-10',
      'icon-sm': 'h-8 w-8',
      tab: 'px-4 py-2',
      nav: 'w-full px-4 py-2 text-left',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
