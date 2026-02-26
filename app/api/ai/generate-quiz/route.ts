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

    // Accept multiple possible env var names to be more robust across deployments
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.VITY_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error('[v0] Gemini API key not configured. Expected one of: GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY, GOOGLE_API_KEY')
      return NextResponse.json({ success: false, error: 'Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY.' }, { status: 400 })
    }

    const apiBase = 'https://generativelanguage.googleapis.com'

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

    // Try multiple model names for resilience (same models as generate-challenge)
    const modelCandidates = [
      'gemini-3.0-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
    ]

    let json: any = null
    let usedModel: string | undefined
    let lastError: { status?: number; body?: string; model?: string } | null = null

    for (const model of modelCandidates) {
      const url = `${apiBase}/v1beta/models/${model}:generateContent?key=${apiKey}`

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        }
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const text = await res.text()
          lastError = { status: res.status, body: text?.slice?.(0, 2000), model }
          // If model not found or invalid model name, try next candidate
          if (res.status === 404 || (res.status === 400 && /model|not\s*found|invalid/i.test(text || ''))) {
            continue
          }
          // Rate limit or transient error — try next model
          if (res.status === 429 || res.status === 503) {
            continue
          }
          console.error('[v0] Gemini error:', model, res.status, text?.slice?.(0, 2000))
          continue // try next model instead of failing immediately
        }

        json = await res.json()
        usedModel = model
        break
      } catch (fetchErr) {
        lastError = { status: 0, body: String(fetchErr), model }
        continue
      }
    }

    if (!json) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API error - all models failed',
        debug: { ...(lastError || {}), attemptedModels: modelCandidates }
      }, { status: 502 })
    }

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
