# Nutri IA — deploy na Vercel

## Variáveis de ambiente (Vercel Dashboard → Settings → Environment Variables)

```
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BRL=
STRIPE_PRICE_USD=
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
RESEND_API_KEY=
EMAIL_FROM=Nutri IA <contato@seudominio.com>
```

Para demo (opcional):
```
NEXT_PUBLIC_DEMO_MODE=true
```

## Stripe Webhook (produção)

URL: `https://seu-dominio.vercel.app/api/stripe/webhook`

Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Supabase

Em Authentication → URL Configuration, adicione:
- Site URL: `https://seu-dominio.vercel.app`
- Redirect URLs: `https://seu-dominio.vercel.app/auth/callback`
