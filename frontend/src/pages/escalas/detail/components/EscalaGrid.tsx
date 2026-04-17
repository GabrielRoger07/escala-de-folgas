import { cn } from "@/lib/utils"
import { isDiaBloqueado, toDateStr } from "../hooks/useEscalaDetail"
import type { Funcionario } from "@/types/database"
import type { EscalaDetail } from "../hooks/useEscalaDetail"

const WEEKDAY_ABBR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface EscalaGridProps {
  escala: EscalaDetail
  funcionarios: Funcionario[]
  days: Date[]
  isFolga: (funcId: string, dateStr: string) => boolean
  workingOnDay: (dateStr: string) => number
  onToggle: (funcId: string, dateStr: string) => void
}

export function EscalaGrid({
  escala,
  funcionarios,
  days,
  isFolga,
  workingOnDay,
  onToggle,
}: EscalaGridProps) {
  const isEditable = escala.status === "rascunho"
  const minimo = escala.setores.minimo_por_dia

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse" style={{ minWidth: `${140 + days.length * 40}px` }}>

        {/* ── Column header ─────────────────────────────────────────────────── */}
        <thead>
          <tr>
            <th className="sticky left-0 z-20 border-r border-border bg-card px-4 py-3 text-left">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {MONTH_NAMES[escala.mes - 1]} {escala.ano}
              </span>
            </th>
            {days.map((day) => {
              const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)
              return (
                <th
                  key={day.getDate()}
                  className={cn(
                    "w-10 border-l border-border px-0 py-2 text-center",
                    bloqueado && "bg-destructive/8",
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        "text-[0.6875rem] font-bold leading-none",
                        bloqueado ? "text-destructive/60" : "text-muted-foreground",
                      )}
                    >
                      {String(day.getDate()).padStart(2, "0")}/{String(day.getMonth())}
                    </span>
                    <span
                      className={cn(
                        "text-[0.5625rem] font-semibold uppercase leading-none tracking-wide",
                        bloqueado ? "text-destructive/40" : "text-muted-foreground/50",
                      )}
                    >
                      {WEEKDAY_ABBR[day.getDay()]}
                    </span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        {/* ── Funcionário rows ──────────────────────────────────────────────── */}
        <tbody>
          {funcionarios.map((func, rowIndex) => (
            <tr
              key={func.id}
              className={cn(
                "border-t border-border",
                rowIndex % 2 === 0 ? "bg-card" : "bg-muted/20",
              )}
            >
              {/* Name cell — sticky, solid bg + right border divider */}
              <td
                className={cn(
                  "sticky left-0 z-10 border-r border-border px-4 py-0",
                  rowIndex % 2 === 0 ? "bg-card" : "bg-[color-mix(in_srgb,var(--color-muted)_20%,var(--color-card))]",
                )}
              >
                <span
                  className="block max-w-[136px] truncate text-sm font-medium text-foreground"
                  title={func.nome_funcionario}
                >
                  {func.nome_funcionario}
                </span>
              </td>

              {/* Day cells */}
              {days.map((day) => {
                const ds = toDateStr(day)
                const folga = isFolga(func.id, ds)
                const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)
                const wouldViolate = !folga && workingOnDay(ds) <= minimo
                const canToggle = isEditable && !bloqueado && (!wouldViolate || folga)

                return (
                  <td
                    key={ds}
                    className={cn(
                      "h-10 w-10 border-l border-border p-0 text-center align-middle",
                      bloqueado && "bg-destructive/8",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onToggle(func.id, ds)}
                      disabled={!canToggle}
                      title={
                        bloqueado
                          ? "Dia bloqueado para folgas nesta escala"
                          : !isEditable
                          ? "Escala publicada — edição bloqueada"
                          : folga
                          ? "Clique para remover folga"
                          : wouldViolate
                          ? `Mínimo de ${minimo} trabalhando por dia`
                          : "Clique para marcar folga"
                      }
                      className={cn(
                        "h-full w-full transition-colors duration-100",
                        bloqueado && "cursor-not-allowed",
                        !bloqueado && folga && "bg-primary/20 hover:bg-primary/30",
                        !bloqueado && !folga && canToggle && "hover:bg-primary/10",
                        !bloqueado && !folga && !canToggle && "cursor-not-allowed opacity-40",
                        !isEditable && !bloqueado && "cursor-default",
                      )}
                    >
                      {folga && !bloqueado && (
                        <span className="flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        </span>
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>

        {/* ── Footer: working count per day ─────────────────────────────────── */}
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/30">
            <td className="sticky left-0 z-10 border-r border-border bg-[color-mix(in_srgb,var(--color-muted)_30%,var(--color-card))] px-4 py-2">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Trabalhando
              </span>
            </td>
            {days.map((day) => {
              const ds = toDateStr(day)
              const working = workingOnDay(ds)
              const bloqueado = isDiaBloqueado(day, escala.dias_bloqueados)

              return (
                <td
                  key={ds}
                  className={cn(
                    "w-10 border-l border-border py-2 text-center",
                    bloqueado && "bg-destructive/8",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-bold",
                      bloqueado
                        ? "text-muted-foreground/30"
                        : working <= minimo
                        ? "text-amber-400"
                        : "text-emerald-500",
                    )}
                  >
                    {working}
                  </span>
                </td>
              )
            })}
          </tr>
        </tfoot>

      </table>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function EscalaGridSkeleton() {
  return (
    <div className="animate-pulse overflow-x-auto rounded-2xl border border-border">
      <div className="h-12 bg-muted/40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-10 border-t border-border">
          <div className="w-36 shrink-0 border-r border-border bg-card px-4 py-2">
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
          <div className="flex-1 bg-muted/10" />
        </div>
      ))}
      <div className="h-10 border-t-2 border-border bg-muted/30" />
    </div>
  )
}
