# KitchenHub

App de gerenciamento de despensa: PWA instalável, feita pra ser usada tanto no
celular (inclusive fora de casa, no mercado) quanto num navegador em casa.
Stack 100% JS/TS pensada pra deploy direto no Vercel.

## Stack

- **Next.js 15** (App Router) + TypeScript - frontend e API no mesmo projeto
- **Prisma + Postgres** (Neon, Vercel Postgres ou Prisma Postgres) - banco gerenciado, serverless-friendly
- **NextAuth (Google)** - login restrito por allowlist de email (`ALLOWED_EMAILS`)
- **Tailwind CSS** - visual moderno, dark mode automático
- **PWA** - instalável no celular, manifest gerado pelo Next (`src/app/manifest.ts`)
- **html5-qrcode** - leitura de código de barras pela câmera

> A versão anterior (Raspberry Pi + Python/FastAPI + SQLite, com launcher para
> YouTube/streams) foi arquivada em [`legacy-raspberry-pi/`](legacy-raspberry-pi)
> e não é mais mantida.

## Estrutura

```
src/
├── app/
│   ├── page.tsx             # despensa
│   ├── receitas/page.tsx    # receitas salvas
│   ├── signin/page.tsx      # login
│   ├── manifest.ts          # manifest da PWA (inclui shortcuts)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── items/                    # CRUD + alerts + categories
│       ├── recipes/                  # CRUD de receitas
│       ├── purchases/                # registro de gastos + balanco
│       └── barcode/[code]/route.ts   # proxy Open Food Facts
├── components/     # ItemCard, ItemForm, ShoppingListPanel, BalancePanel, RecipesApp...
├── lib/            # prisma client, regras de negocio (pantry/recipes/purchases), auth
├── middleware.ts   # protege todas as rotas (paginas + API) por sessao
└── types/          # tipos compartilhados

prisma/schema.prisma  # Item, ConsumptionLog, Recipe, RecipeIngredient, Purchase
```

## Modelo de dados

**Item**: nome, quantidade, unidade, categoria, código de barras, estoque
mínimo, validade, última compra.

**ConsumptionLog**: todo evento que muda o estoque (criação, compra, consumo,
ajuste) fica registrado — é o histórico de consumo.

Status (`ok` / `acabando` / `vencendo` / `vencido`) é calculado on-the-fly em
[`src/lib/status.ts`](src/lib/status.ts), nunca guardado no banco.

**Recipe** (receita): título, porções que rende, modo de preparo, lista de
`RecipeIngredient` (nome livre + quantidade + unidade — não precisa ser um
item da despensa).

**Purchase**: valor total gasto numa ida ao mercado (registrado ao final da
lista de compras), usado pra montar o balanço de gastos.

## Setup local

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Banco:** crie um projeto gratuito em [neon.tech](https://neon.tech) (ou
   use Vercel Postgres) e copie a connection string **pooled**.
3. **Google OAuth:** em
   [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials),
   crie um "OAuth client ID" tipo *Web application* com redirect URI
   `http://localhost:3000/api/auth/callback/google`.
4. Copie `.env.example` para `.env.local` e preencha `DATABASE_URL`,
   `NEXTAUTH_SECRET` (`openssl rand -base64 32`), `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET` e `ALLOWED_EMAILS` (seu email).
5. **Aplique o schema no banco.** Mais simples (sem migration files, bom pra
   comecar e pra sincronizar mudancas de schema rapido):
   ```bash
   npx prisma db push
   ```
   Ou, se preferir manter historico de migracoes versionado:
   ```bash
   npx prisma migrate dev --name init
   ```
6. **Rode:**
   ```bash
   npm run dev
   ```

## Deploy no Vercel

1. Suba o projeto num repositório Git e importe no [vercel.com/new](https://vercel.com/new)
   (o Vercel detecta Next.js automaticamente).
2. Nas configurações do projeto, adicione um banco: **Storage → Postgres**
   (Vercel Postgres/Neon) — isso já injeta `DATABASE_URL` automaticamente.
3. Em **Settings → Environment Variables**, adicione as demais variáveis do
   `.env.example` (`NEXTAUTH_SECRET`, `NEXTAUTH_URL` = URL do seu deploy,
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS`).
4. No Google Cloud Console, adicione o redirect URI de produção:
   `https://<seu-app>.vercel.app/api/auth/callback/google`.
5. Depois do primeiro deploy, aplique o schema no banco de produção:
   ```bash
   npx prisma migrate deploy
   ```
   (rode localmente com `DATABASE_URL` apontando pro banco de produção, ou via
   `vercel env pull` para puxar as variáveis).
6. Acesse a URL do deploy, entre com sua conta Google e instale como PWA
   (menu do navegador → "Adicionar à tela inicial"/"Instalar app").

## Autenticação

Login é só com Google, restrito aos emails em `ALLOWED_EMAILS` (separados por
vírgula) — qualquer outra conta Google recebe "Acesso bloqueado". O
middleware ([`src/middleware.ts`](src/middleware.ts)) protege **todas** as
páginas e rotas de API: sem sessão válida, API responde 401 e páginas
redirecionam pro login.

## Resumo da despensa

No topo da tela principal, uma saudação com o nome de quem logou e três
cartões (itens na despensa, itens que precisam de atenção, gasto do mês) —
os dois últimos são clicáveis e já abrem os alertas / o balanço.

## Lista de compras

O botão "🛒 Lista de compras" mostra os itens acabando/vencendo/vencidos
(mesma lógica dos alertas) com checkbox em cada um — pensado pra usar no
celular dentro do mercado, marcando conforme vai pegando os itens. As marcações
ficam salvas no `localStorage` do navegador (por dispositivo, não sincroniza
entre celular/tela da cozinha) e um botão "Limpar" reseta pra próxima ida ao
mercado.

## Leitor de código de barras

No formulário de novo/editar item, o botão 📷 abre a câmera (via
`html5-qrcode`) e consulta a Open Food Facts (gratuita, sem chave) pra
pré-preencher nome e categoria. Funciona melhor no celular.

## Receitas

Na aba "Receitas", salve pratos com título, quantas porções rendem, modo de
preparo e a lista de ingredientes (nome + quantidade + unidade, livre — não
precisa bater com os itens da despensa).

## Balanço de gastos

Ao final da lista de compras (🛒), tem um campo pra registrar quanto você
gastou naquela ida ao mercado. O botão "💰 Balanço" mostra o total gasto no
mês, o total geral e as últimas compras — cada lançamento pode ser excluído
se você errar um valor.

## Atalhos na tela inicial (PWA)

Depois de instalar o app, segurar o ícone (Android) ou clicar com o botão
direito nele (desktop) mostra atalhos direto pra "Lista de compras", "Novo
item" e "Receitas" — configurados em [`src/app/manifest.ts`](src/app/manifest.ts).
Os dois primeiros abrem `/?open=lista` / `/?open=novo`, que o
[`PantryApp`](src/components/PantryApp.tsx) lê ao carregar pra já abrir o
painel certo.
