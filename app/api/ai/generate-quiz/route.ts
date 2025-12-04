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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[v0] GOOGLE_GEMINI_API_KEY not configured')
      return NextResponse.json({ success: false, error: 'GOOGLE_GEMINI_API_KEY not configured' }, { status: 400 })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    // Build a simple prompt asking Gemini to generate 3 multiple-choice or short answer quiz questions
    const prompt = `Gere 3 perguntas de pré-avaliação (português) para o desafio a seguir. Cada pergunta deve ter: question (texto da pergunta), options (array de 4 strings se for múltipla escolha), answer (número 0-3 indicando índice da resposta correta se for múltipla escolha, ou null se for resposta curta).

Retorne APENAS um JSON válido no formato:
{
  "questions": [
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": 0},
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": 1},
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": 2}
  ]
}

Título do desafio: ${body.title}
Descrição: ${body.description}`

    // Correct payload structure for Gemini API v1beta
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
        candidateCount: 1
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

    // Extract text from Gemini's response structure: candidates[0].content.parts[0].text
    let outputText = ''
    try {
      if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
        outputText = json.candidates[0].content.parts[0].text
      } else if (json?.candidates?.[0]?.content?.parts) {
        // Concatenate all parts if multiple
        outputText = json.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('\n')
      }
    } catch (e) {
      console.error('[v0] Failed to extract text from Gemini response:', e)
      outputText = ''
    }

    // Try to find JSON inside outputText
    let questions: any[] = []
    let parseError: any = null
    try {
      let maybeJson = (outputText || '').trim()
      
      // Remove markdown code blocks if present
      if (maybeJson.startsWith('```json')) {
        maybeJson = maybeJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
      } else if (maybeJson.startsWith('```')) {
        maybeJson = maybeJson.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
      }
      
      maybeJson = maybeJson.trim()
      
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
