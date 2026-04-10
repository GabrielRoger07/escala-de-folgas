import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Undo2,
  Users,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EscalaStatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/layout/PageLayout"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { ModalBase } from "@/components/shared/ModalBase"
import { cn } from "@/lib/utils"
import { EscalaGrid, EscalaGridSkeleton } from "./components/EscalaGrid"
import { useEscalaDetail } from "./hooks/useEscalaDetail"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default function EscalaDetail() {
  const navigate = useNavigate()
  const {
    escala,
    funcionarios,
    days,
    isLoading,
    isGenerating,
    isPublishing,
    showRegenerateConfirm,
    setShowRegenerateConfirm,
    feedback,
    isFolga,
    workingOnDay,
    toggleFolga,
    generate,
    togglePublish,
  } = useEscalaDetail()

  const hasEscala = !!escala
  const hasAnyFolga = hasEscala && funcionarios.length > 0
  const isEditable = escala?.status === "rascunho"
  const isPublished = escala?.status === "publicada"

  return (
    <PageLayout maxWidth="max-w-full">

      {/* ── Back + header ─────────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-up">
        <button
          onClick={() => navigate("/escalas")}
          className="mb-5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          Voltar para escalas
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <CalendarDays size={22} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : escala ? (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {escala.setores.nome_setor}
                  </h1>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {MONTH_NAMES[escala.mes - 1]} {escala.ano}
                    </p>
                    <EscalaStatusBadge status={escala.status} />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Actions */}
          {!isLoading && escala && (
            <div className="flex flex-wrap items-center gap-2">
              {isEditable && (
                <>
                  {hasAnyFolga ? (
                    <Button
                      variant="outline"
                      className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em]"
                      onClick={() => setShowRegenerateConfirm(true)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <RefreshCw size={15} strokeWidth={2.5} />
                      )}
                      Regenerar
                    </Button>
                  ) : (
                    <Button
                      className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
                      onClick={() => generate(false)}
                      disabled={isGenerating || funcionarios.length === 0}
                    >
                      {isGenerating ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Sparkles size={15} strokeWidth={2.5} />
                      )}
                      Gerar escala
                    </Button>
                  )}

                  <Button
                    className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
                    onClick={togglePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} strokeWidth={2.5} />
                    )}
                    Publicar
                  </Button>
                </>
              )}

              {isPublished && (
                <Button
                  variant="outline"
                  className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em]"
                  onClick={togglePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Undo2 size={15} strokeWidth={2.5} />
                  )}
                  Reverter para rascunho
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <SectionDivider className="mb-6 animate-fade-up animation-delay-75" />

      <FeedbackBanner feedback={feedback} />

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      {!isLoading && escala && (
        <div className="mb-6 flex animate-fade-up flex-wrap items-center gap-4 animation-delay-150">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <Users size={16} className="text-muted-foreground" strokeWidth={1.75} />
            <span className="text-xs font-semibold text-foreground">
              {funcionarios.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {funcionarios.length === 1 ? "funcionário ativo" : "funcionários ativos"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <CalendarDays size={16} className="text-muted-foreground" strokeWidth={1.75} />
            <span className="text-xs font-semibold text-foreground">{days.length}</span>
            <span className="text-xs text-muted-foreground">dias no mês</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Mínimo por dia:</span>
            <span className="text-xs font-semibold text-foreground">
              {escala.setores.minimo_por_dia}
            </span>
          </div>
        </div>
      )}

      {/* ── No employees warning ──────────────────────────────────────────── */}
      {!isLoading && escala && funcionarios.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          Não há funcionários ativos neste setor. Cadastre funcionários antes de gerar a escala.
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="animate-fade-up animation-delay-225">
        {isLoading && <EscalaGridSkeleton />}

        {!isLoading && escala && funcionarios.length > 0 && (
          <EscalaGrid
            escala={escala}
            funcionarios={funcionarios}
            days={days}
            isFolga={isFolga}
            workingOnDay={workingOnDay}
            onToggle={toggleFolga}
          />
        )}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      {!isLoading && escala && funcionarios.length > 0 && (
        <div className="mt-4 flex animate-fade-up flex-wrap items-center gap-4 animation-delay-300">
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[0.6875rem] text-muted-foreground">Folga</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[0.6875rem] font-bold text-emerald-500",
            )}>N</span>
            <span className="text-[0.6875rem] text-muted-foreground">= trabalhando (ok)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] font-bold text-amber-400">N</span>
            <span className="text-[0.6875rem] text-muted-foreground">= no mínimo (atenção)</span>
          </div>
          {isEditable && (
            <span className="ml-auto text-[0.6875rem] text-muted-foreground">
              Clique em uma célula para marcar ou desmarcar folga
            </span>
          )}
        </div>
      )}

      {/* ── Regenerate confirm modal ──────────────────────────────────────── */}
      {showRegenerateConfirm && (
        <ModalBase onClose={() => setShowRegenerateConfirm(false)} maxWidth="max-w-sm">
          <div className="mb-5 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <RefreshCw size={22} className="text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mb-7 text-center">
            <h2 className="mb-2 text-base font-semibold text-foreground">Regenerar escala?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todas as folgas atuais serão apagadas e uma nova escala será gerada automaticamente.
              Ajustes manuais serão perdidos.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 text-xs font-bold uppercase tracking-[0.06em]"
              onClick={() => setShowRegenerateConfirm(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              className={cn(
                "h-11 flex-1 gap-2 text-xs font-bold uppercase tracking-[0.06em]",
                "bg-amber-500 text-white hover:-translate-y-px hover:bg-amber-500/90 hover:shadow-lg hover:shadow-amber-500/20",
              )}
              onClick={() => generate(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} strokeWidth={2.5} />
              )}
              Regenerar
            </Button>
          </div>
        </ModalBase>
      )}

    </PageLayout>
  )
}
