import { useMemo, useState } from "react"
import { Plus, UserRound, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { SectionDivider } from "@/components/layout/SectionDivider"
import { FeedbackBanner } from "@/components/shared/FeedbackBanner"
import { EmptyState } from "@/components/shared/EmptyState"
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal"
import { FuncionarioCard, FuncionarioCardSkeleton } from "./components/FuncionarioCard"
import { FuncionarioModal } from "./components/FuncionarioModal"
import { useFuncionarios } from "./hooks/useFuncionarios"

type FiltroAtivo = "todos" | "ativos" | "inativos"

export default function Funcionarios() {
  const {
    funcionarios,
    setores,
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    openCreate,
    openEdit,
    closeModal,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
  } = useFuncionarios()

  const [filtroSetor, setFiltroSetor] = useState("all")
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>("todos")

  const filtrados = useMemo(() => {
    return funcionarios.filter((f) => {
      const passaSetor = filtroSetor === "all" || f.id_setor === filtroSetor
      const passaAtivo =
        filtroAtivo === "todos" ||
        (filtroAtivo === "ativos" && f.ativo) ||
        (filtroAtivo === "inativos" && !f.ativo)
      return passaSetor && passaAtivo
    })
  }, [funcionarios, filtroSetor, filtroAtivo])

  const totalAtivos = funcionarios.filter((f) => f.ativo).length

  return (
    <PageLayout>

      <PageHeader
        icon={<Users size={22} className="text-primary" strokeWidth={1.5} />}
        title="Funcionários"
        subtitle="Gerencie os funcionários da padaria"
        action={
          <Button
            onClick={openCreate}
            disabled={setores.length === 0}
            className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Novo Funcionário
          </Button>
        }
      />

      <SectionDivider className="mb-8 animate-fade-up animation-delay-75" />

      <FeedbackBanner feedback={feedback} />

      {/* Filtros */}
      {!isLoading && funcionarios.length > 0 && (
        <div className="mb-6 flex animate-fade-up flex-wrap items-center gap-3 animation-delay-150">

          <Select value={filtroSetor} onValueChange={setFiltroSetor}>
            <SelectTrigger className="h-9 w-auto min-w-40 text-xs font-semibold dark:bg-card">
              <SelectValue placeholder="Todos os setores" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Todos os setores</SelectItem>
              {setores.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nome_setor}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-lg border border-border bg-card p-1 gap-0.5">
            {(["todos", "ativos", "inativos"] as FiltroAtivo[]).map((opcao) => (
              <button
                key={opcao}
                onClick={() => setFiltroAtivo(opcao)}
                className={cn(
                  "rounded-md px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em] transition-all duration-150",
                  filtroAtivo === opcao
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opcao === "todos" ? "Todos" : opcao === "ativos" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>

          <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {totalAtivos} {totalAtivos === 1 ? "ativo" : "ativos"}
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FuncionarioCardSkeleton />
          <FuncionarioCardSkeleton />
          <FuncionarioCardSkeleton />
          <FuncionarioCardSkeleton />
        </div>
      )}

      {/* Empty state — sem funcionários */}
      {!isLoading && funcionarios.length === 0 && (
        <EmptyState
          icon={<UserRound size={24} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhum funcionário cadastrado"
          description={
            setores.length === 0
              ? "Crie pelo menos um setor antes de cadastrar funcionários."
              : "Cadastre o primeiro funcionário para começar a organizar a escala."
          }
          action={
            <Button
              onClick={openCreate}
              disabled={setores.length === 0}
              className="h-10 gap-2 text-xs font-bold uppercase tracking-[0.06em] hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              Cadastrar funcionário
            </Button>
          }
        />
      )}

      {/* Empty state — filtro sem resultados */}
      {!isLoading && funcionarios.length > 0 && filtrados.length === 0 && (
        <EmptyState
          icon={<UserRound size={20} className="text-muted-foreground" strokeWidth={1.5} />}
          title="Nenhum resultado"
          description="Tente ajustar os filtros aplicados."
        />
      )}

      {/* Grid */}
      {!isLoading && filtrados.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((funcionario, i) => (
            <FuncionarioCard
              key={funcionario.id}
              funcionario={funcionario}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {!isLoading && filtrados.length > 0 && (
        <p className="mt-6 animate-fade-in text-center text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground animation-delay-375">
          {filtrados.length === funcionarios.length
            ? `${funcionarios.length} ${funcionarios.length === 1 ? "funcionário cadastrado" : "funcionários cadastrados"}`
            : `${filtrados.length} de ${funcionarios.length} funcionários`
          }
        </p>
      )}

      {/* Modal criar/editar */}
      {modalState.open && (
        <FuncionarioModal
          state={modalState}
          setores={setores}
          onClose={closeModal}
          onCreate={createFuncionario}
          onUpdate={updateFuncionario}
        />
      )}

      {/* Dialog de exclusão */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Excluir funcionário?"
          description={
            <>
              Esta ação não pode ser desfeita. Todas as folgas vinculadas a{" "}
              <span className="font-semibold text-foreground">"{deleteTarget.nome_funcionario}"</span>{" "}
              serão removidas.
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onDelete={() => deleteFuncionario(deleteTarget)}
        />
      )}

    </PageLayout>
  )
}
