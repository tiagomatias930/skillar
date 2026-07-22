"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateChallengeAI, type ChallengeGenerationRequest, type ChallengeGenerationResponse, type ChallengeGenerationError } from "@/lib/ai-evaluation"
import { Sparkle, CircleNotch } from "@phosphor-icons/react"
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
    <Card className="mb-6 rounded-none border border-border bg-zinc-950 font-mono text-xs text-white">
      <CardHeader className="border-b border-border mb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <Sparkle className="h-4.5 w-4.5 text-primary" />
          GERADOR DE LABS / CTF POR IA
        </CardTitle>
        <p className="text-[10px] text-zinc-500 mt-1">
          Utilize inteligência artificial para estruturar briefings de missões e metas de infiltração customizadas.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tema" className="text-zinc-500 font-bold uppercase text-[10px]">Alvo / Infraestrutura</Label>
              <Input
                id="tema"
                placeholder="Ex: Active Directory, API Gateway, Docker Container..."
                value={form.tema}
                onChange={(e) => setForm(f => ({ ...f, tema: e.target.value }))}
                className="bg-black border border-border text-white text-xs rounded-none px-3 py-1.5 outline-none focus:border-primary transition-all font-mono mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tecnologia" className="text-zinc-500 font-bold uppercase text-[10px]">Tecnologia Alvo</Label>
              <Input
                id="tecnologia"
                placeholder="Ex: Linux, Node.js, PHP, Windows Server..."
                value={form.tecnologia}
                onChange={(e) => setForm(f => ({ ...f, tecnologia: e.target.value }))}
                className="bg-black border border-border text-white text-xs rounded-none px-3 py-1.5 outline-none focus:border-primary transition-all font-mono mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dificuldade" className="text-zinc-500 font-bold uppercase text-[10px]">Dificuldade</Label>
              <select
                id="dificuldade"
                className="w-full mt-1 bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
                value={form.dificuldade}
                onChange={(e) => setForm(f => ({ ...f, dificuldade: e.target.value as "facil" | "medio" | "dificil" }))}
              >
                <option value="facil" className="bg-black text-white">Fácil</option>
                <option value="medio" className="bg-black text-white">Médio</option>
                <option value="dificil" className="bg-black text-white">Difícil</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tipo" className="text-zinc-500 font-bold uppercase text-[10px]">Categoria de Infiltração</Label>
              <select
                id="tipo"
                className="w-full mt-1 bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
                value={form.tipo}
                onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as "programacao" | "design" | "analise" | "outro" }))}
              >
                <option value="programacao" className="bg-black text-white">Red Team / Pentest</option>
                <option value="design" className="bg-black text-white">Blue Team / Forensics</option>
                <option value="analise" className="bg-black text-white">Infiltração Web / OWASP</option>
                <option value="outro" className="bg-black text-white">Engenharia Reversa / Malware</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold py-2.5 font-mono uppercase tracking-wider mt-2">
            {loading ? (
              <>
                <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                PROCESSANDO ESPECIFICAÇÕES...
              </>
            ) : (
              <>
                <Sparkle className="h-4 w-4 mr-2" />
                GERAR briefing COM IA
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 font-mono text-xs">
            {"error" in result ? (
              <div className="p-4 border border-red-500/30 rounded-none bg-red-500/5">
                <p className="text-red-400 font-bold">❌ {result.error}</p>
              </div>
            ) : (
              <Card className="rounded-none border border-border bg-black text-white">
                <CardHeader className="border-b border-border/40 pb-2 mb-3">
                  <CardTitle className="text-sm font-bold text-primary uppercase">{result.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-bold text-zinc-500 uppercase text-[10px] mb-1">Briefing do Laboratório:</h4>
                    <div className="bg-zinc-950 p-2.5 border border-border/80 text-zinc-300 leading-relaxed">
                      <FormattedText text={result.descricao} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-500 uppercase text-[10px] mb-1">Critérios de Avaliação (Flags):</h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-400">
                      {result.criterios_avaliacao.map((criterio, index) => (
                        <li key={index}>{criterio}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-500 border-t border-border/40 pt-3">
                    <div>
                      DIFICULDADE: <span className="font-bold text-white">{result.dificuldade.toUpperCase()}</span>
                    </div>
                    <div>
                      TEMPO ESTIMADO: <span className="font-bold text-white">{result.tempo_estimado.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-500 uppercase text-[10px] mb-1">Tecnologias Recomendadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.tecnologias_sugeridas.map((tech, index) => (
                        <span key={index} className="px-2 py-0.5 border border-primary/20 bg-primary/5 text-primary text-[10px]">
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