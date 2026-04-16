import { Building2, Plus, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { EmptyState } from "@/components/shared/EmptyState"
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal"
import { MobileFab } from "@/components/shared/MobileFab"
import { SetorCard, SetorCardSkeleton } from "./components/SetorCard"
import { SetorModal } from "./components/SetorModal"
import { useSetores } from "./hooks/useSetores"
import { useAuth } from "@/auth/useAuth"

export default function Setores() {
  const { userRole } = useAuth()
  const isCeo = userRole === "ceo"
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
    <PageLayout>

      <PageHeader
        icon={<Wheat size={24} className="text-primary" strokeWidth={1.5} />}
        title="Setores"
        subtitle="Gerencie os setores da padaria"
        action={isCeo && (
          <Button
            onClick={openCreate}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo Setor
          </Button>
        )}
      />

      <SectionDivider className="mb-8 animate-fade-up animation-delay-75" />

      <FeedbackBanner feedback={feedback} />

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SetorCardSkeleton />
          <SetorCardSkeleton />
          <SetorCardSkeleton />
          <SetorCardSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && setores.length === 0 && (
        <EmptyState
          icon={<Building2 size={26} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhum setor cadastrado"
          description="Crie o primeiro setor para começar a organizar os funcionários."
          action={isCeo && (
            <Button
              onClick={openCreate}
              className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={16} strokeWidth={2.5} />
              Criar primeiro setor
            </Button>
          )}
        />
      )}

      {/* Grid */}
      {!isLoading && setores.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {setores.map((setor, i) => (
            <SetorCard
              key={setor.id}
              setor={setor}
              index={i}
              onEdit={isCeo ? openEdit : undefined}
              onDelete={isCeo ? setDeleteTarget : undefined}
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

      {/* Modal criar/editar */}
      {isCeo && modalState.open && (
        <SetorModal
          state={modalState}
          onClose={closeModal}
          onCreate={createSetor}
          onUpdate={updateSetor}
        />
      )}

      {isCeo && <MobileFab onClick={openCreate} label="Novo setor" />}

      {/* Dialog de exclusão */}
      {isCeo && deleteTarget && (
        <DeleteConfirmModal
          title="Excluir setor?"
          description={
            <>
              Esta ação não pode ser desfeita. Todos os dados vinculados ao setor{" "}
              <span className="font-semibold text-foreground">"{deleteTarget.nome_setor}"</span>{" "}
              serão perdidos.
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onDelete={() => deleteSetor(deleteTarget)}
        />
      )}

    </PageLayout>
  )
}
