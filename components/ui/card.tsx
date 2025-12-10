import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'institutional' | 'elevated' | 'outline'
  accent?: 'none' | 'left' | 'top' | 'header-dark'
  bracket?: 'none' | 'green' | 'purple' | 'green-round' | 'purple-round'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', accent = 'none', bracket = 'none', hover = false, ...props }, ref) => {
    const variantClasses = {
      default: 'rounded-lg',
      institutional: 'rounded-none border-2',
      elevated: 'rounded-lg shadow-lg',
      outline: 'rounded-lg border-2 bg-transparent',
    }

    const accentClasses = {
      none: '',
      left: 'border-l-4 border-l-[hsl(var(--accent-green))]',
      top: 'border-t-4 border-t-[hsl(var(--accent-green))]',
      'header-dark': 'border-t-4 border-t-[hsl(var(--muted))]',
    }

    const bracketClasses = {
      none: '',
      green: 'card-bracket-corner',
      purple: 'card-bracket-corner-purple',
      'green-round': 'card-bracket-corner-round',
      'purple-round': 'card-bracket-corner-round-purple',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card text-card-foreground',
          variantClasses[variant],
          accentClasses[accent],
          bracketClasses[bracket],
          hover && 'card-hover',
          variant === 'institutional' && 'card-institutional',
          'relative',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-heading font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

interface CardLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  comment?: boolean
}

const CardLabel = React.forwardRef<HTMLDivElement, CardLabelProps>(
  ({ className, comment = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-label font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
        comment && "text-label-comment",
        className
      )}
      {...props}
    />
  )
)
CardLabel.displayName = "CardLabel"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardLabel }
