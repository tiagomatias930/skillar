"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateChallengeAI, type ChallengeGenerationRequest, type ChallengeGenerationResponse, type ChallengeGenerationError } from "@/lib/ai-evaluation"
import { Sparkles, Loader2 } from "lucide-react"
import { FormattedText } from "./formatted-text"

interface AiChallengeGeneratorProps {
  onChallengeGenerated?: (challenge: ChallengeGenerationResponse) => void
}

export function AiChallengeGenerator({ onChallengeGenerated }: AiChallengeGeneratorProps) {
  const [form, setForm] = useState<ChallengeGenerationRequest>({
    tema: "",
    dificuldade: "medio",
    tecnologia: "",
    tipo: "programacao"
  })
  const [result, setResult] = useState<ChallengeGenerationResponse | ChallengeGenerationError | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await generateChallengeAI(form)
      setResult(response)

      if (response && !('error' in response) && onChallengeGenerated) {
        onChallengeGenerated(response)
      }
    } catch (error) {
      setResult({ error: "Erro ao gerar desafio. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6 bg-[#073266] border-[#052A5F] shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-blue-400" />
          Gerador de Desafio IA
        </CardTitle>
        <p className="text-sm text-white-300 mt-1">
          Use IA para criar desafios personalizados automaticamente
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tema">Tema do Desafio</Label>
              <Input
                id="tema"
                placeholder="Ex: E-commerce, Jogos, API..."
                value={form.tema}
                onChange={(e) => setForm(f => ({ ...f, tema: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="tecnologia">Tecnologia Principal</Label>
              <Input
                id="tecnologia"
                placeholder="Ex: React, Node.js, Python..."
                value={form.tecnologia}
                onChange={(e) => setForm(f => ({ ...f, tecnologia: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dificuldade">Dificuldade</Label>
              <select
                id="dificuldade"
                className="w-full bg-[#052A5F] border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.dificuldade}
                onChange={(e) => setForm(f => ({ ...f, dificuldade: e.target.value as "facil" | "medio" | "dificil" }))}
              >
                <option value="facil" className="bg-[#052A5F]">Fácil</option>
                <option value="medio" className="bg-[#052A5F]">Médio</option>
                <option value="dificil" className="bg-[#052A5F]">Difícil</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Desafio</Label>
              <select
                id="tipo"
                className="w-full border bg-[#052A5F] border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.tipo}
                onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as "programacao" | "design" | "analise" | "outro" }))}
              >
                <option value="programacao" className="bg-[#052A5F]">Programação</option>
                <option value="design" className="bg-[#052A5F]">Design</option>
                <option value="analise" className="bg-[#052A5F]">Análise</option>
                <option value="outro" className="bg-[#052A5F]">Outro</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Desafio...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Desafio com IA
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6">
            {"error" in result ? (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-700">{result.error}</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{result.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Descrição:</h4>
                    <FormattedText text={result.descricao} className="text-white-700" />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Critérios de Avaliação:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.criterios_avaliacao.map((criterio, index) => (
                        <li key={index} className="text-white-700">{criterio}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Dificuldade:</span> {result.dificuldade}
                    </div>
                    <div>
                      <span className="font-semibold">Tempo Estimado:</span> {result.tempo_estimado}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tecnologias Sugeridas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.tecnologias_sugeridas.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}