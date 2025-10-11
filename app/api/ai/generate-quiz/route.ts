import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type GenerateRequest = {
  competitionId: string
  title: string
  description: string
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json()
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GOOGLE_GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    // Build a simple prompt asking Gemini to generate 3 multiple-choice or short answer quiz questions
    const prompt = `Gere 3 perguntas de pré-avaliação (português) para o desafio a seguir. Cada pergunta deve ter: id curto, enunciado, tipo ("short" ou "mcq"), e se for mcq, 4 opções e a resposta correta (0-3). Retorne apenas JSON com um array "questions": [{...}].\n\nTítulo: ${body.title}\nDescrição: ${body.description}`

    const payload = {
      temperature: 0.2,
      candidateCount: 1,
      maxOutputTokens: 800,
      prompt: {
        text: prompt
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Gemini error:', res.status, text)
      return NextResponse.json({ success: false, error: 'Gemini API error' }, { status: 502 })
    }

    const json = await res.json()

    // The response format may vary; try to extract text output
    let outputText = ''
    try {
      // v1beta generateContent returns `candidates` with `output` text
      outputText = json?.candidates?.[0]?.output?.[0]?.content?.[0]?.text || json?.candidates?.[0]?.content || json?.output || ''
    } catch (e) {
      outputText = ''
    }

    // Try to find JSON inside outputText
    let questions = []
    try {
      const maybeJson = outputText.trim()
      if (maybeJson.startsWith('{') || maybeJson.startsWith('[')) {
        const parsed = JSON.parse(maybeJson)
        questions = parsed.questions || parsed
      } else {
        // attempt to locate a JSON substring
        const start = maybeJson.indexOf('{')
        const end = maybeJson.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          const parsed = JSON.parse(maybeJson.slice(start, end + 1))
          questions = parsed.questions || parsed
        }
      }
    } catch (e) {
      console.error('Failed to parse Gemini output as JSON:', e)
    }

    return NextResponse.json({ success: true, questions })
  } catch (err) {
    console.error('Generate quiz error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
