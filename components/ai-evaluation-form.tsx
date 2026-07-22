"use client"

import { useState, useEffect } from "react"
import { FormattedText } from "./formatted-text"
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border border-border bg-zinc-950 font-mono text-xs text-white rounded-none">
      <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wider">Submeter POC para Auditoria</h2>
      <p className="text-[10px] text-zinc-500 uppercase font-mono">OPERADOR: <strong className="text-white">{form.user}</strong></p>

      <div>
        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Repositório Git (Exploit/POC):</label>
        <input
          className="w-full bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
          required
          placeholder="https://github.com/..."
          value={form.url}
          onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Commit SHA:</label>
        <input
          className="w-full bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
          required
          placeholder="1 para o commit mais recente"
          value={form.commit}
          onChange={e => setForm(f => ({ ...f, commit: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">ID do Lab / CTF:</label>
        <input
          className="w-full bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
          required
          placeholder="Lab Target ID"
          value={form.desafio}
          onChange={e => setForm(f => ({ ...f, desafio: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Resumo do Objetivo:</label>
        <input
          className="w-full bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
          required
          placeholder="Objetivo da infiltração..."
          value={form.desc_desafio}
          onChange={e => setForm(f => ({ ...f, desc_desafio: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold py-2.5 disabled:opacity-50 font-mono uppercase tracking-wider mt-2"
        disabled={loading}
      >
        {loading ? "AUDITANDO CÓDIGO..." : "SUBMETER AUDITORIA"}
      </button>

      {result && (
        <div className="mt-4 p-3 border border-border bg-black font-mono text-xs space-y-3">
          {"error" in result ? (
            <div className="space-y-2">
              <span className="text-red-400 block font-bold">❌ {result.error}</span>
              {result.error.includes('github.com') && result.error.includes('401') && (
                <div className="text-[10px] text-yellow-400 mt-2 p-2 bg-yellow-950/20 border border-yellow-500/30 font-mono leading-relaxed">
                  <p className="font-bold mb-1">💡 RESOLUÇÃO:</p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                    <li>A API externa de avaliação (42skillar-aval.vercel.app) precisa de um token GitHub válido</li>
                    <li>Entre em contato com o administrador do sistema de avaliação</li>
                    <li>Peça para atualizar a variável de ambiente GITHUB_TOKEN no projeto Vercel</li>
                    <li>O token pode ser gerado em: github.com → Settings → Developer settings → Personal access tokens</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="text-zinc-300 space-y-2">
              <div><strong className="text-primary font-bold uppercase text-[10px]">Auditoria Score:</strong> <span className="text-white font-bold">{result.nota_final}</span> ({result.classificacao})</div>
              <div className="border-t border-border/40 pt-2">
                <strong className="text-primary font-bold uppercase text-[10px]">Feedback IA:</strong>
                <div className="mt-1 bg-zinc-950 p-2 border border-border text-zinc-400 leading-relaxed text-[11px]">
                  <FormattedText text={result.descricao} />
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 space-y-0.5">
                <div>COMMIT_SHA: {result.commit}</div>
                <div>REPOSITORY: {result.repo}</div>
                <div>AUDITED_USER: {result.user}</div>
                <div>TARGET_ID: {result.desafio}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {dbUpdate && (
        <div className="mt-2 p-2 border border-border bg-zinc-950 text-center font-mono">
          {dbUpdate.success ? (
            <span className="text-emerald-400 font-bold uppercase text-[10px]">REGISTRO DE AUDITORIA GRAVADO NO SCOREBOARD</span>
          ) : (
            <span className="text-red-400 font-bold uppercase text-[10px]">ERRO AO SALVAR LOG: {dbUpdate.error}</span>
          )}
        </div>
      )}
    </form>
  )
}
