'use client'

import { useEffect, useState } from 'react'

export default function CaseIntelligence({ chatId }: { chatId: string | null }) {
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!chatId) return

    const run = async () => {
      setLoading(true)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `
Analiza TODO el expediente actual y responde en este formato:

1. Resumen del caso
2. Qué está pasando jurídicamente
3. Documentos faltantes
4. Riesgos
5. Recomendación del abogado

NO inventes datos, usa solo lo que haya en el expediente.
          `,
          chatId
        })
      })

      const data = await res.json()

      setData(data.reply)
      setLoading(false)
    }

    run()
  }, [chatId])

  return (
    <div className="bg-zinc-950 p-4 rounded mb-3">
      <h2 className="font-bold mb-2">🧠 Inteligencia del expediente</h2>

      {loading ? (
        <p className="text-gray-400">Analizando expediente...</p>
      ) : (
        <pre className="text-sm whitespace-pre-wrap text-gray-300">
          {data}
        </pre>
      )}
    </div>
  )
}