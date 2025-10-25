"use client"

import { useState, useEffect } from "react"
import { evaluateProjectPOST, type EvaluationRequest, type EvaluationResponse, type EvaluationError, atribuirNotaAoUsuario } from "@/lib/ai-evaluation"

type AiEvaluationFormProps = {
  initialUser?: string;
  initialDesafio?: string;
  initialDescDesafio?: string;
};

export default function AiEvaluationForm({ initialUser = '', initialDesafio = '', initialDescDesafio = '' }: AiEvaluationFormProps) {
  const [form, setForm] = useState<EvaluationRequest>({
    url: "",
    commit: "",
    user: initialUser,
    desafio: initialDesafio,
    desc_desafio: initialDescDesafio
  })
  const [result, setResult] = useState<EvaluationResponse | EvaluationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbUpdate, setDbUpdate] = useState<{ success: boolean; error?: string } | null>(null)

  useEffect(() => {
    // Se não veio do prop, tenta pegar do localStorage
    if (!initialUser) {
      const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") || "" : ""
      setForm(f => ({ ...f, user: username }))
    }
  }, [initialUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setDbUpdate(null)
    try {
      const res = await evaluateProjectPOST(form)
      setResult(res)
      // Se avaliação IA for sucesso, tenta atualizar pontos no banco
      if (res && !('error' in res)) {
        // competitionId precisa ser informado (exemplo: do campo desafio ou outro lugar)
        // Aqui assumimos que o campo desafio é o ID da competição
        const competitionId = form.desafio
        const username = form.user
        const points = res.nota_final
        if (competitionId && username && typeof points === 'number') {
          const dbRes = await atribuirNotaAoUsuario(competitionId, username, points)
          setDbUpdate(dbRes)
        }
      } else if (res && 'error' in res) {
        // Check if it's a GitHub authentication error
        if (res.error.includes('401') && res.error.includes('Unauthorized') && res.error.includes('github.com')) {
          setResult({ 
            error: "⚠️ Erro de autenticação no GitHub. O token da API de avaliação expirou ou é inválido. Entre em contato com o administrador para atualizar o GITHUB_TOKEN na API de avaliação (42skillar-aval.vercel.app)." 
          })
        }
      }
    } catch (err) {
      setResult({ error: "Erro ao conectar à API." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded bg-black/50">
      <h2 className="text-lg font-bold mb-2 text-white">Submeter Projeto para Avaliação</h2>
      <p className="text-white">Usuário: {form.user}</p>
      <input className="w-full border p-2 rounded text-white" required placeholder="URL do repositório Git" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
      <input className="w-full border p-2 rounded text-white" required placeholder="SHA do commit, ex: 1 para pegar o ultimo commit" value={form.commit} onChange={e => setForm(f => ({ ...f, commit: e.target.value }))} />
      <input className="w-full border p-2 rounded text-white" required placeholder="Desafio" value={form.desafio} onChange={e => setForm(f => ({ ...f, desafio: e.target.value }))} />
      <input className="w-full border p-2 rounded text-white" required placeholder="Descrição do desafio" value={form.desc_desafio} onChange={e => setForm(f => ({ ...f, desc_desafio: e.target.value }))} />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50" disabled={loading}>{loading ? "Avaliando..." : "Submeter"}</button>
      {result && (
        <div className="mt-4 p-3 border rounded bg-[#052A5F]">
          {"error" in result ? (
            <div className="space-y-2">
              <span className="text-red-400 block">❌ {result.error}</span>
              {result.error.includes('github.com') && result.error.includes('401') && (
                <div className="text-sm text-yellow-300 mt-2 p-2 bg-yellow-900/30 rounded border border-yellow-600/50">
                  <p className="font-bold mb-1">💡 Como resolver:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>A API externa de avaliação (42skillar-aval.vercel.app) precisa de um token GitHub válido</li>
                    <li>Entre em contato com o administrador do sistema de avaliação</li>
                    <li>Peça para atualizar a variável de ambiente GITHUB_TOKEN no projeto Vercel</li>
                    <li>O token pode ser gerado em: github.com → Settings → Developer settings → Personal access tokens</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white">
              <div><b>Nota:</b> {result.nota_final} ({result.classificacao})</div>
              <div><b>Descrição:</b> {result.descricao}</div>
              <div><b>Commit:</b> {result.commit}</div>
              <div><b>Repo:</b> {result.repo}</div>
              <div><b>Usuário:</b> {result.user}</div>
              <div><b>Desafio:</b> {result.desafio}</div>
            </div>
          )}
        </div>
      )}
      {dbUpdate && (
        <div className="mt-2 p-2 border rounded bg-gray-100">
          {dbUpdate.success ? (
            <span className="text-green-700">Resultado final da avaliação</span>
          ) : (
            <span className="text-red-700">Erro ao salvar nota: {dbUpdate.error}</span>
          )}
        </div>
      )}
    </form>
  )
}
