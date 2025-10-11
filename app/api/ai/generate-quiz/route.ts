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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyCtQepXWZWuwOSiDOBohmpNZDfylhRUQAk"

    if (!apiKey) {
      console.error('[v0] GOOGLE_GEMINI_API_KEY not configured')
      return NextResponse.json({ success: false, error: 'GOOGLE_GEMINI_API_KEY not configured' }, { status: 400 })
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
      const truncated = text?.toString?.().slice(0, 2000)
      console.error('[v0] Gemini error:', res.status, truncated)
      return NextResponse.json({ success: false, error: 'Gemini API error', debug: { status: res.status, body: truncated } }, { status: 502 })
    }

    const json = await res.json()

    // The response format may vary; try to extract text output
    let outputText = ''
    try {
      // v1beta generateContent often returns `candidates` with nested content
      outputText = json?.candidates?.[0]?.output?.[0]?.content?.[0]?.text || json?.candidates?.[0]?.content || json?.output || ''
      if (!outputText && json?.candidates?.[0]?.content) {
        // try to coerce content array to text
        const content = json.candidates[0].content
        if (Array.isArray(content)) {
          outputText = content.map((c:any) => c.text || c).join('\n')
        }
      }
    } catch (e) {
      outputText = ''
    }

    // Try to find JSON inside outputText
    let questions: any[] = []
    let parseError: any = null
    try {
      const maybeJson = (outputText || '').trim()
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
      parseError = String(e)
      console.error('[v0] Failed to parse Gemini output as JSON:', e)
    }

    if (!questions || questions.length === 0) {
      const safeOutput = (outputText || '').toString().slice(0, 2000)
      const safeJson = JSON.stringify(json?.candidates ? json.candidates : json).slice(0, 2000)
      return NextResponse.json({ success: false, error: 'Failed to parse model output as questions', debug: { parseError, outputSnippet: safeOutput, jsonSnippet: safeJson } }, { status: 200 })
    }

    return NextResponse.json({ success: true, questions })
  } catch (err) {
    console.error('Generate quiz error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
