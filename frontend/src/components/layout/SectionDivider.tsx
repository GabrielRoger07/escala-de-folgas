import { cn } from "@/lib/utils"

interface SectionDividerProps {
  className?: string
}

/**
 * Divisor decorativo: linha + ponto + linha.
 * Usado em cabeçalhos de página e modais.
 */
export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />
      <div className="h-1 w-1 rounded-full bg-border" />
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
