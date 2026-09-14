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

// ─── Preencha os dados do usuário aqui ──────────────────────────────────────

const NOVO_USUARIO = {
  email: '',
  password: '',
  nome: '',
}

// ─────────────────────────────────────────────────────────────────────────────

const { data, error } = await supabase.auth.admin.createUser({
  email: NOVO_USUARIO.email,
  password: NOVO_USUARIO.password,
  email_confirm: true,
  user_metadata: {
    nome: NOVO_USUARIO.nome,
    full_name: NOVO_USUARIO.nome,
  },
})

if (error) {
  console.log(error)
  console.error('Erro ao criar usuário:', error.message)
  process.exit(1)
}

console.log('Usuário criado com sucesso!')
console.log('ID:', data.user.id)
console.log('E-mail:', data.user.email)
console.log('Nome:', data.user.user_metadata.nome)
