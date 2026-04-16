import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/config/supabaseClient"
import { useFeedback } from "@/hooks/useFeedback"
import type { Manager } from "@/types/database"

export type ModalState = { open: false } | { open: true }

export function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<Manager | null>(null)
  const [changePasswordTarget, setChangePasswordTarget] = useState<Manager | null>(null)
  const { feedback, showFeedback } = useFeedback()

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchManagers = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email, nome, user_role, id_empresa")
      .eq("user_role", "manager")
      .order("nome", { ascending: true })

    setIsLoading(false)
    if (error) {
      showFeedback("Erro ao carregar gerentes. Tente recarregar a página.", "error")
      return
    }
    setManagers((data as Manager[]) ?? [])
  }, [showFeedback])

  useEffect(() => {
    const loadManagers = async () => { 
      await fetchManagers() 
    }
    
    loadManagers()
  }, [fetchManagers])

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function createManager(payload: { email: string; password: string; nome: string }): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()

    console.log("session:", session)
    console.log("access_token:", session?.access_token)

    const { data, error } = await supabase.functions.invoke("criar-manager", {
      body: payload,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })

    console.log("response data:", data)
    console.log("response error:", error)

    if (error) {
      showFeedback("Erro ao criar gerente. Tente novamente.", "error")
      return false
    }

    showFeedback("G criado com sucesso.", "success")
    await fetchManagers()
    return true
  }

  async function deleteManager(manager: Manager): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.functions.invoke("deletar-manager", {
      body: { manager_id: manager.id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })

    if (error) {
      showFeedback("Erro ao excluir gerente. Tente novamente.", "error")
      return false
    }

    showFeedback(`Gerente "${manager.nome}" excluído com sucesso.`, "success")
    await fetchManagers()
    return true
  }

  async function changeManagerPassword(managerId: string, password: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.functions.invoke("alterar-senha-manager", {
      body: { manager_id: managerId, password },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })

    if (error) {
      showFeedback("Erro ao alterar senha. Tente novamente.", "error")
      return false
    }

    showFeedback("Senha alterada com sucesso.", "success")
    return true
  }

  // ── Modal handlers ────────────────────────────────────────────────────────

  function openCreate() { setModalState({ open: true }) }
  function closeModal() { setModalState({ open: false }) }

  return {
    managers,
    isLoading,
    feedback,
    modalState,
    deleteTarget,
    setDeleteTarget,
    changePasswordTarget,
    setChangePasswordTarget,
    openCreate,
    closeModal,
    createManager,
    deleteManager,
    changeManagerPassword,
  }
}
