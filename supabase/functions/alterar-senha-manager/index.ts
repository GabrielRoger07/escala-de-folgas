import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Cria cliente com service_role para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 2. Valida o token do usuário logado
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

    // 4. Verifica se é CEO
    const { data: usuarioCeo, error: ceoError } = await supabaseAdmin
      .from("usuarios")
      .select("user_role, id_empresa")
      .eq("id", user.id)
      .single()

    if (ceoError || !usuarioCeo) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404, headers: corsHeaders })
    }

    if (usuarioCeo.user_role !== "ceo") {
      return new Response(JSON.stringify({ error: "Apenas CEOs podem alterar senhas de managers" }), { status: 403, headers: corsHeaders })
    }

    // 5. Lê os dados da requisição
    const { manager_id, password } = await req.json()

    if (!manager_id || !password) {
      return new Response(JSON.stringify({ error: "manager_id e password são obrigatórios" }), { status: 400, headers: corsHeaders })
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "A senha deve ter no mínimo 6 caracteres" }), { status: 400, headers: corsHeaders })
    }

    // 6. Verifica se o manager alvo pertence à mesma empresa do CEO
    const { data: usuarioManager, error: managerError } = await supabaseAdmin
      .from("usuarios")
      .select("user_role, id_empresa")
      .eq("id", manager_id)
      .single()

    if (managerError || !usuarioManager) {
      return new Response(JSON.stringify({ error: "Manager não encontrado" }), { status: 404, headers: corsHeaders })
    }

    if (usuarioManager.user_role !== "manager") {
      return new Response(JSON.stringify({ error: "O usuário alvo não é um manager" }), { status: 400, headers: corsHeaders })
    }

    if (usuarioManager.id_empresa !== usuarioCeo.id_empresa) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 403, headers: corsHeaders })
    }

    // 7. Atualiza a senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(manager_id, { password })

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders })
  }
})