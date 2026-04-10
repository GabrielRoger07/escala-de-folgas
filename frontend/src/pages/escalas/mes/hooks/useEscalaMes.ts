import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/config/supabaseClient"
import type { DiaSemana } from "@/types/database"

export type EscalaMesItem = {
  id: string
  id_setor: string
  mes: number
  ano: number
  status: "rascunho" | "publicada"
  dias_bloqueados: DiaSemana[]
  created_at: string
  setores: { nome_setor: string; minimo_por_dia: number }
}

export function useEscalaMes() {
  const { ano: anoParam, mes: mesParam } = useParams<{ ano: string; mes: string }>()

  const ano = Number(anoParam)
  const mes = Number(mesParam)
  const isValid = !isNaN(ano) && !isNaN(mes) && mes >= 1 && mes <= 12 && ano >= 2024

  const [escalas, setEscalas] = useState<EscalaMesItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isValid) {
      setIsLoading(false)
      setError(true)
      return
    }

    async function load() {
      setIsLoading(true)
      const { data, error: err } = await supabase
        .from("escalas")
        .select("*, setores(nome_setor, minimo_por_dia)")
        .eq("mes", mes)
        .eq("ano", ano)
        .order("setores(nome_setor)", { ascending: true })

      setIsLoading(false)
      if (err) { setError(true); return }
      setEscalas((data ?? []) as EscalaMesItem[])
    }

    load()
  }, [ano, mes, isValid])

  return { escalas, isLoading, error, mes, ano, isValid }
}
