import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { message, fileBase64, fileName, client, chatId } = body

    let extraText = ''

    // 🔥 PDF PARSER (FIX DEFINITIVO)
    if (fileBase64 && fileName && fileName.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfParse = (await import('pdf-parse')).default

        const buffer = Buffer.from(fileBase64, 'base64')
        const data = await pdfParse(buffer)

        extraText = `\n\nContenido del PDF:\n${data.text.slice(0, 15000)}`
      } catch (err) {
        console.log('❌ Error leyendo PDF:', err)
      }
    }

    // 🧠 CONTEXTO DEL CLIENTE
    let clientContext = ''

    if (client) {
      clientContext = `
==============================
📌 EXPEDIENTE (CLIENTE REAL)
==============================
Nombre: ${client.name || 'No disponible'}
Email: ${client.email || 'No disponible'}
DPI: ${client.dpi || 'No disponible'}
ID cliente: ${client.id || 'No disponible'}
==============================

IMPORTANTE:
El expediente pertenece al cliente, no al chat.
==============================
`
    }

    const prompt = `
${clientContext}

==============================
📁 CHAT ID
${chatId || 'No definido'}
==============================

MENSAJE DEL ABOGADO:
${message || 'Sin mensaje'}

${extraText}

==============================
INSTRUCCIONES DEL ASISTENTE JURÍDICO (GUATEMALA)
==============================

Actúa como un asistente jurídico para abogados en Guatemala. Tu función es:

- Analizar información de casos legales
- Detectar vacíos de información
- Ordenar hechos
- Sugerir acciones legales
- Generar borradores de documentos jurídicos

IMPORTANTE:
• No inventes información
• No asumas datos
• Todo es BORRADOR sin validez legal
• El expediente real es el CLIENTE

==============================
ESTRUCTURA OBLIGATORIA
==============================
1. Análisis del caso
2. Hechos
3. Personas involucradas
4. Vacíos de información
5. Clasificación jurídica
6. Riesgos
7. Recomendación
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await response.json()

    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      reply =
        data?.error?.code === 429
          ? '⚠️ La IA está saturada, intenta en unos segundos.'
          : 'La IA no pudo responder correctamente'
    }

    return Response.json({ reply })

  } catch (error) {
    console.log('❌ ERROR GENERAL:', error)

    return Response.json({
      reply: 'Error interno del servidor',
    })
  }
}



