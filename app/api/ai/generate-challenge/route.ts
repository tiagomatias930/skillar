import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type ChallengeGenerationRequest = {
  tema?: string
  dificuldade?: 'facil' | 'medio' | 'dificil'
  tecnologia?: string
  tipo?: 'programacao' | 'design' | 'analise' | 'outro'
}

export async function POST(request: NextRequest) {
  try {
    const body: ChallengeGenerationRequest = await request.json()

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!apiKey) {
      console.error('[v0] Gemini API key not configured. Expected one of: GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY, GOOGLE_API_KEY')
      return NextResponse.json({ error: 'Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY.' }, { status: 400 })
    }

    const prompt = `Gere um desafio de programação completo com as seguintes especificações:

Tema: ${body.tema || 'Tecnologia em geral'}
Dificuldade: ${body.dificuldade || 'médio'}
Tecnologia: ${body.tecnologia || 'qualquer tecnologia'}
Tipo: ${body.tipo || 'programação'}

Por favor, retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "titulo": "Título criativo e atrativo do desafio",
  "descricao": "Descrição detalhada do desafio, explicando o objetivo e requisitos",
  "criterios_avaliacao": ["Critério 1", "Critério 2", "Critério 3"],
  "dificuldade": "${body.dificuldade || 'medio'}",
  "tecnologias_sugeridas": ["Tecnologia 1", "Tecnologia 2"],
  "tempo_estimado": "X horas/dias",
  "prompts_aceitos": "Poder usar até X números de prompt de IA para ajudar na resolução do desafio"
}`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error('[v0] Gemini error:', res.status, txt?.slice?.(0, 2000))
      return NextResponse.json({ error: 'Gemini API error', debug: { status: res.status, body: txt?.slice?.(0, 2000) } }, { status: 502 })
    }

    const json = await res.json()

    let outputText = ''
    try {
      if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
        outputText = json.candidates[0].content.parts[0].text
      } else if (json?.candidates?.[0]?.content?.parts) {
        outputText = json.candidates[0].content.parts.map((p: any) => p.text || '').join('\n')
      }
    } catch (e) {
      console.error('[v0] Failed to extract text from Gemini response:', e)
    }

    // try to parse JSON from output
    let parsed: any = null
    try {
      let maybeJson = (outputText || '').trim()
      if (maybeJson.startsWith('```json')) {
        maybeJson = maybeJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
      } else if (maybeJson.startsWith('```')) {
        maybeJson = maybeJson.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
      }

      const start = maybeJson.indexOf('{')
      const end = maybeJson.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        parsed = JSON.parse(maybeJson.slice(start, end + 1))
      } else if (maybeJson.startsWith('{')) {
        parsed = JSON.parse(maybeJson)
      }
    } catch (e) {
      console.error('[v0] Failed to parse Gemini output as JSON:', e)
    }

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse model output as JSON', debug: { outputSnippet: (outputText || '').slice(0, 2000), jsonSnippet: JSON.stringify(json?.candidates || json).slice(0,2000) } }, { status: 200 })
    }

    // Minimal validation and normalization
    const challenge = {
      titulo: parsed.titulo || parsed.title || 'Sem título',
      descricao: parsed.descricao || parsed.description || '',
      criterios_avaliacao: Array.isArray(parsed.criterios_avaliacao) ? parsed.criterios_avaliacao : (Array.isArray(parsed.criteria) ? parsed.criteria : []),
      dificuldade: parsed.dificuldade || body.dificuldade || 'medio',
      tecnologias_sugeridas: Array.isArray(parsed.tecnologias_sugeridas) ? parsed.tecnologias_sugeridas : (Array.isArray(parsed.technologies) ? parsed.technologies : []),
      tempo_estimado: parsed.tempo_estimado || parsed.estimated_time || 'Não especificado',
      prompts_aceitos: parsed.prompts_aceitos || parsed.allowed_prompts || 'Não especificado'
    }

    return NextResponse.json(challenge)
  } catch (err) {
    console.error('Generate challenge error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
