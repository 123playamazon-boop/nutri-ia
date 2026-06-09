# Nutri IA — MVP

Aplicativo de dieta com Inteligência Artificial. MVP focado em validar três funcionalidades:

1. Plano alimentar personalizado de 7 dias (GPT-4o)
2. Registro de peso com gráfico de evolução
3. Diário alimentar com estimativa nutricional por foto (Vision)

## Stack

- Next.js 15, React, TypeScript, TailwindCSS, shadcn/ui
- Supabase (Auth + Database)
- OpenAI API (GPT-4o + Vision)
- Stripe (assinatura mensal)
- Vercel deploy ready

## Setup

```bash
cd nutri-ia
npm install --cache .npm-cache
cp .env.example .env.local
```

### Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute `supabase/schema.sql` no SQL Editor
3. Ative Google OAuth em Authentication > Providers
4. Configure redirect URL: `http://localhost:3000/auth/callback`

### Stripe

1. Crie produtos/preços mensais (BRL e USD) no [Stripe Dashboard](https://dashboard.stripe.com)
2. Configure webhook: `POST /api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Rodar

```bash
npm run dev
```

## Fluxo

1. **Cadastro** — Google ou email
2. **Assinatura** — R$ 39,90 ou US$ 9.90/mês via Stripe
3. **Onboarding** — Perfil + gerar plano
4. **Dashboard** — Peso, plano, gráfico
5. **Diário** — Texto ou foto com estimativa IA
6. **Chat** — Nutricionista IA

## Deploy Vercel

1. Push para GitHub
2. Importe no Vercel
3. Configure todas as variáveis de `.env.example`
4. Atualize redirect URLs no Supabase e Stripe

## Estrutura

```
src/
├── app/           # Pages + API routes
├── components/    # UI components
├── lib/           # OpenAI, Stripe, Supabase
└── types/         # TypeScript types
```
