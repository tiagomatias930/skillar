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

    console.log(apiKey);
    if (!apiKey) {
      console.error('[v0] Gemini API key not configured. Expected one of: GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY, GOOGLE_API_KEY')
      return NextResponse.json({ error: 'Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY.' }, { status: 400 })
    }

    const apiBase = ('https://generativelanguage.googleapis.com').replace(/\/+$/,'')

    const prompt = `Gere um desafio de programação completo com as seguintes especificações:

Tema: ${body.tema || 'Tecnologia em geral'}
Dificuldade: ${body.dificuldade || 'médio'}
Tecnologia: ${body.tecnologia || 'qualquer tecnologia'}
Tipo: ${body.tipo || 'programação'}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem explicações adicionais, sem comentários, sem markdown.

Estrutura esperada:
{
  "titulo": "Título criativo e atrativo do desafio",
  "descricao": "Descrição detalhada do desafio, explicando o objetivo e requisitos",
  "criterios_avaliacao": ["Critério 1", "Critério 2", "Critério 3"],
  "dificuldade": "${body.dificuldade || 'medio'}",
  "tecnologias_sugeridas": ["Tecnologia 1", "Tecnologia 2"],
  "tempo_estimado": "X horas/dias",
  "prompts_aceitos": "Poder usar até X números de prompt de IA para ajudar na resolução do desafio"
}`

    // Try multiple model names and correct endpoint path
    const modelCandidates = Array.from(new Set([
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ].filter(Boolean))) as string[]

    let json: any = null
    let usedModel: string | undefined
    let lastError: { status?: number; body?: string; model?: string } | null = null

    for (const model of modelCandidates) {
      const url = `${apiBase}/v1beta/models/${model}:generateContent?key=${apiKey}`

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const txt = await res.text()
        lastError = { status: res.status, body: txt?.slice?.(0, 2000), model }
        // If model not found or invalid model name, try next candidate
        if (res.status === 404 || (res.status === 400 && /model|not\s*found|invalid/i.test(txt || ''))) {
          continue
        }
        console.error('[v0] Gemini error:', model, res.status, txt?.slice?.(0, 2000))
        return NextResponse.json({ error: 'Gemini API error', debug: lastError }, { status: 502 })
      }

      json = await res.json()
      usedModel = model
      break
    }

    if (!json) {
      return NextResponse.json({ 
        error: 'Gemini API error', 
        debug: { ...(lastError || {}), attemptedModels: modelCandidates, apiBase } 
      }, { status: 502 })
    }

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
      
      // Remove markdown code blocks
      if (maybeJson.startsWith('```json')) {
        maybeJson = maybeJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
      } else if (maybeJson.startsWith('```')) {
        maybeJson = maybeJson.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
      }
      
      maybeJson = maybeJson.trim()

      // Try direct parsing first
      try {
        parsed = JSON.parse(maybeJson)
      } catch {
        // If direct parsing fails, try to extract JSON object
        const start = maybeJson.indexOf('{')
        const end = maybeJson.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          parsed = JSON.parse(maybeJson.slice(start, end + 1))
        }
      }
    } catch (e) {
      console.error('[v0] Failed to parse Gemini output as JSON:', {
        error: String(e),
        outputLength: outputText?.length,
        outputPreview: (outputText || '').slice(0, 500)
      })
    }

    // If parsing failed and output looks truncated, try a quick repair call
    if (!parsed) {
      const finishReason = json?.candidates?.[0]?.finishReason
      const looksTruncated = !(outputText || '').trim().endsWith('}')
      if (finishReason === 'MAX_TOKENS' || looksTruncated) {
        const repairPrompt = `O texto a seguir é um objeto JSON incompleto. Complete e corrija-o, retornando APENAS um JSON válido (sem markdown).\n\nJSON parcial:\n${(outputText || '').slice(0, 4000)}`
        const repairModel = usedModel || modelCandidates[0]
        const repairUrl = `${apiBase}/v1beta/models/${repairModel}:generateContent?key=${apiKey}`
        const repairPayload = {
          contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }
        try {
          const res2 = await fetch(repairUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repairPayload),
          })
          if (res2.ok) {
            const json2 = await res2.json()
            try {
              if (json2?.candidates?.[0]?.content?.parts?.[0]?.text) {
                outputText = json2.candidates[0].content.parts[0].text
              } else if (json2?.candidates?.[0]?.content?.parts) {
                outputText = json2.candidates[0].content.parts.map((p: any) => p.text || '').join('\n')
              }
            } catch {}
            // Parse again
            try {
              let maybeJson2 = (outputText || '').trim()
              if (maybeJson2.startsWith('```json')) {
                maybeJson2 = maybeJson2.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
              } else if (maybeJson2.startsWith('```')) {
                maybeJson2 = maybeJson2.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
              }
              maybeJson2 = maybeJson2.trim()
              try {
                parsed = JSON.parse(maybeJson2)
              } catch {
                const s = maybeJson2.indexOf('{')
                const e = maybeJson2.lastIndexOf('}')
                if (s !== -1 && e !== -1 && e > s) {
                  parsed = JSON.parse(maybeJson2.slice(s, e + 1))
                }
              }
            } catch (e) {}
          } else {
            const txt2 = await res2.text()
            console.error('[v0] Repair call failed:', res2.status, txt2?.slice?.(0, 2000))
          }
        } catch (err) {
          console.error('[v0] Error during repair attempt:', err)
        }
      }
    }

    if (!parsed) {
      console.error('[v0] Parsed object is null/undefined after parsing attempts')
      return NextResponse.json({ 
        error: 'Failed to parse model output as JSON', 
        debug: { 
          outputSnippet: (outputText || '').slice(0, 2000), 
          jsonSnippet: JSON.stringify(json?.candidates || json).slice(0, 2000) 
        } 
      }, { status: 502 })
    }

    // Minimal validation and normalization
    if (!parsed || typeof parsed !== 'object') {
      console.error('[v0] Invalid parsed object:', typeof parsed)
      return NextResponse.json({ error: 'Invalid JSON structure from model' }, { status: 502 })
    }

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
