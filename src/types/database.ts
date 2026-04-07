// ─────────────────────────────────────────────────────────────────────────────
// Tipos das entidades do banco de dados
//
// Cada entidade tem três variantes:
//   Row    → o que o Supabase retorna em um SELECT
//   Insert → o que você envia em um INSERT (campos gerados pelo banco são opcionais)
//   Update → o que você envia em um UPDATE (todos os campos são opcionais)
// ─────────────────────────────────────────────────────────────────────────────

export type EscalaStatus = 'rascunho' | 'publicada'

// ── Setor ────────────────────────────────────────────────────────────────────

export type Setor = {
  id: string
  nome_setor: string
  minimo_por_dia: number
  created_at: string
}

export type SetorInsert = {
  nome_setor: string
  minimo_por_dia: number
}

export type SetorUpdate = {
  id: string
  nome_setor: string
  minimo_por_dia: number
}

// ── Funcionário ───────────────────────────────────────────────────────────────

export type Funcionario = {
  id: string
  nome: string
  id_setor: string
  ativo: boolean
  created_at: string
}

export type FuncionarioInsert = {
  nome: string
  id_setor: string
  ativo?: boolean
}

export type FuncionarioUpdate = {
  id: string
  nome: string
  id_setor: string
  ativo: boolean
}

// ── Escala ────────────────────────────────────────────────────────────────────

export type Escala = {
  id: string
  id_setor: string
  mes: number
  ano: number
  status: EscalaStatus
  created_at: string
}

export type EscalaInsert = {
  id_setor: string
  mes: number
  ano: number
  status?: EscalaStatus
}

export type EscalaUpdate = {
  id: string
  id_setor: string
  mes: number
  ano: number
  status: EscalaStatus
}

// ── Folga ─────────────────────────────────────────────────────────────────────

export type Folga = {
  id: string
  id_funcionario: string
  id_escala: string
  data: string
  created_at: string
}

export type FolgaInsert = {
  id_funcionario: string
  id_escala: string
  data: string
}

export type FolgaUpdate = {
  id: string
  id_funcionario: string
  id_escala: string
  data: string
}