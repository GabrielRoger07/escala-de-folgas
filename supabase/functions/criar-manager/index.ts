import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? ""
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
  }
  return headers
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Cria cliente com service_role para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 2. Cria cliente com o token do usuário logado para validar quem está chamando
    const authHeader = req.headers.get("Authorization")

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: corsHeaders })
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // 3. Busca o usuário logado
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: corsHeaders })
    }

    // 4. Verifica se é CEO e pega o id_empresa
    const { data: usuarioCeo, error: ceoError } = await supabaseAdmin
      .from("usuarios")
      .select("user_role, id_empresa")
      .eq("id", user.id)
      .single()

    if (ceoError || !usuarioCeo) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404, headers: corsHeaders })
    }

    if (usuarioCeo.user_role !== "ceo") {
      return new Response(JSON.stringify({ error: "Apenas CEOs podem criar managers" }), { status: 403, headers: corsHeaders })
    }

    // 5. Lê os dados do novo manager
    const { email, password, nome } = await req.json()

    if (!email || !password || !nome) {
      return new Response(JSON.stringify({ error: "email, password e nome são obrigatórios" }), { status: 400, headers: corsHeaders })
    }

    // 6. Cria o manager com a mesma empresa do CEO
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        full_name: nome,
        id_empresa: usuarioCeo.id_empresa,
        user_role: "manager",
      },
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ id: data.user.id, email: data.user.email, nome }), { status: 201, headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders })
  }
})
