# KitchenHub

App de gerenciamento de despensa: PWA instalável, feita pra ser usada tanto no
celular (inclusive fora de casa, no mercado) quanto num navegador em casa.
Stack 100% JS/TS pensada pra deploy direto no Vercel.

## Stack

- **Next.js 15** (App Router) + TypeScript - frontend e API no mesmo projeto
- **Prisma + Postgres** (Neon / Vercel Postgres) - banco gerenciado, serverless-friendly
- **NextAuth (Google)** - login restrito por allowlist de email (`ALLOWED_EMAILS`)
- **Tailwind CSS** - visual moderno, dark mode automático
- **PWA** - instalável no celular, manifest gerado pelo Next (`src/app/manifest.ts`)
- **html5-qrcode** - leitura de código de barras pela câmera
- **Nodemailer** - envio da lista de compras por email

> A versão anterior (Raspberry Pi + Python/FastAPI + SQLite, com launcher para
> YouTube/streams) foi arquivada em [`legacy-raspberry-pi/`](legacy-raspberry-pi)
> e não é mais mantida.

## Estrutura

```
src/
├── app/
│   ├── page.tsx            # tela principal (despensa)
│   ├── signin/page.tsx      # login
│   ├── manifest.ts          # manifest da PWA
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── items/                    # CRUD + alerts + categories
│       ├── history/route.ts          # historico global
│       ├── barcode/[code]/route.ts   # proxy Open Food Facts
│       └── shopping-list/send/route.ts
├── components/     # ItemCard, ItemForm, BarcodeScanner, Badge, Header...
├── lib/            # prisma client, regras de negocio (pantry.ts), auth, email
├── middleware.ts   # protege todas as rotas (paginas + API) por sessao
└── types/item.ts   # tipos compartilhados

prisma/schema.prisma  # modelo de dados (Item, ConsumptionLog)
```

## Modelo de dados

**Item**: nome, quantidade, unidade, categoria, código de barras, estoque
mínimo, validade, última compra.

**ConsumptionLog**: todo evento que muda o estoque (criação, compra, consumo,
ajuste) fica registrado — é o histórico de consumo.

Status (`ok` / `acabando` / `vencendo` / `vencido`) é calculado on-the-fly em
[`src/lib/status.ts`](src/lib/status.ts), nunca guardado no banco.

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
5. **Aplique o schema no banco:**
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
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS`, e as `SMTP_*`
   se for usar o envio de lista por email).
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

## Lista de compras por email

O botão "📧 Enviar lista" manda por email os itens acabando/vencendo/vencidos
(mesma lógica dos alertas). Precisa das variáveis `SMTP_*` configuradas (veja
`.env.example` — funciona com Gmail usando uma
["senha de app"](https://myaccount.google.com/apppasswords)). Sem essas
variáveis, o botão mostra um aviso claro em vez de falhar silenciosamente.

## Leitor de código de barras

No formulário de novo/editar item, o botão 📷 abre a câmera (via
`html5-qrcode`) e consulta a Open Food Facts (gratuita, sem chave) pra
pré-preencher nome e categoria. Funciona melhor no celular.
