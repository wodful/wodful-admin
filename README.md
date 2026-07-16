# Wodful Admin

Painel de administração da plataforma Wodful (controle de contas e acesso).

## Stack

- Next.js (App Router)
- Tailwind CSS
- TanStack Query
- TypeScript

## Desenvolvimento

1. API rodando em `http://localhost:3333`
2. Configure `.env.local` (veja `.env.exemple`)
3. Na API, rode a migration e promova um admin:

```bash
cd ../wodful-api
yarn migrate
```

4. Suba o admin:

```bash
npm run dev
```

Abre em [http://localhost:3001](http://localhost:3001).

### Qualidade

```bash
npm run check   # lint + typecheck
npm run lint
npm run typecheck
```

## Deploy (Vercel + admin.wodful.com)

### 1. Projeto na Vercel

1. Importe o repositório na Vercel.
2. **Root Directory:** `wodful-admin`
3. Framework: Next.js (detectado automaticamente)
4. Build Command: `npm run build`
5. Output: padrão Next.js

### 2. Environment Variables (Production)

| Nome | Valor |
|------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API de produção + `/api` (mesma base do `VITE_BASE_API_URL` do `wodful-web`) |

Exemplo: `https://seu-host-da-api/api`
