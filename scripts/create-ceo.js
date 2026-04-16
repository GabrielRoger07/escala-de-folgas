import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos em scripts/.env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ─── Preencha os dados do CEO aqui ───────────────────────────────────────────

const NOVO_CEO = {
  email: '',
  password: '',
  nome: '',
  id_empresa: '',
}

// ─────────────────────────────────────────────────────────────────────────────

const { data, error } = await supabase.auth.admin.createUser({
  email: NOVO_CEO.email,
  password: NOVO_CEO.password,
  email_confirm: true,
  user_metadata: {
    nome: NOVO_CEO.nome,
    full_name: NOVO_CEO.nome,
    id_empresa: NOVO_CEO.id_empresa,
    user_role: 'ceo',
  },
})

if (error) {
  console.log(error)
  console.error('Erro ao criar CEO:', error.message)
  process.exit(1)
}

console.log('CEO criado com sucesso!')
console.log('ID:', data.user.id)
console.log('Email:', data.user.email)
console.log('Nome:', data.user.user_metadata.nome)
console.log('Empresa:', data.user.user_metadata.id_empresa)