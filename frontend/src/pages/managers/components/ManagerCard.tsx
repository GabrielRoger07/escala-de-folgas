import { Mail, UserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CardActions } from "@/components/shared/CardActions"
import { cn, ANIMATION_DELAYS } from "@/lib/utils"
import type { Manager } from "@/types/database"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ManagerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Separator className="mb-4" />
      <Skeleton className="h-4 w-48" />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface ManagerCardProps {
  manager: Manager
  index: number
  onDelete: (manager: Manager) => void
}

export function ManagerCard({ manager, index, onDelete }: ManagerCardProps) {
  return (
    <div
      className={cn(
        "group animate-fade-up relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        ANIMATION_DELAYS[index % ANIMATION_DELAYS.length]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:border-primary/30 group-hover:bg-primary/15">
            <UserRound size={18} className="text-primary" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {manager.nome}
          </h3>
        </div>

        <CardActions onDelete={() => onDelete(manager)} />
      </div>

      <Separator />

      {/* Email */}
      <div className="flex items-center gap-2">
        <Mail size={13} className="text-muted-foreground/60" strokeWidth={1.75} />
        <span className="text-[0.6875rem] text-muted-foreground/60">{manager.email}</span>
      </div>
    </div>
  )
}
