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
    const { email, redirectTo } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail é obrigatório" }), { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Busca o usuário pelo e-mail em auth.users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders })
    }

    const authUser = users.find((u) => u.email === email)

    // Resposta genérica para não revelar se o e-mail existe ou não
    if (!authUser) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
    }

    // Busca o role do usuário na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .select("user_role")
      .eq("id", authUser.id)
      .single()

    if (usuarioError || !usuario || usuario.user_role !== "ceo") {
      // Também resposta genérica — não revela que o usuário existe mas não é CEO
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })
    }

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetError) {
      return new Response(JSON.stringify({ error: "Erro ao enviar e-mail" }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders })

  } catch {
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders })
  }
})
