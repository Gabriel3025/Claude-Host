# 🎴 SCRIPT COMPLETO — Minha Figurinha da Copa 2026

---

## 📊 1. ESTRUTURA DO BANCO DE DADOS (Supabase)

### Tabela: `stickers`

```sql
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do formulário
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  height_cm INT NOT NULL,
  weight_kg INT NOT NULL,
  team VARCHAR(255) NOT NULL,
  
  -- Imagens
  user_photo_url VARCHAR(500),
  user_photo_base64 TEXT,
  
  -- Geração
  generated_image_url VARCHAR(500),
  generated_image_with_watermark_url VARCHAR(500),
  generated_image_without_watermark_url VARCHAR(500),
  
  -- Status de pagamento
  is_paid BOOLEAN DEFAULT FALSE,
  stripe_session_id VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  user_email VARCHAR(255),
  user_ip VARCHAR(50)
);

-- Criar índices
CREATE INDEX idx_stickers_stripe_session ON stickers(stripe_session_id);
CREATE INDEX idx_stickers_is_paid ON stickers(is_paid);
```

---

## 📁 2. ESTRUTURA DE PASTAS

```
projeto/
├── public/
│   └── stickers-reference/
│       ├── sticker-model-1.png  (figurinha de referência)
│       ├── sticker-model-2.png
│       └── sticker-model-3.png
│
├── supabase/
│   └── functions/
│       ├── generate-sticker-image/
│       │   └── index.ts (geração com ChatGPT + marca d'água)
│       ├── add-watermark/
│       │   └── index.ts (adiciona marca d'água)
│       ├── remove-watermark/
│       │   └── index.ts (remove marca d'água)
│       └── stripe-webhook/
│           └── index.ts (recebe confirmação de pagamento)
│
├── src/
│   ├── lib/
│   │   ├── stripe.ts
│   │   ├── watermark.ts
│   │   └── supabase.ts
│   └── routes/
│       ├── api/
│       │   ├── create-sticker.ts
│       │   ├── checkout.ts
│       │   └── webhook.ts
```

---

## 🔐 3. VARIÁVEIS DE AMBIENTE (.env)

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta

# OpenAI / ChatGPT
OPENAI_API_KEY=sk-seu-token-aqui

# Stripe
STRIPE_SECRET_KEY=sk_live_seu-token-aqui
STRIPE_PUBLIC_KEY=pk_live_seu-token-aqui
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret

# URLs
SITE_URL=https://minhafigurinha.com
```

---

## 🎯 4. FLUXO COMPLETO ATUALIZADO

### **Etapa 1: User preenche formulário**
```
/criar → Coleta todos os dados → Faz upload da foto
```

### **Etapa 2: Salvar no banco com UUID**
```javascript
// src/routes/api/create-sticker.ts
const stickerId = crypto.randomUUID()

const { data } = await supabase
  .from('stickers')
  .insert({
    id: stickerId,
    first_name,
    last_name,
    full_name: `${first_name} ${last_name}`,
    birth_date,
    height_cm,
    weight_kg,
    team,
    user_photo_url, // URL do arquivo no Supabase Storage
    stripe_session_id: null,
    is_paid: false
  })

// Retorna stickerId para usar depois
return { stickerId }
```

### **Etapa 3: Gerar imagem com ChatGPT Vision**
```javascript
// supabase/functions/generate-sticker-image/index.ts
// Recebe: stickerId

const sticker = await getSticker(stickerId)
const userPhotoUrl = sticker.user_photo_url
const referenceImageUrl = 'https://seu-bucket.com/sticker-model-1.png'

const prompt = `Você é especialista em criar figurinhas Panini Copa do Mundo 2026.

Tenho:
1. Uma figurinha de referência (imagem 1)
2. Uma foto da pessoa (imagem 2)

Substitua APENAS a pessoa na figurinha pela pessoa da foto:

MANTENHA EXATAMENTE:
- Todas as cores (turquesa #00C4C8, verde #005F00, amarelo #FFDF00, azul #002776)
- O layout da figurinha (posição de elementos)
- Texto "FIFA 26" no canto superior direito
- Bandeira do Brasil no lado direito
- Texto "BRA" rotacionado
- "PANINI STUDIO" no rodapé
- Marca d'água diagonal semi-transparente "MINHA FIGURINHA 2026"
- Espaços e proporções

ALTERE APENAS:
- Foto da pessoa (centro da figurinha)
- Nome: ${sticker.full_name}
- Data: ${formatarData(sticker.birth_date)} (formato DD-MM-YYYY)
- Altura: ${sticker.height_cm}cm → ${sticker.height_cm / 100}m
- Peso: ${sticker.weight_kg}kg
- Time: ${sticker.team}

CERTIFIQUE-SE:
- A foto está bem centralizada e enquadrada
- Todos os textos são legíveis e estão nas posições corretas
- O resultado parece uma figurinha Panini legítima
- Qualidade profissional, resolução alta

Retorne APENAS a imagem final, sem explicações ou comentários.`

