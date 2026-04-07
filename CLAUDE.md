# CLAUDE.md — Escala de Folgas

Contexto completo do projeto para uso em novas sessões.

---

## Sobre o projeto

Sistema web para **geração automática de escala de folgas** de uma padaria. O sistema é usado exclusivamente pelo dono e pelos gerentes — funcionários não têm acesso.

Regras de negócio principais:
- Cada funcionário tem **1 folga por semana**
- Cada funcionário tem **pelo menos 1 domingo de folga por mês**
- Cada setor tem um **mínimo de funcionários trabalhando por dia** (`minimo_por_dia`)
- A escala é gerada por **setor** e por **mês** separadamente
- A escala tem status `rascunho` (gerada, em revisão) ou `publicada` (confirmada)

---

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Roteamento:** React Router DOM v7
- **BaaS:** Supabase (Auth + PostgreSQL)
- **UI:** shadcn/ui (estilo `radix-nova`, cor base `neutral`)
- **Estilização:** Tailwind CSS v4 (via plugin `@tailwindcss/vite`)
- **Ícones:** Lucide React (instalado pelo shadcn)
- **Dev server:** porta 3000

---

## Estrutura de pastas

```
src/
  auth/
    ProtectedRoute.tsx   ← Guard de rota (protege rotas autenticadas)
  components/
    layout/
      Navbar.tsx         ← Navbar com botão de logout
    ui/                  ← Componentes shadcn (gerados pelo CLI, não editar manualmente)
    FormField.tsx        ← Componente reutilizável de campo de formulário (Label + Input)
  config/
    supabaseClient.ts    ← Inicialização do cliente Supabase
  lib/
    utils.ts             ← Utilitário cn() do shadcn (merge de classes Tailwind)
  pages/
    Login.tsx            ← Página de login
    Home.tsx             ← Página principal (protegida)
    setores/
      components/        ← Componentes exclusivos da feature de setores
        SetorCard.tsx    ← Card de exibição de um setor (com skeleton)
        SetorModal.tsx   ← Modal de criação/edição de setor
        DeleteConfirm.tsx ← Dialog de confirmação de exclusão
      hooks/
        useSetores.ts    ← Hook com toda a lógica de estado e mutations de setores
      index.tsx          ← Página de listagem de setores
  styles/
    index.css            ← CSS global (Tailwind + variáveis de tema)
  types/
    database.ts          ← Tipos TypeScript de todas as entidades do banco (Row/Insert/Update)
  App.tsx                ← Roteamento principal
  main.tsx               ← Entry point
```

### Convenção de organização por feature (pages/)

Cada feature de página segue a estrutura:
```
pages/<feature>/
  components/   ← componentes usados apenas por esta página
  hooks/        ← hooks de estado/lógica usados apenas por esta página
  index.tsx     ← o componente de página em si (rota)
```

Componentes compartilhados entre páginas ficam em `src/components/`.

---

## Rotas

| Path | Componente | Protegida |
|---|---|---|
| `/` | Login | Não |
| `/home` | Home + ProtectedRoute | Sim |
| `/setores` | Setores + ProtectedRoute | Sim |

---

## shadcn/ui e Tailwind

### Configuração (`components.json`)

- **Estilo:** `radix-nova`
- **Cor base:** `neutral`
- **CSS variables:** habilitado
- **CSS entry:** `src/index.css`
- **Ícones:** `lucide`

### Aliases configurados

| Alias | Caminho |
|---|---|
| `@/components` | `src/components` |
| `@/components/ui` | `src/components/ui` |
| `@/lib` | `src/lib` |
| `@/hooks` | `src/hooks` |

### Como adicionar componentes

```bash
npx shadcn@latest add <componente>
# Exemplos:
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add select
```

Componentes são copiados para `src/components/ui/` e importados como:
```ts
import { Button } from '@/components/ui/button'
```

### Tailwind v4

- Instalado via plugin Vite (`@tailwindcss/vite`) — sem `tailwind.config.js`
- Configuração feita diretamente no `src/index.css` via `@import "tailwindcss"`
- O alias `@` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.app.json`)

---

## Supabase

### Variáveis de ambiente (`.env`)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

### Cliente (`src/config/supabaseClient.ts`)

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase env vars are missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Auth flow

- Login: `supabase.auth.signInWithPassword()`
- Logout: `supabase.auth.signOut()`
- Verificação de sessão: `supabase.auth.getSession()`
- JWT armazenado automaticamente no localStorage pelo SDK
- O SDK renova o token automaticamente

---

## Banco de dados

### Schema completo

```sql
CREATE TABLE setores (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome           text NOT NULL,
  minimo_por_dia int  NOT NULL DEFAULT 1,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE funcionarios (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  id_setor   uuid NOT NULL REFERENCES setores(id),
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE escalas (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_setor   uuid NOT NULL REFERENCES setores(id),
  mes        int  NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano        int  NOT NULL CHECK (ano >= 2024),
  status     text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (id_setor, mes, ano)
);

CREATE TABLE folgas (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_funcionario uuid NOT NULL REFERENCES funcionarios(id),
  id_escala      uuid NOT NULL REFERENCES escalas(id) ON DELETE CASCADE,
  data           date NOT NULL,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (id_funcionario, data)
);
```

### Relacionamentos

```
setores ──1:N──▶ funcionarios
setores ──1:N──▶ escalas
funcionarios ──1:N──▶ folgas
escalas ──1:N──▶ folgas (ON DELETE CASCADE)
```

### Observações importantes

- `ON DELETE CASCADE` em `folgas.id_escala`: deletar uma escala deleta todas as folgas vinculadas automaticamente
- `UNIQUE (id_funcionario, data)` em folgas: impede duas folgas no mesmo dia para o mesmo funcionário
- `UNIQUE (id_setor, mes, ano)` em escalas: só existe uma escala por setor por mês
- `minimo_por_dia` em setores: o algoritmo deve verificar que esse mínimo de funcionários esteja trabalhando em cada dia antes de atribuir folga
- Funcionários inativos (`ativo = false`) não devem entrar na geração da escala

### RLS

- Ainda não configurada — próxima etapa pendente
- Como só gestores acessam o sistema, as policies serão simples: qualquer usuário autenticado tem acesso total a todas as tabelas

### Trigger existente

Trigger no Supabase que popula `profiles` automaticamente quando um usuário é criado em `auth.users`.

---

## O que está pendente

1. **RLS policies** nas 4 tabelas (`setores`, `funcionarios`, `escalas`, `folgas`)

2. **Frontend — páginas a construir**
   - ~~Cadastro e listagem de setores~~ ✅ Concluído
   - Cadastro e listagem de funcionários por setor
   - Geração de escala por setor/mês
   - Visualização da escala gerada

3. **Algoritmo de geração automática de escala**
   - Respeitar 1 folga por semana por funcionário
   - Garantir pelo menos 1 domingo por mês por funcionário
   - Respeitar `minimo_por_dia` por setor
   - Não gerar folga para funcionários inativos
