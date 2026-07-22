"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Warning, ShieldCheck, User, CalendarBlank, Plus } from "@phosphor-icons/react"
import { Navigation } from "@/components/navigation"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

interface Report {
  id: string
  reported_user_id: string
  reporter_user_id: string
  reason: string
  created_at: string
  reported_user?: {
    username: string
  }
  reporter_user?: {
    username: string
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [reportedUsername, setReportedUsername] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }

    loadReports()
  }, [router])

  const loadReports = async () => {
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erro ao carregar relatórios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()

    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }

    if (!reportedUsername.trim() || !reason.trim()) {
      setError("Todos os campos são obrigatórios")
      return
    }

    if (reportedUsername.trim() === username) {
      setError("Você não pode reportar a si mesmo")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUsername: reportedUsername.trim(),
          reporterUsername: username,
          reason: reason.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setReportedUsername("")
        setReason("")
        setShowForm(false)
        loadReports()
        showToast("Relatório enviado com sucesso!", "success")
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erro ao enviar relatório")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs">ACESSANDO CENTRAL DE INCIDENTES...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">Central de Incidentes</h1>
              <a
                href="/evaluation-criteria"
                className="text-xs px-3 py-1 rounded-none bg-zinc-900 text-primary border border-primary/30 font-bold hover:bg-black transition-colors"
                title="Ver regras de engajamento"
                target="_blank"
                rel="noopener noreferrer"
              >
                Regras de Engajamento
              </a>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">Reporte violações de conduta hacker, ataques ilegais ou abusos na arena</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="rounded-none border border-red-500 bg-red-600 hover:bg-black hover:text-red-400 text-white font-bold transition-all w-full sm:w-auto font-mono">
            <Plus className="h-4 w-4 mr-2" weight="bold" />
            {showForm ? "CANCELAR" : "SUBMETER INCIDENTE"}
          </Button>
        </div>

        {/* Report Form */}
        {showForm && (
          <Card className="mb-8 rounded-none border border-red-500/30 bg-zinc-950">
            <CardHeader className="border-b border-border mb-4">
              <CardTitle className="flex items-center gap-2 text-red-500 text-sm font-bold uppercase tracking-wider">
                <Warning className="h-4 w-4" />
                Relatar Nova Ocorrência
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 font-mono">
                Use este console seguro para submeter violações das regras de engajamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReport} className="space-y-4 font-mono text-xs">
                <div>
                  <Label htmlFor="reportedUsername" className="text-zinc-400 uppercase font-bold text-[10px]">Identificação do Operador Alvo</Label>
                  <Input
                    id="reportedUsername"
                    type="text"
                    placeholder="Digite o username do operador..."
                    value={reportedUsername}
                    onChange={(e) => setReportedUsername(e.target.value)}
                    className="rounded-none border-border bg-black text-white font-mono placeholder:text-zinc-600 focus-visible:border-primary focus-visible:ring-0 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason" className="text-zinc-400 uppercase font-bold text-[10px]">Descrição do Incidente</Label>
                  <Textarea
                    id="reason"
                    placeholder="Descreva detalhadamente a violação ou comportamento..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-none border-border bg-black text-white font-mono placeholder:text-zinc-600 focus-visible:border-primary focus-visible:ring-0 hover:border-zinc-700 mt-1"
                    required
                    rows={4}
                  />
                </div>

                {error && <p className="text-xs text-red-400 font-bold">{error}</p>}

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-none border-border">
                    CANCELAR
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-none border border-red-500 bg-red-600 hover:bg-black hover:text-red-400 transition-all font-bold">
                    {isSubmitting ? "ENVIANDO..." : "ENVIAR RELATÓRIO"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <Card className="rounded-none border border-border bg-zinc-950">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Histórico de Incidentes
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-mono">
              {reports.length === 0
                ? "Sem incidentes reportados na rede"
                : `${reports.length} incidente${reports.length > 1 ? "s" : ""} registrado${reports.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12 font-mono">
                <ShieldCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Sem incidentes na rede</h3>
                <p className="text-xs text-zinc-500">A infraestrutura está limpa. Sem incidentes de segurança pendentes.</p>
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {reports.map((report) => (
                  <div key={report.id} className="border border-border p-4 bg-black rounded-none hover:border-red-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-red-500/20 bg-red-500/5 flex items-center justify-center shrink-0">
                          <Warning className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="rounded-none border border-red-500/30 bg-red-500/10 text-red-400 text-[10px]">INCIDENTE</Badge>
                            <span className="text-[10px] text-zinc-600">ID: {report.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>Alvo: <strong className="text-white">{report.reported_user?.username}</strong></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarBlank className="h-3.5 w-3.5" />
                              <span>Registrado em: {new Date(report.created_at).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pl-0 sm:pl-13 mt-3 sm:mt-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                      <p className="text-zinc-300 text-xs leading-relaxed bg-zinc-950 p-2.5 border border-border/80 mb-2">{report.reason}</p>
                      <p className="text-[10px] text-zinc-500">Reportado por: <strong className="text-zinc-400">{report.reporter_user?.username}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
