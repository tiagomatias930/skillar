"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, User, Calendar, Plus } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-white-900">Sistema de Relatórios</h1>
              <a
                href="/evaluation-criteria"
                className="text-sm px-3 py-1 rounded bg-blue-100 text-gray-700 font-semibold hover:bg-blue-200 transition-colors border border-blue-200"
                title="Ver critérios de avaliação"
                target="_blank"
                rel="noopener noreferrer"
              >
                Critérios de Avaliação
              </a>
            </div>
            <p className="text-white-600">Reporte comportamentos inadequados e mantenha a comunidade segura</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancelar" : "Novo Relatório"}
          </Button>
        </div>

        {/* Report Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Criar Novo Relatório
              </CardTitle>
              <CardDescription>
                Use este formulário para reportar comportamentos inadequados ou violações das regras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <Label htmlFor="reportedUsername">Username do Usuário Reportado</Label>
                  <Input
                    id="reportedUsername"
                    type="text"
                    placeholder="Digite o username do usuário"
                    value={reportedUsername}
                    onChange={(e) => setReportedUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Motivo do Relatório</Label>
                  <Textarea
                    id="reason"
                    placeholder="Descreva detalhadamente o comportamento inadequado ou violação..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
                    {isSubmitting ? "Enviando..." : "Enviar Relatório"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-white-600" />
              Relatórios da Comunidade
            </CardTitle>
            <CardDescription>
              {reports.length === 0
                ? "Nenhum relatório ainda"
                : `${reports.length} relatório${reports.length > 1 ? "s" : ""} registrado${reports.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-white-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-900 mb-2">Nenhum relatório ainda</h3>
                <p className="text-white-600">A comunidade está segura por enquanto!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 bg-[#052A5F] hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Relatório</Badge>
                            <span className="text-sm text-white-600">#{report.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-white-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>Reportado: {report.reported_user?.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(report.created_at).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-13">
                      <p className="text-white-900 mb-2">{report.reason}</p>
                      <p className="text-sm text-white-600">Reportado por: {report.reporter_user?.username}</p>
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
