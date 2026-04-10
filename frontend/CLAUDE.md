# CLAUDE.md — Escala de Folgas

Contexto completo do projeto para uso em novas sessões.

---

## Sobre o projeto

Sistema web para **geração automática de escala de folgas** de uma padaria. O sistema é usado exclusivamente pelo dono e pelos gerentes — funcionários não têm acesso.

Regras de negócio principais:
- Nenhum funcionário pode trabalhar mais de **6 dias consecutivos** (regra central do algoritmo)
- Cada setor tem um **mínimo de funcionários trabalhando por dia** (`minimo_por_dia`)
- A escala é gerada por **setor** e por **mês** separadamente
- A escala tem status `rascunho` (gerada, em revisão) ou `publicada` (confirmada)
- Dias bloqueados (`dias_bloqueados`) em uma escala impedem qualquer folga naquele dia da semana

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
    ProtectedRoute.tsx       ← Guard de rota (protege rotas autenticadas)
    useAuth.ts               ← Hook de sessão: { session, loading } + onAuthStateChange
  components/
    layout/
      Navbar.tsx             ← Navbar com botão de logout e toggle de tema
      FormField.tsx          ← Campo de formulário reutilizável (Label + Input)
      PageHeader.tsx         ← Cabeçalho padrão de página (ícone + título + subtítulo + ação)
      PageLayout.tsx         ← Wrapper de página: bg, gradientes decorativos, Navbar, container
      SectionDivider.tsx     ← Divisor decorativo (linha + ponto + linha)
      SelectField.tsx        ← Campo de select reutilizável (Label + Select)
    shared/
      DeleteConfirmModal.tsx ← Modal genérico de confirmação de exclusão
      EmptyState.tsx         ← Estado vazio padrão (ícone + título + descrição + ação opcional)
      FeedbackBanner.tsx     ← Banner inline de sucesso/erro (usa FeedbackMessage)
      ModalBase.tsx          ← Base reutilizável para modais (backdrop + fechar)
    ui/                      ← Componentes shadcn (não editar manualmente):
                               button, dialog, input, label, select
  config/
    supabaseClient.ts        ← Inicialização do cliente Supabase
  context/
    ThemeContext.tsx         ← Provider de tema (light/dark, persiste em localStorage)
    themeContextDef.ts       ← Definição do ThemeContext (evita dependência circular)
  hooks/
    useFeedback.ts           ← Hook de feedback inline: { feedback, showFeedback }
    useTheme.ts              ← Hook para consumir ThemeContext
  lib/
    utils.ts                 ← Utilitário cn() do shadcn (merge de classes Tailwind)
  pages/
    Login.tsx                ← Página de login
    Home.tsx                 ← Página principal (protegida)
    setores/
      components/
        SetorCard.tsx        ← Card de exibição de um setor (com skeleton)
        SetorModal.tsx       ← Modal de criação/edição de setor
        DeleteConfirm.tsx    ← Dialog de confirmação de exclusão (legado, ver shared/)
      hooks/
        useSetores.ts        ← Hook com toda a lógica de estado e mutations de setores
      index.tsx              ← Página de listagem de setores
    funcionarios/
      components/
        FuncionarioCard.tsx  ← Card de exibição de funcionário (com skeleton)
        FuncionarioModal.tsx ← Modal de criação/edição de funcionário
        DeleteConfirm.tsx    ← Dialog de confirmação local
      hooks/
        useFuncionarios.ts   ← Hook com lógica de estado e mutations de funcionários
      index.tsx              ← Página de listagem de funcionários (com filtros setor/ativo)
    escalas/
      components/
        EscalaCard.tsx       ← Card de exibição de escala (com skeleton)
        EscalaModal.tsx      ← Modal de criação/edição de escala
      hooks/
        useEscalas.ts        ← Hook de listagem e mutations de escalas (com filtros)
      index.tsx              ← Página de listagem de escalas
      detail/
        components/
          EscalaGrid.tsx     ← Grid funcionário × dia com células clicáveis
        hooks/
          useEscalaDetail.ts ← Hook de detalhe: fetch, algoritmo, toggleFolga, publicar
        index.tsx            ← Página de detalhe da escala (gerar, visualizar, publicar)
  styles/
    index.css                ← CSS global (Tailwind + variáveis de tema)
  types/
    database.ts              ← Tipos TypeScript de todas as entidades (Row/Insert/Update)
  App.tsx                    ← Roteamento principal + ThemeProvider
  main.tsx                   ← Entry point
