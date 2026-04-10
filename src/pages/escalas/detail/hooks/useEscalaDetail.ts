import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { DiaSemana, Funcionario, FolgaInsert } from "@/types/database"

// --- Types -------------------------------------------------------------------

export type EscalaDetail = {
  id: string
  id_setor: string
  mes: number
  ano: number
  status: "rascunho" | "publicada"
  dias_bloqueados: DiaSemana[]
  created_at: string
  setores: { nome_setor: string; minimo_por_dia: number }
}

export type Domingo = {
  data: Date
  index: number
  folgas: number
}

// Mapping JS getDay() (0=Sun...6=Sat) -> DiaSemana enum (only seg-sab)
const DOW_TO_DIA: Record<number, DiaSemana | undefined> = {
  1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab",
}

export function isDiaBloqueado(date: Date, diasBloqueados: DiaSemana[]): boolean {
  const dia = DOW_TO_DIA[date.getDay()]
  return dia !== undefined && diasBloqueados.includes(dia)
}

// --- Helpers -----------------------------------------------------------------

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// --- Previous month consecutive days -----------------------------------------
//
// Looks up the previous month's escala (same setor) and counts how many
// consecutive workdays each employee had at the END of that month.
// Returns 0 for each employee when there is no previous escala.

async function fetchPrevConsecutive(
  idSetor: string,
  mes: number,
  ano: number,
  funcIds: string[],
): Promise<Record<string, number>> {
  const prevMes = mes === 1 ? 12 : mes - 1
  const prevAno = mes === 1 ? ano - 1 : ano
  const prevDaysInMonth = new Date(prevAno, prevMes, 0).getDate()

  const zeros = Object.fromEntries(funcIds.map((id) => [id, 0]))

  const { data: prevEscala } = await supabase
    .from("escalas")
    .select("id")
    .eq("id_setor", idSetor)
    .eq("mes", prevMes)
    .eq("ano", prevAno)
    .maybeSingle()

  if (!prevEscala) return zeros

  const last6Dates = Array.from({ length: 6 }, (_, i) => {
    const d = String(prevDaysInMonth - 5 + i).padStart(2, "0")
    const m = String(prevMes).padStart(2, "0")
    return `${prevAno}-${m}-${d}`
  })

  const { data: prevFolgas } = await supabase
    .from("folgas")
    .select("id_funcionario, data")
    .eq("id_escala", prevEscala.id)
    .in("data", last6Dates)

  const folgaSet = new Set((prevFolgas ?? []).map((f) => `${f.id_funcionario}|${f.data}`))

  const result: Record<string, number> = {}
  for (const funcId of funcIds) {
    let count = 0
    for (let d = prevDaysInMonth; d >= prevDaysInMonth - 5; d--) {
      const ds = `${prevAno}-${String(prevMes).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      if (folgaSet.has(`${funcId}|${ds}`)) break
      count++
    }
    result[funcId] = count
  }

  return result
}

// --- Solver API --------------------------------------------------------------

const SOLVER_URL = "http://localhost:8000"

async function generateFolgas(
  funcionarios: Funcionario[],
  days: Date[],
  prevConsecutive: Record<string, number>,
  escala_id: string,
): Promise<FolgaInsert[]> {
  const body = {
    funcionarios: funcionarios.map((f) => f.id),
    days: days.map((d) => toDateStr(d)),
    quantidadeDiasConsecutivos: 6,
    prevConsecutive,
  }

  const res = await fetch(`${SOLVER_URL}/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Solver retornou status ${res.status}`)
  }

  const data = await res.json()

  if (!data.ok) {
    throw new Error(data.error ?? "Solver não encontrou solução viável.")
  }

  return data.folgas.map((f: { id_funcionario: string; data: string }) => ({
    id_funcionario: f.id_funcionario,
    id_escala: escala_id,
    data: f.data,
  }))
}

// --- Hook --------------------------------------------------------------------

export function useEscalaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { feedback, showFeedback } = useFeedback()

  const [escala, setEscala] = useState<EscalaDetail | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [prevConsecutive, setPrevConsecutive] = useState<Record<string, number>>({})
  const [folgas, setFolgas] = useState<Set<string>>(new Set()) // "funcId|YYYY-MM-DD"
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

  // -- Fetch ------------------------------------------------------------------

  const fetchAll = useCallback(async () => {
    if (!id) return
    setIsLoading(true)

    const [escalaRes, folgasRes] = await Promise.all([
      supabase
        .from("escalas")
        .select("*, setores(nome_setor, minimo_por_dia)")
        .eq("id", id)
        .single(),
      supabase
        .from("folgas")
        .select("id_funcionario, data")
        .eq("id_escala", id),
    ])

    if (escalaRes.error || !escalaRes.data) {
      showFeedback("Escala não encontrada.", "error")
      setIsLoading(false)
      navigate("/escalas")
      return
    }

    const escalaData = escalaRes.data as EscalaDetail
    setEscala(escalaData)

    const funcRes = await supabase
      .from("funcionarios")
      .select("*")
      .eq("id_setor", escalaData.id_setor)
      .eq("ativo", true)
      .order("nome_funcionario", { ascending: true })

    const funcs = (funcRes.data ?? []) as Funcionario[]
    setFuncionarios(funcs)

    const prev = await fetchPrevConsecutive(
      escalaData.id_setor,
      escalaData.mes,
      escalaData.ano,
      funcs.map((f) => f.id),
    )
    setPrevConsecutive(prev)

    const folgaSet = new Set<string>()
    for (const f of folgasRes.data ?? []) {
      folgaSet.add(`${f.id_funcionario}|${f.data}`)
    }
    setFolgas(folgaSet)
    setIsLoading(false)
  }, [id, navigate, showFeedback])

  useEffect(() => {
    const load = async () => { await fetchAll() }
    load()
  }, [fetchAll])

  // -- Derived ----------------------------------------------------------------

  const days = useMemo(() => {
    if (!escala) return []
    return getDaysInMonth(escala.ano, escala.mes)
  }, [escala])

  function isFolga(funcId: string, dateStr: string): boolean {
    return folgas.has(`${funcId}|${dateStr}`)
  }

  function workingOnDay(dateStr: string): number {
    let folgasCount = 0
    for (const func of funcionarios) {
      if (folgas.has(`${func.id}|${dateStr}`)) folgasCount++
    }
    return funcionarios.length - folgasCount
  }

  // -- Toggle folga -----------------------------------------------------------

  async function toggleFolga(funcId: string, dateStr: string) {
    if (!escala || escala.status === "publicada") return

    const key = `${funcId}|${dateStr}`
    const hasFolga = folgas.has(key)

    if (!hasFolga) {
      const [year, month, day] = dateStr.split("-").map(Number)
      if (isDiaBloqueado(new Date(year, month - 1, day), escala.dias_bloqueados)) {
        showFeedback("Este dia está bloqueado para folgas nesta escala.", "error")
        return
      }
      if (workingOnDay(dateStr) <= escala.setores.minimo_por_dia) {
        showFeedback(
          `Mínimo de ${escala.setores.minimo_por_dia} funcionário(s) trabalhando por dia atingido.`,
          "error",
        )
        return
      }
    }

    // Optimistic update
    setFolgas((prev) => {
      const next = new Set(prev)
      if (hasFolga) next.delete(key)
      else next.add(key)
      return next
    })

    if (hasFolga) {
      const { error } = await supabase
        .from("folgas")
        .delete()
        .eq("id_funcionario", funcId)
        .eq("data", dateStr)
        .eq("id_escala", escala.id)

      if (error) {
        showFeedback("Erro ao remover folga.", "error")
        setFolgas((prev) => { const n = new Set(prev); n.add(key); return n })
      }
    } else {
      const { error } = await supabase
        .from("folgas")
        .insert({ id_funcionario: funcId, id_escala: escala.id, data: dateStr })

      if (error) {
        showFeedback("Erro ao adicionar folga.", "error")
        setFolgas((prev) => { const n = new Set(prev); n.delete(key); return n })
      }
    }
  }

  // -- Generate ---------------------------------------------------------------

  async function generate(replace = false) {
    if (!escala) return
    setIsGenerating(true)

    if (replace) {
      const { error } = await supabase.from("folgas").delete().eq("id_escala", escala.id)
      if (error) {
        showFeedback("Erro ao limpar folgas existentes.", "error")
        setIsGenerating(false)
        return
      }
    }

    if (funcionarios.length === 0) {
      showFeedback("Não há funcionários ativos neste setor.", "error")
      setIsGenerating(false)
      return
    }

    let newFolgas: FolgaInsert[]
    try {
      newFolgas = await generateFolgas(
        funcionarios,
        days,
        prevConsecutive,
        escala.id,
      )
    } catch (err) {
      showFeedback(
        err instanceof Error ? err.message : "Erro ao comunicar com o solver.",
        "error",
      )
      setIsGenerating(false)
      return
    }

    if (newFolgas.length === 0) {
      showFeedback("Não foi possível gerar folgas com as restrições atuais.", "error")
      setIsGenerating(false)
      return
    }

    const { error } = await supabase.from("folgas").insert(newFolgas)
    if (error) {
      showFeedback("Erro ao salvar folgas geradas.", "error")
      setIsGenerating(false)
      return
    }

    showFeedback("Escala gerada com sucesso.", "success")
    await fetchAll()
    setIsGenerating(false)
    setShowRegenerateConfirm(false)
  }

  // -- Publish / Revert -------------------------------------------------------

  async function togglePublish() {
    if (!escala) return
    setIsPublishing(true)

    const newStatus = escala.status === "publicada" ? "rascunho" : "publicada"
    const { error } = await supabase
      .from("escalas")
      .update({ status: newStatus })
      .eq("id", escala.id)

    if (error) {
      showFeedback("Erro ao alterar status da escala.", "error")
      setIsPublishing(false)
      return
    }

    setEscala((prev) => (prev ? { ...prev, status: newStatus } : prev))
    showFeedback(
      newStatus === "publicada"
        ? "Escala publicada com sucesso."
        : "Escala revertida para rascunho.",
      "success",
    )
    setIsPublishing(false)
  }

  return {
    escala,
    funcionarios,
    prevConsecutive,
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
  }
}
