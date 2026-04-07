import { CalendarDays, CalendarX2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { EmptyState } from "@/components/shared/EmptyState"
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal"
import { EscalaCard, EscalaCardSkeleton } from "./components/EscalaCard"
import { EscalaModal } from "./components/EscalaModal"
import { useEscalas } from "./hooks/useEscalas"

const STATUS_OPTIONS = [
  { value: "all",       label: "Todos os status"  },
  { value: "rascunho",  label: "Rascunho"          },
  { value: "publicada", label: "Publicada"          },
]

export default function Escalas() {
  const {
    escalas,
    totalEscalas,
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    filterSetor,
    setFilterSetor,
    filterStatus,
    setFilterStatus,
    setorFilterOptions,
    openCreate,
    openEdit,
    closeModal,
    createEscala,
    updateEscala,
    deleteEscala,
  } = useEscalas()

  const hasFilters = filterSetor !== "all" || filterStatus !== "all"
  const isFiltered = hasFilters && escalas.length !== totalEscalas
  const isModalOpen = modalState.open

  return (
    <PageLayout maxWidth="max-w-5xl">

      <PageHeader
        icon={<CalendarDays size={22} className="text-primary" strokeWidth={1.5} />}
        title="Escalas"
        subtitle="Gerencie as escalas de folgas por setor"
        action={
          <Button
            onClick={openCreate}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Nova Escala
          </Button>
        }
      />

      <SectionDivider className="mb-6 animate-fade-up animation-delay-75" />

      {/* Filter bar */}
      {!isLoading && totalEscalas > 0 && (
        <div className="mb-6 flex animate-fade-up items-center gap-3 animation-delay-150">
          {/* Setor filter */}
          <Select value={filterSetor} onValueChange={setFilterSetor}>
            <SelectTrigger className="h-9 w-48 text-xs dark:bg-background">
              <SelectValue placeholder="Filtrar por setor" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all" className="text-xs">Todos os setores</SelectItem>
              {setorFilterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-44 text-xs dark:bg-background">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent position="popper">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => { setFilterSetor("all"); setFilterStatus("all") }}
              className="text-[0.6875rem] font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Limpar filtros
            </button>
          )}

          {/* Count */}
          <p className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {isFiltered
              ? `${escalas.length} de ${totalEscalas} escalas`
              : `${totalEscalas} ${totalEscalas === 1 ? "escala" : "escalas"}`}
          </p>
        </div>
      )}

      <FeedbackBanner feedback={feedback} />

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EscalaCardSkeleton />
          <EscalaCardSkeleton />
          <EscalaCardSkeleton />
        </div>
      )}

      {/* Empty — sem nenhuma escala ainda */}
      {!isLoading && totalEscalas === 0 && (
        <EmptyState
          icon={<CalendarDays size={24} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhuma escala criada"
          description="Crie a primeira escala para começar a organizar as folgas por setor e mês."
          action={
            <Button
              onClick={openCreate}
              className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              Criar primeira escala
            </Button>
          }
        />
      )}

      {/* Empty — sem resultados para o filtro aplicado */}
      {!isLoading && totalEscalas > 0 && escalas.length === 0 && (
        <EmptyState
          icon={<CalendarX2 size={24} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhuma escala encontrada"
          description="Nenhuma escala corresponde aos filtros aplicados. Tente ajustar os filtros."
        />
      )}

      {/* Grid */}
      {!isLoading && escalas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {escalas.map((escala, i) => (
            <EscalaCard
              key={escala.id}
              escala={escala}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal criar / editar */}
      {isModalOpen && (
        <EscalaModal
          state={modalState}
          onClose={closeModal}
          onCreate={createEscala}
          onUpdate={updateEscala}
        />
      )}

      {/* Dialog de exclusão */}
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
