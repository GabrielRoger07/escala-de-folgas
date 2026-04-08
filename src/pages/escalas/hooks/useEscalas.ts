import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { DiaSemana, EscalaInsert, EscalaUpdate } from "@/types/database"

export type EscalaWithSetor = {
  id: string
  id_setor: string
  mes: number
  ano: number
  status: "rascunho" | "publicada"
  dias_bloqueados: DiaSemana[]
  created_at: string
  setores: { nome_setor: string }
}

export type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; escala: EscalaWithSetor }

export function useEscalas() {
  const [escalas, setEscalas] = useState<EscalaWithSetor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<EscalaWithSetor | null>(null)
  const [filterSetor, setFilterSetor] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { feedback, showFeedback } = useFeedback()

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchEscalas = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("escalas")
      .select("*, setores(nome_setor)")
      .order("ano", { ascending: false })
      .order("mes", { ascending: false })

    setIsLoading(false)
    if (error) {
      showFeedback("Erro ao carregar escalas. Tente recarregar a página.", "error")
      return
    }
    setEscalas((data ?? []) as EscalaWithSetor[])
  }, [showFeedback])

  useEffect(() => {
    const load = async () => { await fetchEscalas() }
    load()
  }, [fetchEscalas])

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredEscalas = escalas.filter((e) => {
    if (filterSetor !== "all" && e.id_setor !== filterSetor) return false
    if (filterStatus !== "all" && e.status !== filterStatus) return false
    return true
  })

  // Unique setores from loaded escalas for the filter dropdown
  const setorFilterOptions = Array.from(
    new Map(escalas.map((e) => [e.id_setor, e.setores.nome_setor])).entries()
  )
    .map(([id, nome]) => ({ value: id, label: nome }))
    .sort((a, b) => a.label.localeCompare(b.label))

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function createEscala(payload: EscalaInsert): Promise<boolean> {
    const { error } = await supabase.from("escalas").insert(payload)
    if (error) {
      if (error.code === "23505") {
        showFeedback("Já existe uma escala para este setor neste mês.", "error")
      } else {
        showFeedback("Erro ao criar escala. Tente novamente.", "error")
      }
      return false
    }
    showFeedback("Escala criada com sucesso.", "success")
    await fetchEscalas()
    return true
  }

  async function updateEscala(id: string, payload: EscalaUpdate): Promise<boolean> {
    const { error } = await supabase.from("escalas").update(payload).eq("id", id)
    if (error) {
      if (error.code === "23505") {
        showFeedback("Já existe uma escala para este setor neste mês.", "error")
      } else {
        showFeedback("Erro ao atualizar escala. Tente novamente.", "error")
      }
      return false
    }
    showFeedback("Escala atualizada com sucesso.", "success")
    await fetchEscalas()
    return true
  }

  async function deleteEscala(escala: EscalaWithSetor): Promise<boolean> {
    const { error } = await supabase.from("escalas").delete().eq("id", escala.id)
    if (error) {
      showFeedback("Erro ao excluir escala. Tente novamente.", "error")
      return false
    }
    showFeedback("Escala excluída com sucesso.", "success")
    await fetchEscalas()
    return true
  }

  // ── Modal handlers ────────────────────────────────────────────────────────

  function openCreate() { setModalState({ open: true, mode: "create" }) }
  function openEdit(escala: EscalaWithSetor) { setModalState({ open: true, mode: "edit", escala }) }
  function closeModal() { setModalState({ open: false }) }

  return {
    escalas: filteredEscalas,
    totalEscalas: escalas.length,
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
  }
}
