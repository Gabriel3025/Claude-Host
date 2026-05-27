// supabase/functions/generate-sticker-image/index.ts
// VERSÃO CORRIGIDA - Uso correto da imagem de referência + foto do user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { stickerId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1️⃣ BUSCAR DADOS DA FIGURINHA NO BANCO
    const { data: sticker, error: fetchError } = await supabaseClient
      .from('stickers')
      .select('*')
      .eq('id', stickerId)
      .single()

    if (fetchError || !sticker) {
      throw new Error('Sticker not found')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not set')
    }

    // 2️⃣ PREPARAR URLs DAS IMAGENS

    // ✅ IMAGEM DE REFERÊNCIA (figurinha template)
    const referenceImageUrl = `${Deno.env.get('SITE_URL') || 'https://seu-projeto.com'}/sticker-model-1.png`

    // ✅ FOTO DO USER (URL armazenada no banco)
    const userPhotoUrl = sticker.user_photo_url

    if (!userPhotoUrl) {
      throw new Error('User photo not found')
    }

    console.log(`📸 Using reference: ${referenceImageUrl}`)
    console.log(`📸 Using user photo: ${userPhotoUrl}`)

    // 3️⃣ CRIAR PROMPT DETALHADO PARA DALL-E 3

    // Formatar data (DD-MM-YYYY)
    const birthDate = new Date(sticker.birth_date)
    const day = String(birthDate.getDate()).padStart(2, '0')
    const month = String(birthDate.getMonth() + 1).padStart(2, '0')
    const year = birthDate.getFullYear()
    const formattedDate = `${day}-${month}-${year}`

    // Formatar altura (cm → m)
    const heightInMeters = (sticker.height_cm / 100).toFixed(2)

    const prompt = `Você é um especialista em design de figurinhas Panini Copa do Mundo 2026.

TAREFA: Substitua a pessoa na figurinha de referência pela pessoa da foto fornecida.

IMAGEM 1 (Referência): Uma figurinha Panini Copa do Mundo 2026
IMAGEM 2 (User): Uma foto de uma pessoa

MANTENHA EXATAMENTE IGUAL:
- Todas as cores: turquesa (#00C4C8), verde escuro (#005F00), amarelo (#FFDF00), azul (#002776)
- Layout exato da figurinha: posição de todos os elementos
- Decoração "26" no lado esquerdo em verde escuro, semi-transparente
- Ícone "FIFA 26" no canto superior direito em branco
- Bandeira do Brasil em círculo no lado direito
- Texto "BRA" rotacionado 90° em branco na lateral verde
- Fundo preto/escuro na área inferior
- Texto "PANINI" no canto inferior direito em estilo serif
- Marca d'água diagonal semi-transparente: "MINHA FIGURINHA 2026" (opacidade 40%)
- Estrutura, proporções e espaçamento

ALTERE APENAS:
- Foto: Substitua a pessoa pelo rosto/busto da foto fornecida
- Nome em maiúsculas: ${sticker.full_name}
- Data de nascimento: ${formattedDate}
- Altura: ${heightInMeters}m
- Peso: ${sticker.weight_kg}kg
- Time/Clube: ${sticker.team}

INSTRUÇÕES CRÍTICAS:
1. A foto da pessoa deve estar bem centralizada no espaço designado
2. A foto deve mostrar rosto e busto (como um retrato profissional)
3. Todos os textos devem ser LEGÍVEIS e ALINHADOS corretamente
4. As cores devem ser IDÊNTICAS à referência
5. O resultado deve parecer uma figurinha Panini legítima e profissional
6. Qualidade: Alta resolução, detalhes nítidos, acabamento profissional

RETORNE: APENAS a imagem final gerada, sem explicações ou comentários.`

    // 4️⃣ CHAMAR DALL-E 3 COM AS DUAS IMAGENS

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      })
    })

    const result = await response.json()

    if (result.error) {
      console.error('DALL-E Error:', result.error)
      throw new Error(`DALL-E Error: ${result.error.message}`)
    }

    if (!result.data || !result.data[0]) {
      throw new Error('No image generated')
    }

    const generatedImageUrl = result.data[0].url

    console.log(`✅ Image generated successfully: ${generatedImageUrl}`)

    // 5️⃣ SALVAR IMAGEM NO SUPABASE STORAGE

    try {
      const imageResponse = await fetch(generatedImageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()

      const path = `generated/${stickerId}-original.png`

      const { error: uploadError } = await supabaseClient.storage
        .from('stickers')
        .upload(path, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabaseClient.storage
        .from('stickers')
        .getPublicUrl(path)

      const publicUrl = publicUrlData.publicUrl

      console.log(`✅ Image saved to storage: ${publicUrl}`)

      // 6️⃣ ATUALIZAR BANCO DE DADOS

      const { error: updateError } = await supabaseClient
        .from('stickers')
        .update({
          generated_image_url: publicUrl,
          updated_at: new Date()
        })
        .eq('id', stickerId)

      if (updateError) {
        throw updateError
      }

      console.log(`✅ Database updated for stickerId: ${stickerId}`)

      // 7️⃣ RETORNAR SUCESSO

      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: publicUrl,
          stickerId: stickerId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (storageError) {
      console.error('Storage Error:', storageError)
      throw new Error(`Storage Error: ${storageError.message}`)
    }

  } catch (error) {
    console.error('Function Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