```

### Convenção de organização por feature (pages/)

Cada feature de página segue a estrutura:
```
pages/<feature>/
  components/   ← componentes usados apenas por esta página
  hooks/        ← hooks de estado/lógica usados apenas por esta página
  index.tsx     ← o componente de página em si (rota)
```

Componentes compartilhados entre páginas ficam em `src/components/shared/` ou `src/components/layout/`.

---

## Rotas

| Path | Componente | Protegida |
|---|---|---|
| `/` | Login | Não |
| `/home` | Home + ProtectedRoute | Sim |
| `/setores` | Setores + ProtectedRoute | Sim |
| `/funcionarios` | Funcionarios + ProtectedRoute | Sim |
| `/escalas` | Escalas + ProtectedRoute | Sim |
| `/escalas/:id` | EscalaDetail + ProtectedRoute | Sim |

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
- Reatividade de sessão: `supabase.auth.onAuthStateChange()` (em `useAuth.ts`)
- JWT armazenado automaticamente no localStorage pelo SDK
- O SDK renova o token automaticamente

---

## Banco de dados

### Schema completo

```sql
CREATE TABLE setores (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_setor     text NOT NULL,
  minimo_por_dia int  NOT NULL DEFAULT 1,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE funcionarios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_funcionario  text NOT NULL,
  id_setor          uuid NOT NULL REFERENCES setores(id),
  ativo             boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE escalas (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_setor         uuid NOT NULL REFERENCES setores(id),
  mes              int  NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano              int  NOT NULL CHECK (ano >= 2024),
  status           text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada')),
  dias_bloqueados  text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz DEFAULT now(),
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

- `ON DELETE CASCADE` em `folgas.id_escala`: deletar uma escala deleta todas as folgas vinculadas
- `UNIQUE (id_funcionario, data)` em folgas: impede duas folgas no mesmo dia para o mesmo funcionário
- `UNIQUE (id_setor, mes, ano)` em escalas: só existe uma escala por setor por mês
- `dias_bloqueados` em escalas: array de dias da semana (`'seg'|'ter'|'qua'|'qui'|'sex'|'sab'`) nos quais ninguém pode ter folga
- `minimo_por_dia` em setores: o algoritmo e o toggle manual verificam esse mínimo antes de atribuir folga
- Funcionários inativos (`ativo = false`) não entram na geração da escala

### RLS

- Ainda não configurada — próxima etapa pendente
- Como só gestores acessam o sistema, as policies serão simples: qualquer usuário autenticado tem acesso total a todas as tabelas

### Trigger existente

Trigger no Supabase que popula `profiles` automaticamente quando um usuário é criado em `auth.users`.

---

## Algoritmo de geração de escala

Implementado em `src/pages/escalas/detail/hooks/useEscalaDetail.ts` na função `generateFolgas`.

**Regra central:** nenhum funcionário pode trabalhar mais de 6 dias consecutivos.

**Estratégia (dia a dia):**
1. Dias bloqueados (`dias_bloqueados`): ninguém recebe folga, todos incrementam o contador de consecutivos.
2. Para cada dia livre:
   - **Obrigatório** (consecutivo ≥ 6): deve receber folga.
   - **Urgente** (consecutivo = 5): recebe folga se ainda há capacidade (buffer de 1 dia).
   - Dentro de cada nível os funcionários são embaralhados (distribuição justa).
   - Limite de folgas por dia: `total_funcionarios - minimo_por_dia`.
3. **Carry-over do mês anterior:** ao gerar, busca o número de dias consecutivos que cada funcionário estava trabalhando no final do mês anterior (mesma consulta ao Supabase).

**Toggle manual:** na página de detalhe o usuário pode clicar em qualquer célula para adicionar/remover folga, respeitando `minimo_por_dia` e `dias_bloqueados`.

---

## O que está pendente

1. **RLS policies** nas 4 tabelas (`setores`, `funcionarios`, `escalas`, `folgas`)
