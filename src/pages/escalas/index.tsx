import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal"
import { EscalaStatusBadge } from "@/components/shared/StatusBadge"
import { EscalaCardSkeleton } from "./components/EscalaCard"
import { EscalaModal } from "./components/EscalaModal"
import { useEscalas, type EscalaWithSetor, type MonthGroup, type SetorMesStatus } from "./hooks/useEscalas"
import { cn } from "@/lib/utils"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]


// ─── Tile do setor no mês atual ───────────────────────────────────────────────

interface SetorTileProps {
  item: SetorMesStatus
  index: number
  onGenerate: (setorId: string) => void
  onEdit: (escala: EscalaWithSetor) => void
  onDelete: (escala: EscalaWithSetor) => void
}

function SetorTile({ item, index, onGenerate, onEdit, onDelete }: SetorTileProps) {
  const navigate = useNavigate()
  const { setor, escala } = item

  const delays = ["", "animation-delay-75", "animation-delay-150", "animation-delay-300", "animation-delay-500"]
  const delay = delays[index % delays.length]

  if (!escala) {
    return (
      <div
        className={cn(
          "animate-fade-up group flex items-center justify-between gap-4 rounded-xl",
          "border border-dashed border-border bg-card/50 px-5 py-4",
          "transition-all duration-200 hover:border-primary/30 hover:bg-primary/5",
          delay
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <CalendarPlus size={14} className="text-muted-foreground/50" strokeWidth={1.75} />
          </div>
          <span className="truncate text-sm font-medium text-muted-foreground">
            {setor.nome_setor}
          </span>
        </div>

        <button
          onClick={() => onGenerate(setor.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5",
            "text-[0.6875rem] font-bold text-primary transition-all duration-150",
            "hover:border-primary/40 hover:bg-primary/20 hover:shadow-sm hover:shadow-primary/10",
            "group-hover:border-primary/35"
          )}
        >
          <Plus size={12} strokeWidth={2.5} />
          Gerar escala
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-fade-up group flex items-center justify-between gap-4 rounded-xl",
        "border border-border bg-card px-5 py-4 shadow-sm",
        "transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        delay
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            escala.status === "publicada"
              ? "border border-emerald-500/20 bg-emerald-500/10"
              : "border border-amber-500/20 bg-amber-500/10"
          )}
        >
          <CalendarDays
            size={14}
            strokeWidth={1.75}
            className={escala.status === "publicada" ? "text-emerald-400" : "text-amber-400"}
          />
        </div>
        <span className="truncate text-sm font-semibold text-foreground">
          {setor.nome_setor}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <EscalaStatusBadge status={escala.status} />

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(escala)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
                aria-label="Editar escala"
              >
                <Pencil size={11} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(escala)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Excluir escala"
              >
                <Trash2 size={11} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate(`/escalas/${escala.id}`)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all duration-150 hover:border-border hover:bg-accent hover:text-foreground"
              aria-label="Ver escala"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Ver escala</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ─── Item de mês no histórico ─────────────────────────────────────────────────

function MonthListItem({ group, index }: { group: MonthGroup; index: number }) {
  const navigate = useNavigate()

  const publicadas = group.escalas.filter((e) => e.status === "publicada").length
  const rascunhos  = group.escalas.filter((e) => e.status === "rascunho").length
  const total      = group.escalas.length

  const delays = ["", "animation-delay-75", "animation-delay-150", "animation-delay-300"]
  const delay  = delays[index % delays.length]

  return (
    <button
      onClick={() => navigate(`/escalas/mes/${group.ano}/${group.mes}`)}
      className={cn(
        "animate-fade-up group w-full text-left",
        "flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm",
        "transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        delay
      )}
    >
      {/* Ícone do mês */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 transition-colors group-hover:border-primary/20 group-hover:bg-primary/10">
        <CalendarDays size={14} className="text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.75} />
      </div>

      {/* Nome do mês */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{group.label}</p>
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          {total} {total === 1 ? "setor" : "setores"}
        </p>
      </div>

      {/* Indicadores de status */}
      <div className="flex shrink-0 items-center gap-2">
        {publicadas > 0 && (
          <Badge variant="outline" className="gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[0.625rem] text-emerald-400 hover:bg-emerald-500/10">
            <CheckCircle2 size={9} strokeWidth={2.5} />
            {publicadas}
          </Badge>
        )}
        {rascunhos > 0 && (
          <Badge variant="outline" className="gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[0.625rem] text-amber-400 hover:bg-amber-500/10">
            <CircleDashed size={9} strokeWidth={2.5} />
            {rascunhos}
          </Badge>
        )}
        <ChevronRight
          size={14}
          strokeWidth={2}
          className="ml-1 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </button>
  )
}

// ─── Skeleton do mês atual ────────────────────────────────────────────────────

function CurrentMonthSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Barra de progresso inline ────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  const isComplete = value === total && total > 0

  return (
    <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-border">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          isComplete ? "bg-emerald-400" : "bg-primary"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Escalas() {
  const {
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    currentMonth,
    currentYear,
    currentMonthStatus,
    monthGroups,
    openCreate,
    openEdit,
    closeModal,
    createEscala,
    updateEscala,
    deleteEscala,
  } = useEscalas()

  const isModalOpen = modalState.open
  const currentMonthName = MONTH_NAMES[currentMonth - 1]

  const totalSetores = currentMonthStatus.length
  const setoresComEscala = currentMonthStatus.filter((s) => s.escala !== null).length
  const allDone = totalSetores > 0 && setoresComEscala === totalSetores

  return (
    <PageLayout maxWidth="max-w-4xl">

      <PageHeader
        icon={<CalendarDays size={22} className="text-primary" strokeWidth={1.5} />}
        title="Escalas de Folgas"
        subtitle="Gerencie as escalas mensais por setor"
        action={
          <Button
            onClick={() => openCreate()}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Nova escala
          </Button>
        }
      />

      <SectionDivider className="mb-8 animate-fade-up animation-delay-75" />

      <FeedbackBanner feedback={feedback} />

      {/* ── Mês atual ─────────────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-up animation-delay-75">

        {/* Header do mês */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">
              {currentMonthName} {currentYear}
            </h2>
            {!isLoading && totalSetores > 0 && (
              <>
                <ProgressBar value={setoresComEscala} total={totalSetores} />
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                  {setoresComEscala}/{totalSetores} setores
                </span>
              </>
            )}
          </div>

          {!isLoading && allDone && (
            <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-emerald-400">
              <Sparkles size={11} strokeWidth={2} />
              Mês completo
            </span>
          )}
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <CurrentMonthSkeleton />
        ) : totalSetores === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
            <CalendarDays size={20} className="mx-auto mb-3 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-muted-foreground">Nenhum setor cadastrado</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Cadastre setores antes de criar escalas.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {currentMonthStatus.map((item, i) => (
              <SetorTile
                key={item.setor.id}
                item={item}
                index={i}
                onGenerate={(id) => openCreate(id)}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Histórico ─────────────────────────────────────────────────────── */}
      {!isLoading && monthGroups.length > 0 && (
        <section className="animate-fade-up animation-delay-150">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
              Histórico
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            {monthGroups.map((group, i) => (
              <MonthListItem key={group.key} group={group} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Loading de histórico ───────────────────────────────────────────── */}
      {isLoading && (
        <section className="animate-fade-up animation-delay-150">
          <div className="mb-5 flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Separator className="flex-1" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <EscalaCardSkeleton />
            <EscalaCardSkeleton />
            <EscalaCardSkeleton />
          </div>
        </section>
      )}

      {/* ── Modal criar / editar ───────────────────────────────────────────── */}
      {isModalOpen && (
        <EscalaModal
          state={modalState}
          onClose={closeModal}
          onCreate={createEscala}
          onUpdate={updateEscala}
        />
      )}

      {/* ── Dialog de exclusão ─────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Excluir escala?"
          description={
            <>
              Esta ação não pode ser desfeita. Todas as folgas vinculadas à escala de{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget.setores.nome_setor}
              </span>{" "}
              serão excluídas permanentemente.
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onDelete={() => deleteEscala(deleteTarget)}
        />
      )}

    </PageLayout>
  )
}
