import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabaseClient'
import type { Setor, Escala } from '@/types/database'

export interface SetorComEscala {
  setor: Setor
  escala: Escala | null
}

export interface DashboardData {
  totalFuncionariosAtivos: number
  totalSetores: number
  totalEscalasMes: number
  totalFolgasHoje: number
  setoresComEscala: SetorComEscala[]
}

export function useHomeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoje = new Date()
    const mes = hoje.getMonth() + 1
    const ano = hoje.getFullYear()
    const dataHoje = hoje.toISOString().split('T')[0]

    Promise.all([
      supabase
        .from('funcionarios')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true),
      supabase
        .from('setores')
        .select('*')
        .order('nome_setor'),
      supabase
        .from('escalas')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano),
      supabase
        .from('folgas')
        .select('*', { count: 'exact', head: true })
        .eq('data', dataHoje),
    ]).then(([
      { count: totalFuncionariosAtivos },
      { data: setores },
      { data: escalasDoMes },
      { count: totalFolgasHoje },
    ]) => {
      const setoresComEscala: SetorComEscala[] = (setores ?? []).map(setor => ({
        setor,
        escala: escalasDoMes?.find(e => e.id_setor === setor.id) ?? null,
      }))

      setData({
        totalFuncionariosAtivos: totalFuncionariosAtivos ?? 0,
        totalSetores: setores?.length ?? 0,
        totalEscalasMes: escalasDoMes?.length ?? 0,
        totalFolgasHoje: totalFolgasHoje ?? 0,
        setoresComEscala,
      })
      setLoading(false)
    })
  }, [])

  return { data, loading }
}
