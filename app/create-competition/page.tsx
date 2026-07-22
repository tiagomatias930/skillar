"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Crosshair, ArrowLeft, Clock, CalendarBlank } from "@phosphor-icons/react"
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
      showToast("Título e briefing são obrigatórios", "error")
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
        showToast("Laboratório implantado com sucesso!", "success")
        setTimeout(() => {
          router.push(`/competitions/${data.competition.id}`)
        }, 1000)
      } else {
        showToast(data.error || "Erro ao implantar laboratório", "error")
      }
    } catch (error) {
      showToast("Erro ao implantar laboratório", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs">Acessando canal seguro...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/competitions" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" weight="bold" />
              Voltar para Labs
            </Link>
          </div>

          <Card className="rounded-none border border-border bg-zinc-950">
            <CardHeader className="border-b border-border mb-4">
              <CardTitle className="flex items-center gap-3 text-white text-lg sm:text-xl uppercase tracking-wider">
                <div className="h-10 w-10 border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <Crosshair className="h-5 w-5 text-primary animate-pulse" />
                </div>
                Implantar Novo Lab
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Preencha as especificações técnicas da missão e vulnerabilidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white font-bold uppercase text-xs">Nome do Lab / Desafio</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: CTF - Active Directory Breach"
                    className="rounded-none border-border bg-black text-white font-mono placeholder:text-zinc-600 focus-visible:border-primary focus-visible:ring-0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white font-bold uppercase text-xs">Briefing da Missão</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva os objetivos do pentest, vulnerabilidades e flags a capturar..."
                    className="border-border rounded-none bg-black text-white font-mono placeholder:text-zinc-600 min-h-[120px] focus-visible:border-primary focus-visible:ring-0 hover:border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-white font-bold uppercase text-xs">Janela de Exploração (Duração)</Label>
                  
                  <div className="flex items-center gap-6 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="dateType"
                        checked={!useCustomDate}
                        onChange={() => setUseCustomDate(false)}
                        className="accent-primary"
                      />
                      <span className="text-zinc-400 group-hover:text-white transition-colors">Definir Duração</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="dateType"
                        checked={useCustomDate}
                        onChange={() => setUseCustomDate(true)}
                        className="accent-primary"
                      />
                      <span className="text-zinc-400 group-hover:text-white transition-colors">Data e Hora Específica</span>
                    </label>
                  </div>

                  {!useCustomDate ? (
                    <div className="bg-black p-5 rounded-none space-y-4 border border-border">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Clock className="h-4 w-4 text-primary" />
                        Configure o tempo de atividade
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-zinc-500 text-[10px] uppercase font-bold">Unidade</Label>
                          <select
                            value={durationType}
                            onChange={(e) => setDurationType(e.target.value as "dias" | "horas")}
                            className="w-full mt-1 bg-zinc-950 border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
                          >
                            <option value="dias">Dias</option>
                            <option value="horas">Horas</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-zinc-500 text-[10px] uppercase font-bold">Quantidade</Label>
                          <Input
                            type="number"
                            min={1}
                            value={durationValue}
                            onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                            className="rounded-none border-border bg-zinc-950 text-white text-xs mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-zinc-500 text-[10px] uppercase font-bold">Minutos</Label>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                            className="rounded-none border-border bg-zinc-950 text-white text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black p-5 rounded-none space-y-4 border border-border">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <CalendarBlank className="h-4 w-4 text-primary" />
                        Configure a data/hora limite
                      </div>
                      <Input
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required={useCustomDate}
                        className="rounded-none border-border bg-zinc-950 text-white text-xs mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold"
                  >
                    {isLoading ? "IMPLANTANDO..." : "IMPLANTAR LAB"}
                  </Button>
                  <Link href="/competitions" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-none border-border hover:border-red-500/50 hover:text-red-400 font-mono transition-all"
                    >
                      CANCELAR
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