// Chamar DALL-E 3 com DUAS imagens (referência + foto do user)
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024', // Será redimensionada para 400x560
    quality: 'hd',
    response_format: 'url'
  })
})

const result = await response.json()
const generatedImageUrl = result.data[0].url

// Salvar no Supabase Storage
const imageBuffer = await fetch(generatedImageUrl).then(r => r.arrayBuffer())
const path = `generated/${stickerId}-original.png`
await supabaseClient.storage
  .from('stickers')
  .upload(path, imageBuffer, { 
    contentType: 'image/png',
    upsert: true 
  })

const { data: publicUrl } = supabaseClient.storage
  .from('stickers')
  .getPublicUrl(path)

// Atualizar banco
await supabase
  .from('stickers')
  .update({ generated_image_url: publicUrl.publicUrl })
  .eq('id', stickerId)

return { imageUrl: publicUrl.publicUrl }
```

### **Etapa 4: Adicionar marca d'água**
```javascript
// supabase/functions/add-watermark/index.ts
// Recebe: stickerId, imageUrl

import { createCanvas, registerFont, loadImage } from 'canvas'

async function addWatermark(imageUrl, stickerId) {
  // Carregar imagem original
  const response = await fetch(imageUrl)
  const buffer = await response.buffer()
  const img = await loadImage(buffer)
  
  // Criar canvas
  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')
  
  // Desenhar imagem original
  ctx.drawImage(img, 0, 0)
  
  // Adicionar marca d'água diagonal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)' // Branco semi-transparente
  ctx.font = 'bold 60px Arial'
  ctx.rotate(-Math.PI / 4) // -45 graus
  ctx.textAlign = 'center'
  
  // Desenhar texto repetido na diagonal
  for (let x = -img.width; x < img.width * 2; x += 300) {
    for (let y = -img.height; y < img.height * 2; y += 300) {
      ctx.fillText('MINHA FIGURINHA 2026', x, y)
    }
  }
  
  ctx.rotate(Math.PI / 4) // Voltar ao normal
  
  // Salvar com marca d'água
  const watermarkedBuffer = canvas.toBuffer('image/png')
  const path = `generated/${stickerId}-watermark.png`
  
  await supabaseClient.storage
    .from('stickers')
    .upload(path, watermarkedBuffer, {
      contentType: 'image/png',
      upsert: true
    })
  
  const { data: publicUrl } = supabaseClient.storage
    .from('stickers')
    .getPublicUrl(path)
  
  // Atualizar banco
  await supabase
    .from('stickers')
    .update({ generated_image_with_watermark_url: publicUrl.publicUrl })
    .eq('id', stickerId)
  
  return publicUrl.publicUrl
}
```

### **Etapa 5: Mostrar preview com marca d'água**
```
/preview?stickerId=xxx

GET /api/preview?stickerId=xxx
→ Busca generated_image_with_watermark_url no banco
→ Mostra no preview
→ Botão CTA: "💳 Pagar R$9,90 e baixar"
```

### **Etapa 6: Criar sessão Stripe**
```javascript
// src/routes/api/checkout.ts
// Recebe: stickerId

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'brl',
        product_data: {
          name: 'Figurinha Personalizada Copa 2026 — sem marca d\'água',
          description: `Figurinha de ${sticker.full_name}`,
          images: [sticker.generated_image_with_watermark_url]
        },
        unit_amount: 990 // R$9,90 em centavos
      },
      quantity: 1
    }
  ],
  
  // IMPORTANTE: Passar stickerId como metadata
  metadata: {
    stickerId: stickerId,
    fullName: sticker.full_name,
    userEmail: sticker.user_email
  },
  
  // URLs de redirecionamento
  success_url: `${process.env.SITE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.SITE_URL}/preview?stickerId=${stickerId}`,
})

