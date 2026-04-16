import { useState } from "react"
import { UserPlus } from "lucide-react"
import { FormField } from "@/components/layout/FormField"
import { ModalBase } from "@/components/shared/ModalBase"
import { ModalHeader } from "@/components/shared/ModalHeader"
import { ModalFormActions } from "@/components/shared/ModalFormActions"

interface ManagerModalProps {
  onClose: () => void
  onCreate: (payload: { email: string; password: string; nome: string }) => Promise<boolean>
}

export function ManagerModal({ onClose, onCreate }: ManagerModalProps) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ nome?: string; email?: string; password?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!nome.trim()) next.nome = "O nome é obrigatório."
    if (!email.trim()) next.email = "O e-mail é obrigatório."
    if (!password || password.length < 6) next.password = "A senha deve ter no mínimo 6 caracteres."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    const ok = await onCreate({ nome: nome.trim(), email: email.trim(), password })
    setIsSaving(false)

    if (ok) onClose()
  }

  return (
    <ModalBase onClose={onClose}>

      <ModalHeader
        isEdit={false}
        createIcon={<UserPlus size={20} className="text-primary" strokeWidth={1.5} />}
        title="Novo Gerente"
        subtitle="Preencha os dados de acesso do gerente"
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <FormField
            id="nome"
            label="Nome"
            type="text"
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: undefined })) }}
            required
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FormField
            id="email"
            label="E-mail"
            type="email"
            placeholder="Ex: joao@empresa.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
            required
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FormField
            id="password"
            label="Senha inicial"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
            required
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <ModalFormActions
          isSaving={isSaving}
          onCancel={onClose}
          submitLabel="Criar gerente"
        />

      </form>
    </ModalBase>
  )
}
