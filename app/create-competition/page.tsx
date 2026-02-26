"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, ArrowLeft, Clock, CalendarBlank } from "@phosphor-icons/react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/toast"

export default function CreateCompetitionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationType, setDurationType] = useState<"dias" | "horas">("dias")
  const [durationValue, setDurationValue] = useState(7)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [customEndDate, setCustomEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsCheckingAuth(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }

    if (!title.trim() || !description.trim()) {
      showToast("Título e descrição são obrigatórios", "error")
      return
    }

    setIsLoading(true)

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        creatorUsername: username,
      }

      if (useCustomDate && customEndDate) {
        body.customEndDate = customEndDate
      } else {
        body.durationType = durationType
        body.durationValue = durationValue
        body.durationMinutes = durationMinutes
      }

      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Competição criada com sucesso!", "success")
        setTimeout(() => {
          router.push(`/competitions/${data.competition.id}`)
        }, 1000)
      } else {
        showToast(data.error || "Erro ao criar competição", "error")
      }
    } catch (error) {
      showToast("Erro ao criar competição", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--md3-surface-container-lowest)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[var(--md3-on-surface-variant)]">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/competitions" className="inline-flex items-center gap-2 text-[var(--md3-on-surface-variant)] hover:text-foreground transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" weight="bold" />
              Voltar para Competições
            </Link>
          </div>

          <Card className="bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground text-xl sm:text-2xl">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-400" weight="duotone" />
                </div>
                Criar Nova Competição
              </CardTitle>
              <CardDescription>
                Preencha os detalhes da sua competição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-medium">Título da Competição</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Desafio de Algoritmos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-medium">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva os objetivos e regras da competição..."
                    className="border-[var(--md3-outline)] rounded-xl min-h-[120px] focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-[var(--md3-on-surface)]"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-foreground font-medium">Duração da Competição</Label>
                  
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="dateType"
                        checked={!useCustomDate}
                        onChange={() => setUseCustomDate(false)}
                        className="accent-primary"
                      />
                      <span className="text-[var(--md3-on-surface-variant)] group-hover:text-foreground transition-colors">Definir duração</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="dateType"
                        checked={useCustomDate}
                        onChange={() => setUseCustomDate(true)}
                        className="accent-primary"
                      />
                      <span className="text-[var(--md3-on-surface-variant)] group-hover:text-foreground transition-colors">Data específica</span>
                    </label>
                  </div>

                  {!useCustomDate ? (
                    <div className="bg-[var(--md3-surface-container-high)] p-5 rounded-2xl space-y-4 border border-[var(--md3-outline-variant)]/30">
                      <div className="flex items-center gap-2 text-[var(--md3-on-surface-variant)] text-sm">
                        <Clock className="h-4 w-4 text-primary/70" weight="duotone" />
                        Escolha a duração
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[var(--md3-on-surface-variant)] text-sm">Tipo</Label>
                          <select
                            value={durationType}
                            onChange={(e) => setDurationType(e.target.value as "dias" | "horas")}
                            className="w-full mt-1 bg-[var(--md3-surface-container-highest)] border border-[var(--md3-outline)] text-foreground rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/30 transition-all"
                          >
                            <option value="dias">Dias</option>
                            <option value="horas">Horas</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-[var(--md3-on-surface-variant)] text-sm">Valor</Label>
                          <Input
                            type="number"
                            min={1}
                            value={durationValue}
                            onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label className="text-[var(--md3-on-surface-variant)] text-sm">Minutos</Label>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--md3-surface-container-high)] p-5 rounded-2xl space-y-4 border border-[var(--md3-outline-variant)]/30">
                      <div className="flex items-center gap-2 text-[var(--md3-on-surface-variant)] text-sm">
                        <CalendarBlank className="h-4 w-4 text-primary/70" weight="duotone" />
                        Escolha a data e hora de término
                      </div>
                      <Input
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required={useCustomDate}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-full"
                  >
                    {isLoading ? "Criando..." : "Criar Competição"}
                  </Button>
                  <Link href="/competitions" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
