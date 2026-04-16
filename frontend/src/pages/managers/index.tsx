import { Plus, UserRound, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { EmptyState } from "@/components/shared/EmptyState"
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal"
import { MobileFab } from "@/components/shared/MobileFab"
import { ManagerCard, ManagerCardSkeleton } from "./components/ManagerCard"
import { ManagerModal } from "./components/ManagerModal"
import { ChangePasswordModal } from "./components/ChangePasswordModal"
import { useManagers } from "./hooks/useManagers"

export default function Managers() {
  const {
    managers,
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    changePasswordTarget,
    setChangePasswordTarget,
    openCreate,
    closeModal,
    createManager,
    deleteManager,
    changeManagerPassword,
  } = useManagers()

  return (
    <PageLayout>

      <PageHeader
        icon={<Users size={24} className="text-primary" strokeWidth={1.5} />}
        title="Gerentes"
        subtitle="Gerencie os gerentes da empresa"
        action={
          <Button
            onClick={openCreate}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo Gerente
          </Button>
        }
      />

      <SectionDivider className="mb-8 animate-fade-up animation-delay-75" />

      <FeedbackBanner feedback={feedback} />

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ManagerCardSkeleton />
          <ManagerCardSkeleton />
          <ManagerCardSkeleton />
          <ManagerCardSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && managers.length === 0 && (
        <EmptyState
          icon={<UserRound size={26} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhum gerente cadastrado"
          description="Crie o primeiro gerente para começar."
          action={
            <Button
              onClick={openCreate}
              className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={16} strokeWidth={2.5} />
              Criar primeiro gerente
            </Button>
          }
        />
      )}

      {/* Grid */}
      {!isLoading && managers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {managers.map((manager, i) => (
            <ManagerCard
              key={manager.id}
              manager={manager}
              index={i}
              onDelete={setDeleteTarget}
              onChangePassword={setChangePasswordTarget}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {!isLoading && managers.length > 0 && (
        <p className="mt-6 animate-fade-in text-center text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground animation-delay-375">
          {managers.length} {managers.length === 1 ? "gerente cadastrado" : "gerentes cadastrados"}
        </p>
      )}

      {/* Modal criar */}
      {modalState.open && (
        <ManagerModal
          onClose={closeModal}
          onCreate={createManager}
        />
      )}

      <MobileFab onClick={openCreate} label="Novo gerente" />

      {/* Modal alterar senha */}
      {changePasswordTarget && (
        <ChangePasswordModal
          manager={changePasswordTarget}
          onClose={() => setChangePasswordTarget(null)}
          onChangePassword={changeManagerPassword}
        />
      )}

      {/* Dialog de exclusão */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Excluir gerente?"
          description={
            <>
              Esta ação não pode ser desfeita. O gerente{" "}
              <span className="font-semibold text-foreground">"{deleteTarget.nome}"</span>{" "}
              perderá o acesso ao sistema.
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onDelete={() => deleteManager(deleteTarget)}
        />
      )}

    </PageLayout>
  )
}
