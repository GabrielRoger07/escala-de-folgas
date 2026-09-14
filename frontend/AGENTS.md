# AGENTS.md — Escala de Folgas

Contexto técnico do sistema para agentes que trabalham neste repositório.

---

## Visão geral

O projeto gera escalas mensais de folgas para uma empresa. O usuário informa um setor apenas como identificação, escolhe o mês e o ano, define os dias da semana em que ninguém poderá folgar e adiciona os funcionários pelo nome. Os funcionários e a escala existem somente na memória do navegador.

O frontend monta o período e o histórico, envia o problema ao solver FastAPI e apresenta as folgas retornadas em uma tabela. O resultado pode ser baixado em PDF.

Não existem perfis ou níveis de permissão. Qualquer sessão válida do Supabase Auth pode acessar as páginas protegidas.

## Limites do domínio

- `Usuário`: conta autenticada pelo Supabase Auth, sem papel ou perfil.
- `Funcionário da escala`: registro local com UUID, nome e última folga opcional. Não corresponde a uma linha do banco.
- `Setor`: texto livre usado para identificar a escala na interface e no PDF. Não integra o payload do solver.
- `Escala`: resultado temporário retornado pelo FastAPI. Não é salva, publicada nem editada.
- `Dia sem folga`: dia da semana, de segunda a sábado, em que o solver deve manter todos trabalhando.
- `Última folga`: data opcional do mês imediatamente anterior ao período escolhido, usada para calcular o histórico de dias consecutivos.

---

## Arquitetura e stack

### Frontend

- React 19, TypeScript e Vite.
- React Router DOM v7.
- Tailwind CSS v4 com `@tailwindcss/vite`.
- Componentes shadcn/ui no estilo `radix-nova`.
- Lucide React para ícones.
- Supabase JS somente para autenticação e recuperação de senha.
- `html-to-image` e `jsPDF` para exportação no navegador.

### Backend

- Python 3.14 no contêiner.
- FastAPI e Pydantic.
- OR-Tools CP-SAT para modelagem e resolução.
- Uvicorn na porta 8000.
- CORS configurado por `ALLOWED_ORIGINS`.

### Supabase

O Supabase não armazena dados da escala. O projeto usa:

- Supabase Auth para login, sessão, logout e redefinição de senha;
- a Edge Function `recuperar-senha` para iniciar a recuperação sem revelar se o e-mail existe;
- o script administrativo `scripts/create-user.js` para criar contas sem perfil para uma empresa.

---

## Estrutura atual

```text
backend/
  Dockerfile
  main.py
  requirements.txt

frontend/
  src/
    auth/
      ProtectedRoute.tsx
      useAuth.ts
    components/
      layout/
      shared/
      ui/
    config/
      supabaseClient.ts
    context/
      ThemeContext.tsx
      themeContextDef.ts
    hooks/
      useFeedback.ts
      useTheme.ts
    pages/
      Login.tsx
      ForgotPassword.tsx
      ResetPassword.tsx
      Home.tsx
      escala/
        components/
          FuncionarioEscalaRow.tsx
          TabelaFolgas.tsx
          PdfTabelaFolgas.tsx
        hooks/
          useGeracaoEscala.ts
          useExportEscalaPdf.ts
        index.tsx
        utils.ts
    styles/
      index.css
    App.tsx
    main.tsx

scripts/
  create-user.js

supabase/
  functions/
    recuperar-senha/
      index.ts
```

A feature de escala segue a organização `pages/<feature>/components`, `hooks`, `utils.ts` e `index.tsx`. Componentes reutilizados fora da feature ficam em `components/layout` ou `components/shared`.

---

## Rotas e autenticação

| Rota | Acesso | Função |
|---|---|---|
| `/login` | Pública | Autenticação por e-mail e senha |
| `/forgot-password` | Pública | Solicitação do link de redefinição |
| `/reset-password` | Pública | Definição de nova senha |
| `/home` | Protegida | Apresentação do fluxo e acesso à escala |
| `/escala` | Protegida | Formulário, geração, resultado e PDF |

Qualquer rota desconhecida redireciona para `/home`. Caso não exista uma sessão válida, `ProtectedRoute` redireciona para `/login`.

O `useAuth` carrega a sessão com `supabase.auth.getSession()` e acompanha alterações com `supabase.auth.onAuthStateChange()`. Não consulte `user_role`, `id_empresa` ou a tabela `usuarios` para autorizar o acesso.

---

## Fluxo da escala

1. A página começa com o mês e o ano atuais e uma linha vazia de funcionário.
2. O usuário informa setor, período, dias sem folga e funcionários.
3. Cada funcionário recebe um UUID gerado por `crypto.randomUUID()`. Esse UUID relaciona o nome local às folgas retornadas.
4. A última folga aceita somente datas do mês anterior ao período escolhido.
5. Ao mudar o período, nomes são preservados e datas que saíram do novo intervalo são apagadas.
6. O formulário exige setor, pelo menos um funcionário e nome em todas as linhas. Nomes duplicados são permitidos.
7. O frontend envia o payload para `${VITE_SOLVER_URL}/gerar`.
8. Em caso de sucesso, a tabela agrupa e ordena as folgas por UUID.
9. O resultado guarda um instantâneo do payload, setor, período e nomes usados na requisição.
10. Se o payload mudar, a tela marca o resultado como desatualizado. Alterar apenas o setor ou o texto do nome não exige nova execução do solver.
11. O PDF representa o instantâneo do resultado. Se ele estiver desatualizado, a interface pede confirmação antes do download.
12. Recarregar ou abandonar a página descarta formulário e resultado.

