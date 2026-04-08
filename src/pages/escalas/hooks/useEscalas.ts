import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { DiaSemana, EscalaInsert, EscalaUpdate, Setor } from "@/types/database"

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
  | { open: true; mode: "create"; presetSetorId?: string }
  | { open: true; mode: "edit"; escala: EscalaWithSetor }

export type SetorMesStatus = {
  setor: Setor
  escala: EscalaWithSetor | null
}

export type MonthGroup = {
  mes: number
  ano: number
  key: string
  label: string
  escalas: EscalaWithSetor[]
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function useEscalas() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [allEscalas, setAllEscalas] = useState<EscalaWithSetor[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<EscalaWithSetor | null>(null)
  const { feedback, showFeedback } = useFeedback()

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const [escalasRes, setoresRes] = await Promise.all([
      supabase
        .from("escalas")
        .select("*, setores(nome_setor)")
        .order("ano", { ascending: false })
        .order("mes", { ascending: false }),
      supabase
        .from("setores")
        .select("*")
        .order("nome_setor", { ascending: true }),
    ])

    setIsLoading(false)
    if (escalasRes.error) {
      showFeedback("Erro ao carregar escalas. Tente recarregar a página.", "error")
      return
    }
    setAllEscalas((escalasRes.data ?? []) as EscalaWithSetor[])
    setSetores((setoresRes.data ?? []) as Setor[])
  }, [showFeedback])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Derived ───────────────────────────────────────────────────────────────

  // Status de cada setor no mês atual
  const currentMonthStatus: SetorMesStatus[] = setores.map((setor) => ({
    setor,
    escala: allEscalas.find(
      (e) => e.id_setor === setor.id && e.mes === currentMonth && e.ano === currentYear
    ) ?? null,
  }))

  // Escalas de meses anteriores agrupadas por mês/ano
  const historicalEscalas = allEscalas.filter(
    (e) => !(e.mes === currentMonth && e.ano === currentYear)
  )

  const monthGroups: MonthGroup[] = []
  for (const escala of historicalEscalas) {
    const key = `${escala.ano}-${String(escala.mes).padStart(2, "0")}`
    const existing = monthGroups.find((g) => g.key === key)
    if (existing) {
      existing.escalas.push(escala)
    } else {
      monthGroups.push({
        mes: escala.mes,
        ano: escala.ano,
        key,
        label: `${MONTH_NAMES[escala.mes - 1]} ${escala.ano}`,
        escalas: [escala],
      })
    }
  }

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
    await fetchData()
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
    await fetchData()
    return true
  }

  async function deleteEscala(escala: EscalaWithSetor): Promise<boolean> {
    const { error } = await supabase.from("escalas").delete().eq("id", escala.id)
    if (error) {
      showFeedback("Erro ao excluir escala. Tente novamente.", "error")
      return false
    }
    showFeedback("Escala excluída com sucesso.", "success")
    await fetchData()
    return true
  }

  // ── Modal handlers ────────────────────────────────────────────────────────

  function openCreate(presetSetorId?: string) {
    setModalState({ open: true, mode: "create", presetSetorId })
  }
  function openEdit(escala: EscalaWithSetor) {
    setModalState({ open: true, mode: "edit", escala })
  }
  function closeModal() { setModalState({ open: false }) }

  return {
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    currentMonth,
    currentYear,
    currentMonthStatus,
    monthGroups,
    allEscalas,
    openCreate,
    openEdit,
    closeModal,
    createEscala,
    updateEscala,
    deleteEscala,
  }
}
