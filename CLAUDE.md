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
- **Estilo:** CSS puro com variáveis (sem framework)
- **Dev server:** porta 3000

---

## Estrutura de pastas

```
src/
  auth/
    Wrapper.tsx        ← Guard de rota (protege rotas autenticadas)
  components/
    Navbar.tsx         ← Navbar com botão de logout
  config/
    supabaseClient.ts  ← Inicialização do cliente Supabase
  pages/
    Login.tsx          ← Página de login
    Home.tsx           ← Página principal (protegida)
  App.tsx              ← Roteamento principal
  main.tsx             ← Entry point
```

---

## Rotas

| Path | Componente | Protegida |
|---|---|---|
| `/` | Login | Não |
| `/home` | Home + Wrapper | Sim |

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
- Verificação de sessão: `supabase.auth.onAuthStateChange()` (reativo, preferir sobre `getSession`)
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

1. **Correções no código existente**
   - `Wrapper.tsx`: substituir `getSession()` por `onAuthStateChange()` e tipar o prop `children`
   - `Login.tsx`: exibir mensagem de erro ao usuário em vez de só logar no console
   - `supabaseClient.ts`: adicionar validação das variáveis de ambiente

2. **RLS policies** nas 4 tabelas (`setores`, `funcionarios`, `escalas`, `folgas`)

3. **Frontend — páginas a construir**
   - Cadastro e listagem de setores
   - Cadastro e listagem de funcionários por setor
   - Geração de escala por setor/mês
   - Visualização da escala gerada

4. **Algoritmo de geração automática de escala**
   - Respeitar 1 folga por semana por funcionário
   - Garantir pelo menos 1 domingo por mês por funcionário
   - Respeitar `minimo_por_dia` por setor
   - Não gerar folga para funcionários inativos
