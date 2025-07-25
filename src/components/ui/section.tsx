import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "card" | "gradient"
}

export function Section({ children, className, variant = "default", ...props }: SectionProps) {
  return (
    <section 
      className={cn(
        "py-16 px-4 sm:px-6 lg:px-8",
        variant === "card" && "bg-gradient-card shadow-card",
        variant === "gradient" && "bg-gradient-subtle",
        className
      )}
      {...props}
    >
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </section>
  )
}