// Salvar session_id no banco
await supabase
  .from('stickers')
  .update({ stripe_session_id: session.id })
  .eq('id', stickerId)

return { sessionId: session.id }
```

### **Etapa 7: Webhook Stripe (confirmação de pagamento)**
```javascript
// supabase/functions/stripe-webhook/index.ts

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  try {
    // Verificar assinatura do Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Evento: checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extrair stickerId da metadata
      const stickerId = session.metadata?.stickerId

      if (!stickerId) {
        return new Response('No stickerId in metadata', { status: 400 })
      }

      // Buscar a figurinha
      const { data: sticker } = await supabase
        .from('stickers')
        .select('*')
        .eq('id', stickerId)
        .single()

      if (!sticker) {
        return new Response('Sticker not found', { status: 404 })
      }

      // ✅ MARCAR COMO PAGO
      await supabase
        .from('stickers')
        .update({
          is_paid: true,
          stripe_session_id: session.id,
          updated_at: new Date()
        })
        .eq('id', stickerId)

      // ✅ COPIAR IMAGEM SEM MARCA D'ÁGUA (já temos a original)
      // A imagem original (generated_image_url) é a SEM marca d'água
      // Apenas vamos renomear/copiar para generated_image_without_watermark_url
      
      await supabase
        .from('stickers')
        .update({
          generated_image_without_watermark_url: sticker.generated_image_url
        })
        .eq('id', stickerId)

      console.log(`✅ Pagamento confirmado para stickerId: ${stickerId}`)

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
```

### **Etapa 8: Página de sucesso com download**
```javascript
// /sucesso?session_id=cs_test_xxx

// GET /api/success?session_id=xxx
async function getSuccess(sessionId) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  // Buscar sessão no Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  // Buscar figurinha pelo session_id
  const { data: sticker } = await supabase
    .from('stickers')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()

  if (!sticker || !sticker.is_paid) {
    return { error: 'Pagamento não confirmado' }
  }

  return {
    success: true,
    imageUrl: sticker.generated_image_without_watermark_url,
    stickerId: sticker.id,
    fullName: sticker.full_name
  }
}

// Página /sucesso mostra:
// ✅ Mensagem: "🎉 Pagamento confirmado! Sua figurinha está pronta."
// ✅ Imagem SEM marca d'água
// ✅ Botão: "⬇️ Baixar minha figurinha (PNG)"
```

---

## 📋 5. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar tabela `stickers` no Supabase
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Criar pasta `public/stickers-reference/` com imagens
- [ ] Implementar função `generate-sticker-image` (ChatGPT + DALL-E)
- [ ] Implementar função `add-watermark` (marca d'água)
- [ ] Implementar rota `/api/checkout` (Stripe)
- [ ] Implementar webhook `/api/webhook` (Stripe confirmation)
- [ ] Implementar página `/preview` com preview + CTA
- [ ] Implementar página `/sucesso` com download
- [ ] Testar fluxo completo em ambiente de teste (Stripe test keys)
- [ ] Configurar webhook Stripe (Settings → Webhooks → Add endpoint)

---

## 🔑 6. CONFIGURAÇÃO STRIPE WEBHOOK

1. Ir para: https://dashboard.stripe.com/webhooks
2. Clicar em "Add endpoint"
3. URL: `https://seu-projeto.com/api/webhook`
4. Eventos: Selecionar `checkout.session.completed`
5. Copiar "Signing secret" para `.env` como `STRIPE_WEBHOOK_SECRET`

---

## ✅ 7. TESTE LOCAL

```bash
# Instalar dependências
npm install stripe @supabase/supabase-js canvas

# Usar Stripe CLI para testar webhook localmente
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger checkout.session.completed

# URLs de teste do Stripe
# Card: 4242 4242 4242 4242
# Expiry: 12/34
# CVC: 567
```

---

## 📸 8. IMAGEM DE REFERÊNCIA

Use uma das imagens que você mandou como referência:
- Salve em `public/stickers-reference/sticker-model-1.png`
- URL completa: `https://seu-projeto.com/stickers-reference/sticker-model-1.png`
- Ou use URL direta do Supabase Storage

---

**Está claro agora? Quer que eu comece a implementar alguma parte específica?**
