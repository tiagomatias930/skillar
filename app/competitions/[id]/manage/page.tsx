"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Crown, Medal, MedalMilitary, UsersThree, FloppyDisk } from "@phosphor-icons/react"
import { Navigation } from "@/components/navigation"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

interface ManageCompetitionPageProps {
  params: Promise<{ id: string }>
}

interface Participant {
  id: string
  user_id: string
  points: number
  joined_at: string
  user?: {
    username: string
  }
}

interface Competition {
  id: string
  title: string
  description: string
  creator_id: string
  is_active: boolean
  creator?: {
    username: string
  }
}

export default function ManageCompetitionPage({ params }: ManageCompetitionPageProps) {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [pointsUpdates, setPointsUpdates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params
        const username = localStorage.getItem("skillar_username")

        if (!username) {
          router.push("/login")
          return
        }

        // Load competition details
        const competitionResponse = await fetch(`/api/competitions/${id}`)
        const competitionData = await competitionResponse.json()

        if (!competitionResponse.ok) {
          throw new Error(competitionData.error)
        }

        // Check if user is the creator
        if (competitionData.competition.creator?.username !== username) {
          setError("Você não tem permissão para gerenciar esta competição")
          return
        }

        setCompetition(competitionData.competition)

        // Load participants
        const participantsResponse = await fetch(`/api/competitions/${id}/participants`)
        const participantsData = await participantsResponse.json()

        if (participantsResponse.ok) {
          setParticipants(participantsData.participants)
          // Initialize points updates with current values
          const initialPoints: Record<string, number> = {}
          participantsData.participants.forEach((p: Participant) => {
            initialPoints[p.id] = p.points
          })
          setPointsUpdates(initialPoints)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params, router])

  const handlePointsChange = (participantId: string, points: number) => {
    setPointsUpdates((prev) => ({
      ...prev,
      [participantId]: points,
    }))
  }

  const handleSavePoints = async () => {
    console.log("[v0] handleSavePoints called")

    const username = localStorage.getItem("skillar_username")
    if (!username) {
      console.log("[v0] No username found, redirecting to login")
      router.push("/login")
      return
    }

  setIsSaving(true)
  setError(null)

    try {
      const updates = Object.entries(pointsUpdates).map(([participantId, points]) => ({
        participantId,
        points,
      }))

      console.log("[v0] Saving points with updates:", updates)

      const response = await fetch(`/api/competitions/${competition?.id}/update-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          creatorUsername: username,
        }),
      })

      const data = await response.json()
      console.log("[v0] Save points response:", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error)
      }

      setParticipants((prev) =>
        prev
          .map((p) => ({
            ...p,
            points: pointsUpdates[p.id] ?? p.points,
          }))
          .sort((a, b) => b.points - a.points),
      )

      showToast("Pontos atualizados com sucesso!", "success")

      // Aguarda refresh para garantir atualização do ranking
      await router.refresh()

      setTimeout(() => {
        router.push(`/competitions/${competition?.id}`)
      }, 1500)
    } catch (error) {
      console.error("[v0] Error saving points:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar pontos")
      showToast(error instanceof Error ? error.message : "Erro ao salvar pontos", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <span className="text-yellow-400 font-bold text-sm">#01</span>
      case 2:
        return <span className="text-zinc-400 font-bold text-sm">#02</span>
      case 3:
        return <span className="text-amber-500 font-bold text-sm">#03</span>
      default:
        return <span className="text-zinc-600 font-bold text-sm">#{position < 10 ? `0${position}` : position}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs">ACESSANDO TERMINAL ADMINISTRATIVO...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="rounded-none border border-red-500/30 bg-zinc-950 text-center py-8">
            <CardContent>
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-2">Acesso Negado</h3>
              <p className="text-xs text-zinc-400 mb-4">{error}</p>
              <Button onClick={() => router.back()} className="rounded-none border border-border bg-transparent text-white hover:bg-white hover:text-black transition-all text-xs font-mono">
                Voltar
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-widest mb-2">Painel Admin do Laboratório</h1>
          <p className="text-xs text-zinc-500 font-mono uppercase">TARGET_ID: {competition?.id} {"//"} {competition?.title}</p>
        </div>

        <Card className="rounded-none border border-border bg-zinc-950">
          <CardHeader className="border-b border-border mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Trophy className="h-4 w-4 text-primary" />
                  Auditar Scoreboard e Flags de Agentes
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 font-mono mt-1">
                  Como administrador do lab, você pode ajustar flags/pontos obtidos pelos agentes infiltrados.
                </CardDescription>
              </div>
              <Button onClick={handleSavePoints} disabled={isSaving} className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold text-xs">
                <FloppyDisk className="h-4 w-4 mr-2" />
                {isSaving ? "GRAVANDO TELEMETRIA..." : "GRAVAR LOGS & SCORE"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-12">
                <UsersThree className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Nenhum agente infiltrado</h3>
                <p className="text-xs text-zinc-500">Aguardando conexão de VPN por novos agentes no laboratório virtual.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants
                  .sort((a, b) => (pointsUpdates[b.id] ?? b.points) - (pointsUpdates[a.id] ?? a.points))
                  .map((participant, index) => {
                    const position = index + 1
                    const currentPoints = pointsUpdates[participant.id] ?? participant.points

                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-4 rounded-none border bg-black border-border transition-all ${
                          position <= 3 ? "border-primary/45 bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 border border-border bg-zinc-950 font-bold">
                            {getRankIcon(position)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm sm:text-base">{participant.user?.username}</h3>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">
                              Infiltração ativa desde: {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Label htmlFor={`points-${participant.id}`} className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                              Flags / Score
                            </Label>
                            <Input
                              id={`points-${participant.id}`}
                              type="number"
                              min="0"
                              value={currentPoints}
                              onChange={(e) => handlePointsChange(participant.id, Number.parseInt(e.target.value) || 0)}
                              className="bg-black border border-border text-white text-xs rounded-none px-3 py-1.5 outline-none focus:border-primary text-center w-24 font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
