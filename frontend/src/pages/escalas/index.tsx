import { useEffect, useRef, useState } from "react"
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
import { MobileFab } from "@/components/shared/MobileFab"
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
          "animate-fade-up group flex items-center justify-between gap-3 rounded-xl",
          "border border-dashed border-border bg-card/50 px-4 py-3 sm:px-5 sm:py-4",
          "transition-all duration-200 hover:border-primary/30 hover:bg-primary/5",
          delay
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <CalendarPlus size={16} className="text-muted-foreground/50" strokeWidth={1.75} />
          </div>
          <span className="truncate text-sm font-medium text-muted-foreground">
            {setor.nome_setor}
          </span>
        </div>

        <button
          onClick={() => onGenerate(setor.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2",
            "text-xs font-bold text-primary transition-all duration-200",
            "hover:-translate-y-px hover:border-primary/50 hover:bg-primary/18 hover:shadow-md hover:shadow-primary/15",
            "active:translate-y-0 active:shadow-sm",
            "group-hover:border-primary/40"
          )}
        >
          <Plus size={15} strokeWidth={2.5} />
          Gerar escala
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-fade-up group flex items-center justify-between gap-3 rounded-xl",
        "border border-border bg-card px-4 py-3 shadow-sm sm:px-5 sm:py-4",
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
            size={16}
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
                <Pencil size={13} strokeWidth={1.75} />
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
                <Trash2 size={13} strokeWidth={1.75} />
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
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Ver escala</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ─── Tipos derivados para o histórico ────────────────────────────────────────

type YearGroup = {
  ano: number
  months: MonthGroup[]
}

// ─── Grade de 12 meses dentro do acordeão ────────────────────────────────────

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function YearGrid({ yearGroup }: { yearGroup: YearGroup }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-4 gap-1.5 p-3">
      {Array.from({ length: 12 }, (_, i) => {
        const mesNum = i + 1
        const group  = yearGroup.months.find((m) => m.mes === mesNum) ?? null

        if (!group) {
          return (
            <div
              key={mesNum}
              className="flex h-16 flex-col items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/10"
            >
              <span className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground/25">
                {MONTH_ABBR[i]}
              </span>
            </div>
          )
        }

        const publicadas   = group.escalas.filter((e) => e.status === "publicada").length
        const rascunhos    = group.escalas.filter((e) => e.status === "rascunho").length
        const total        = group.escalas.length
        const allPublished = publicadas === total && total > 0
        const allDraft     = rascunhos  === total && total > 0

        return (
          <button
            key={mesNum}
            onClick={() => navigate(`/escalas/mes/${group.ano}/${group.mes}`)}
            className={cn(
              "group relative flex h-16 flex-col items-start justify-between overflow-hidden rounded-lg border p-2.5 text-left",
              "transition-all duration-150 hover:-translate-y-px hover:shadow-md",
              allPublished
                ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35 hover:bg-emerald-500/10 hover:shadow-emerald-500/5"
                : allDraft
                ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/35 hover:bg-amber-500/10 hover:shadow-amber-500/5"
                : "border-border bg-card hover:border-primary/25 hover:bg-accent/40 hover:shadow-primary/5"
            )}
          >
            {/* Linha de status no topo */}
            <div className={cn(
              "absolute inset-x-0 top-0 h-0.5",
              allPublished ? "bg-emerald-400" : allDraft ? "bg-amber-400" : "bg-primary/40"
            )} />

            {/* Nome do mês */}
            <span className={cn(
              "text-[0.6875rem] font-bold uppercase tracking-widest leading-none",
              allPublished
                ? "text-emerald-400"
                : allDraft
                ? "text-amber-400"
                : "text-foreground"
            )}>
              {MONTH_ABBR[i]}
            </span>

            {/* Rodapé: contadores */}
            <div className="flex w-full items-center justify-between gap-1">
              <span className="text-[0.5625rem] font-semibold text-muted-foreground">
                {total} {total === 1 ? "setor" : "setores"}
              </span>
              <div className="flex items-center gap-1">
                {publicadas > 0 && (
                  <span className="flex items-center gap-0.5 text-[0.5625rem] font-bold text-emerald-400">
                    <CheckCircle2 size={7} strokeWidth={2.5} />
                    {publicadas}
                  </span>
                )}
                {rascunhos > 0 && (
                  <span className="flex items-center gap-0.5 text-[0.5625rem] font-bold text-amber-400">
                    <CircleDashed size={7} strokeWidth={2.5} />
                    {rascunhos}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Acordeão de um ano ───────────────────────────────────────────────────────

function YearAccordion({ yearGroup, defaultOpen }: { yearGroup: YearGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    if (open) {
      // Animate from 0 to measured height, then set to "auto" so it's flexible
      const measured = el.scrollHeight
      setHeight(measured)
      const timer = setTimeout(() => setHeight("auto"), 220)
      return () => clearTimeout(timer)
    } else {
      // Collapse: measure current height first, then animate to 0
      const measured = el.scrollHeight
      setHeight(measured)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0))
      })
    }
  }, [open])

  const totalEscalas = yearGroup.months.reduce((acc, g) => acc + g.escalas.length, 0)
  const totalPublicadas = yearGroup.months.reduce(
    (acc, g) => acc + g.escalas.filter((e) => e.status === "publicada").length, 0
  )
  const pctPublicadas = totalEscalas === 0 ? 0 : Math.round((totalPublicadas / totalEscalas) * 100)

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card shadow-sm transition-colors duration-200",
      open && "border-border"
    )}>
      {/* Header clicável */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Ano */}
        <span className="text-sm font-bold tabular-nums text-foreground">
          {yearGroup.ano}
        </span>

        {/* Mini barra de progresso */}
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              pctPublicadas === 100 ? "bg-emerald-400" : "bg-primary"
            )}
            style={{ width: `${pctPublicadas}%` }}
          />
        </div>

        {/* Resumo numérico */}
        <span className="shrink-0 text-[0.625rem] font-semibold tabular-nums text-muted-foreground">
          {yearGroup.months.length} {yearGroup.months.length === 1 ? "mês" : "meses"}
        </span>

        <ChevronRight
          size={15}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      {/* Conteúdo colapsável */}
      <div
        ref={contentRef}
        style={{ height: height === "auto" ? "auto" : `${height}px` }}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
      >
        <div className="border-t border-border">
          <YearGrid yearGroup={yearGroup} />
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton do histórico ────────────────────────────────────────────────────

function HistoricoSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-1 flex-1 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton do mês atual ────────────────────────────────────────────────────

function CurrentMonthSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 sm:px-5 sm:py-4">
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

  // Agrupa os meses do histórico por ano, ordem decrescente
  const yearGroups: YearGroup[] = []
  for (const group of monthGroups) {
    const existing = yearGroups.find((y) => y.ano === group.ano)
    if (existing) {
      existing.months.push(group)
    } else {
      yearGroups.push({ ano: group.ano, months: [group] })
    }
  }
  // meses mais recentes primeiro dentro de cada ano
  for (const yg of yearGroups) {
    yg.months.sort((a, b) => b.mes - a.mes)
  }
  const mostRecentYear = yearGroups[0]?.ano ?? null

  return (
    <PageLayout>

      <PageHeader
        icon={<CalendarDays size={24} className="text-primary" strokeWidth={1.5} />}
        title="Escalas de Folgas"
        subtitle="Gerencie as escalas mensais por setor"
        action={
          <Button
            onClick={() => openCreate()}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={16} strokeWidth={2.5} />
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
              <Sparkles size={13} strokeWidth={2} />
              Mês completo
            </span>
          )}
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <CurrentMonthSkeleton />
        ) : totalSetores === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
            <CalendarDays size={22} className="mx-auto mb-3 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-muted-foreground">Nenhum setor cadastrado</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Cadastre setores antes de criar escalas.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 xl:grid-cols-2">
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
      {!isLoading && yearGroups.length > 0 && (
        <section className="animate-fade-up animation-delay-150">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
              Histórico
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            {yearGroups.map((yg) => (
              <YearAccordion
                key={yg.ano}
                yearGroup={yg}
                defaultOpen={yg.ano === mostRecentYear}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Loading de histórico ───────────────────────────────────────────── */}
      {isLoading && (
        <section className="animate-fade-up animation-delay-150">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Separator className="flex-1" />
          </div>
          <HistoricoSkeleton />
        </section>
      )}

      <MobileFab onClick={() => openCreate()} label="Nova escala" />

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
