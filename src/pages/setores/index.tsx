import { Building2, Plus, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SetorCard, SetorCardSkeleton } from "./components/SetorCard"
import { SetorModal } from "./components/SetorModal"
import { DeleteConfirm } from "./components/DeleteConfirm"
import { useSetores } from "./hooks/useSetores"

export default function Setores() {
  const {
    setores,
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    openCreate,
    openEdit,
    closeModal,
    createSetor,
    updateSetor,
    deleteSetor,
  } = useSetores()

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background">

      {/* Decorative gradients */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_5%,oklch(0.73_0.14_68_/_0.09)_0%,transparent_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_95%,oklch(0.62_0.12_50_/_0.07)_0%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-10">

        {/* Header */}
        <div className="mb-8 flex animate-fade-up items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <Wheat size={22} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Setores</h1>
              <p className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Gerencie os setores da padaria
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Novo Setor
          </Button>
        </div>

        {/* Divider */}
        <div className="mb-8 flex animate-fade-up items-center gap-3 animation-delay-75">
          <div className="h-px flex-1 bg-border" />
          <div className="h-1 w-1 rounded-full bg-border" />
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={cn(
              "mb-6 animate-fade-in rounded-xl border px-4 py-3 text-sm leading-relaxed",
              feedback.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            {feedback.text}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SetorCardSkeleton />
            <SetorCardSkeleton />
            <SetorCardSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && setores.length === 0 && (
          <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-16 text-center animation-delay-150">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
              <Building2 size={24} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              Nenhum setor cadastrado
            </h3>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Crie o primeiro setor para começar a organizar os funcionários.
            </p>
            <Button
              onClick={openCreate}
              className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              Criar primeiro setor
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && setores.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {setores.map((setor, i) => (
              <SetorCard
                key={setor.id}
                setor={setor}
                index={i}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {!isLoading && setores.length > 0 && (
          <p className="mt-6 animate-fade-in text-center text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground animation-delay-375">
            {setores.length} {setores.length === 1 ? "setor cadastrado" : "setores cadastrados"}
          </p>
        )}

      </div>

      {/* Modal criar/editar */}
      {modalState.open && (
        <SetorModal
          state={modalState}
          onClose={closeModal}
          onCreate={createSetor}
          onUpdate={updateSetor}
        />
      )}

      {/* Dialog de exclusão */}
      {deleteTarget && (
        <DeleteConfirm
          setor={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDelete={deleteSetor}
        />
      )}

    </div>
  )
}
