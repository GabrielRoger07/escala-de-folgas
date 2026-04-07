import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { Funcionario, FuncionarioInsert, Setor } from "@/types/database"

export type FuncionarioComSetor = Funcionario & {
  setores: { nome_setor: string } | null
}

export type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; funcionario: FuncionarioComSetor }

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioComSetor[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<FuncionarioComSetor | null>(null)
  const { feedback, showFeedback } = useFeedback()

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchSetores = useCallback(async () => {
    const { data } = await supabase
      .from("setores")
      .select("*")
      .order("nome_setor", { ascending: true })
    setSetores(data ?? [])
  }, [])

  const fetchFuncionarios = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*, setores(nome_setor)")
      .order("nome_funcionario", { ascending: true })

    setIsLoading(false)
    if (error) {
      showFeedback("Erro ao carregar funcionários. Tente recarregar a página.", "error")
      return
    }
    setFuncionarios((data ?? []) as FuncionarioComSetor[])
  }, [showFeedback])

  useEffect(() => {
    const load = async () => { await Promise.all([fetchFuncionarios(), fetchSetores()]) }
    load()
  }, [fetchFuncionarios, fetchSetores])

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function createFuncionario(payload: FuncionarioInsert): Promise<boolean> {
    const { error } = await supabase.from("funcionarios").insert(payload)
    if (error) { showFeedback("Erro ao criar funcionário. Tente novamente.", "error"); return false }
    showFeedback("Funcionário criado com sucesso.", "success")
    await fetchFuncionarios()
    return true
  }

  async function updateFuncionario(id: string, payload: Required<FuncionarioInsert>): Promise<boolean> {
    const { error } = await supabase.from("funcionarios").update(payload).eq("id", id)
    if (error) { showFeedback("Erro ao atualizar funcionário. Tente novamente.", "error"); return false }
    showFeedback("Funcionário atualizado com sucesso.", "success")
    await fetchFuncionarios()
    return true
  }

  async function deleteFuncionario(funcionario: FuncionarioComSetor): Promise<boolean> {
    const { error } = await supabase.from("funcionarios").delete().eq("id", funcionario.id)
    if (error) { showFeedback("Erro ao excluir funcionário. Tente novamente.", "error"); return false }
    showFeedback(`Funcionário "${funcionario.nome_funcionario}" excluído com sucesso.`, "success")
    await fetchFuncionarios()
    return true
  }

  // ── Modal handlers ────────────────────────────────────────────────────────

  function openCreate() { setModalState({ open: true, mode: "create" }) }
  function openEdit(funcionario: FuncionarioComSetor) { setModalState({ open: true, mode: "edit", funcionario }) }
  function closeModal() { setModalState({ open: false }) }

  return {
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
  }
}