Não há chamadas ao Supabase durante esse fluxo.

---

## Contrato do solver

### Requisição

`POST /gerar`

```ts
type GerarRequestPayload = {
  funcionarios: string[]
  days: string[]
  quantidadeDiasConsecutivos: number
  prevConsecutive: Record<string, number>
  diasBloqueados: Array<"seg" | "ter" | "qua" | "qui" | "sex" | "sab">
}
```

- `funcionarios`: UUIDs locais, na ordem visual.
- `days`: todas as datas do mês em `YYYY-MM-DD`.
- `quantidadeDiasConsecutivos`: valor enviado atualmente como `6`.
- `prevConsecutive`: dias trabalhados após a última folga até o fim do mês anterior, limitados ao intervalo de 0 a 6. Sem data informada, o valor é 0.
- `diasBloqueados`: dias da semana escolhidos na interface.

### Resposta

```ts
type GerarResponse = {
  ok: boolean
  folgas: Array<{
    id_funcionario: string
    data: string
  }>
  error?: string | null
}
```

O frontend trata como erro respostas HTTP malsucedidas, objetos fora desse contrato, `ok: false` e sucessos sem folgas. Uma tentativa que falha não apaga o resultado anterior.

---

## Regras atuais do solver

Restrições obrigatórias:

- ninguém folga nos dias da semana bloqueados;
- nenhuma sequência pode conter oito dias consecutivos de trabalho, portanto o limite rígido atual é sete;
- o histórico do mês anterior participa da restrição do início do período;
- cada funcionário recebe exatamente um domingo de folga;
- as folgas de domingo são distribuídas de forma equilibrada;
- um funcionário não recebe folgas em dias consecutivos;
- cada funcionário recebe quatro ou cinco folgas no mês.

Objetivos de otimização:

- equilibrar a quantidade de trabalho entre os funcionários;
- preferir quatro folgas quando cinco não forem necessárias;
- evitar várias folgas no mesmo dia;
- aumentar o espaçamento entre as folgas;
- penalizar sequências de sete dias trabalhados;
- favorecer uma folga após seis dias consecutivos.

O valor `quantidadeDiasConsecutivos: 6` orienta o objetivo de espaçamento. A restrição rígida implementada em `backend/main.py` proíbe oito dias seguidos e ainda permite sete. Não documente o valor 6 como limite rígido enquanto o modelo permanecer assim.

O solver usa até 30 segundos e oito workers. Quando não encontra solução viável, responde com `ok: false` e uma mensagem em `error`.

---

## Resultado e PDF

A tabela de resultado:

- mantém a ordem original dos funcionários;
- usa uma coluna por UUID, inclusive quando os nomes se repetem;
- ordena as folgas cronologicamente;
- formata cada data como `DD/MM - DDD`;
- preenche com `—` as células sem folga correspondente.

O PDF é gerado inteiramente no navegador. O hook renderiza uma versão própria da tabela fora da área visível, converte o HTML em PNG e cria uma página de tamanho personalizado com o jsPDF. O arquivo segue o padrão:

```text
escala-<setor-normalizado>-<mes>-<ano>.pdf
```

Não inclua no PDF o payload, controles da interface ou avisos de desatualização.

---

## Variáveis de ambiente

### Raiz, usada pelo Docker Compose

```dotenv
ALLOWED_ORIGINS=http://localhost:3000
```

### `frontend/.env`

```dotenv
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
VITE_SOLVER_URL=http://localhost:8000
VITE_SITE_URL=http://localhost:3000
```

### `scripts/.env`

```dotenv
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend nem em variáveis prefixadas com `VITE_`.

A Edge Function usa `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `ALLOWED_ORIGINS` no ambiente do Supabase.

---

## Execução local

### Backend com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

A API fica disponível em `http://localhost:8000`. Para encerrar:

```bash
docker compose down
```

### Backend sem Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O Vite usa `http://localhost:3000`.

### Script de criação de usuário

Preencha `NOVO_USUARIO` em `scripts/create-user.js` e execute:

```bash
cd scripts
npm install
node create-user.js
```

O script usa a service role e deve permanecer fora do código enviado ao navegador.

---

## Convenções de implementação

- Preserve o contrato do endpoint `POST /gerar` ao alterar frontend ou backend.
- Mantenha os dados da escala somente em estado local, a menos que uma nova persistência seja solicitada.
- Use os componentes existentes de layout, feedback e modal antes de criar equivalentes.
- Mantenha os componentes específicos da escala dentro de `pages/escala`.
- Use `@/` para imports internos do frontend.
- Mantenha a identidade visual, os temas claro e escuro e o comportamento responsivo.
- Não edite componentes de `components/ui` sem necessidade; eles são a base do shadcn/ui.
- Preserve o resultado anterior quando uma nova geração ou exportação falhar.
- Não adicione infraestrutura de testes ou dependências sem solicitação. O projeto não possui suíte automatizada.

## Verificação

Para alterações no frontend:

```bash
cd frontend
npx eslint <arquivos-alterados>
npm run build
```

Para alterações no backend ou na integração:

```bash
python -m py_compile backend/main.py
docker compose config
```

Para o script administrativo:

```bash
node --check scripts/create-user.js
```

Além dos comandos, confirme o fluxo afetado no navegador. Não considere a geração válida sem verificar o body enviado, o tratamento da resposta e a preservação do resultado em caso de erro.
