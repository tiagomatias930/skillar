"use client"

import { useState } from "react"
import { evaluateProjectPOST, type EvaluationRequest, type EvaluationResponse, type EvaluationError } from "@/lib/ai-evaluation"

export default function AiEvaluationForm() {
  const [form, setForm] = useState<EvaluationRequest>({
    url: "",
    commit: "",
    user: "",
    desafio: "",
    desc_desafio: ""
  })
  const [result, setResult] = useState<EvaluationResponse | EvaluationError | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await evaluateProjectPOST(form)
      setResult(res)
    } catch (err) {
      setResult({ error: "Erro ao conectar à API." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-2">Submeter Projeto para Avaliação IA</h2>
      <input className="w-full border p-2 rounded" required placeholder="URL do repositório Git" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
      <input className="w-full border p-2 rounded" required placeholder="SHA do commit" value={form.commit} onChange={e => setForm(f => ({ ...f, commit: e.target.value }))} />
      <input className="w-full border p-2 rounded" required placeholder="Usuário" value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} />
      <input className="w-full border p-2 rounded" required placeholder="Desafio" value={form.desafio} onChange={e => setForm(f => ({ ...f, desafio: e.target.value }))} />
      <input className="w-full border p-2 rounded" required placeholder="Descrição do desafio" value={form.desc_desafio} onChange={e => setForm(f => ({ ...f, desc_desafio: e.target.value }))} />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50" disabled={loading}>{loading ? "Avaliando..." : "Submeter"}</button>
      {result && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          {"error" in result ? (
            <span className="text-red-600">Erro: {result.error}</span>
          ) : (
            <div>
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
    </form>
  )
}
