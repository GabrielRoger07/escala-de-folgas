import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { Setor, SetorInsert } from "@/types/database"

export type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; setor: Setor }

export function useSetores() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<Setor | null>(null)
  const { feedback, showFeedback } = useFeedback()

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchSetores = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("setores")
      .select("*")
      .order("nome_setor", { ascending: true })

    setIsLoading(false)
    if (error) {
      showFeedback("Erro ao carregar setores. Tente recarregar a página.", "error")
      return
    }
    setSetores(data ?? [])
  }, [showFeedback])

  useEffect(() => {
    const loadSetores = async () => { await fetchSetores() }
    loadSetores()
  }, [fetchSetores])

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function createSetor(payload: SetorInsert): Promise<boolean> {
    const { error } = await supabase.from("setores").insert(payload)
    if (error) { showFeedback("Erro ao criar setor. Tente novamente.", "error"); return false }
    showFeedback("Setor criado com sucesso.", "success")
    await fetchSetores()
    return true
  }

  async function updateSetor(id: string, payload: SetorInsert): Promise<boolean> {
    const { error } = await supabase.from("setores").update(payload).eq("id", id)
    if (error) { showFeedback("Erro ao atualizar setor. Tente novamente.", "error"); return false }
    showFeedback("Setor atualizado com sucesso.", "success")
    await fetchSetores()
    return true
  }

  async function deleteSetor(setor: Setor): Promise<boolean> {
    const { error } = await supabase.from("setores").delete().eq("id", setor.id)
    if (error) { showFeedback("Erro ao excluir setor. Tente novamente.", "error"); return false }
    showFeedback(`Setor "${setor.nome_setor}" excluído com sucesso.`, "success")
    await fetchSetores()
    return true
  }

  // ── Modal handlers ────────────────────────────────────────────────────────

  function openCreate() { setModalState({ open: true, mode: "create" }) }
  function openEdit(setor: Setor) { setModalState({ open: true, mode: "edit", setor }) }
  function closeModal() { setModalState({ open: false }) }

  return {
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
  }
}
