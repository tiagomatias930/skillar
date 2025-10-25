"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function TeamsDiagnosticPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sqlScript, setSqlScript] = useState("")

  useEffect(() => {
    checkTables()
    loadSqlScript()
  }, [])

  const checkTables = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teams/check-tables')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error("Error checking tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSqlScript = async () => {
    try {
      const res = await fetch('/scripts/009_create_teams_tables.sql')
      const text = await res.text()
      setSqlScript(text)
    } catch (error) {
      console.error("Error loading SQL script:", error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    alert('✅ Script SQL copiado para a área de transferência!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🔍 Diagnóstico de Tabelas de Teams</h1>

        {loading ? (
          <div className="text-white text-center py-8">Verificando tabelas...</div>
        ) : status ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`p-6 rounded-lg border-2 ${
              status.status === 'OK' 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-red-500/20 border-red-500'
            }`}>
              <h2 className="text-2xl font-bold text-white mb-2">
                {status.status === 'OK' ? '✅ ' : '❌ '}
                {status.message}
              </h2>
              <p className="text-gray-300 text-sm">{status.status}</p>
            </div>

            {/* Tables Status */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Status das Tabelas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                  <span className="text-white font-mono">teams</span>
                  <span className={status.details.teams_table ? 'text-green-400' : 'text-red-400'}>
                    {status.details.teams_table ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                  <span className="text-white font-mono">team_members</span>
                  <span className={status.details.team_members_table ? 'text-green-400' : 'text-red-400'}>
                    {status.details.team_members_table ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                  <span className="text-white font-mono">participants.team_id</span>
                  <span className={status.details.participants_team_id_column ? 'text-green-400' : 'text-red-400'}>
                    {status.details.participants_team_id_column ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
              </div>
            </div>

            {/* Errors */}
            {status.details.errors && status.details.errors.length > 0 && (
              <div className="bg-red-900/20 rounded-lg p-6 border border-red-500">
                <h3 className="text-xl font-bold text-red-400 mb-4">Erros Encontrados</h3>
                <div className="space-y-2">
                  {status.details.errors.map((err: any, idx: number) => (
                    <div key={idx} className="p-3 bg-black/30 rounded">
                      <div className="text-white font-mono text-sm mb-1">{err.table}</div>
                      <div className="text-red-300 text-sm">{err.error}</div>
                      {err.code && <div className="text-gray-400 text-xs mt-1">Code: {err.code}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solution */}
            {status.status !== 'OK' && (
              <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">💡 Como Resolver</h3>
                <ol className="list-decimal list-inside space-y-2 text-white mb-4">
                  <li>Acesse o <a href="https://app.supabase.com" target="_blank" className="text-blue-400 underline">Supabase Dashboard</a></li>
                  <li>Vá em <b>SQL Editor</b></li>
                  <li>Clique em <b>New Query</b></li>
                  <li>Cole o script SQL abaixo</li>
                  <li>Clique em <b>Run</b></li>
                </ol>
                
                {sqlScript && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-bold">Script SQL:</h4>
                      <Button onClick={copyToClipboard} size="sm">
                        📋 Copiar Script
                      </Button>
                    </div>
                    <pre className="bg-black p-4 rounded overflow-x-auto text-sm text-green-400 max-h-96">
                      {sqlScript}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button onClick={checkTables} className="bg-blue-600 hover:bg-blue-700">
                🔄 Verificar Novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-red-400 text-center py-8">Erro ao carregar status</div>
        )}
      </div>
    </div>
  )
}
