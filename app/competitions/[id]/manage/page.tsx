"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Crown, Medal, Award, Users, Save } from "lucide-react"
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
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{position}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Carregando...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 bg-[#073266] border-[#052A5F]">
            <CardContent>
              <h3 className="text-xl font-semibold text-white mb-2">Erro</h3>
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Voltar</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Competição</h1>
          <p className="text-gray-300">{competition?.title}</p>
        </div>

        <Card className="bg-[#073266] border-[#052A5F] shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-blue-400" />
                  Atribuir Pontos aos Participantes
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Como criador, você pode atribuir pontos aos participantes da competição
                </CardDescription>
              </div>
              <Button onClick={handleSavePoints} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Pontos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum participante ainda</h3>
                <p className="text-gray-300">Aguarde participantes se inscreverem na competição</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants
                  .sort((a, b) => (pointsUpdates[b.id] ?? b.points) - (pointsUpdates[a.id] ?? a.points))
                  .map((participant, index) => {
                    const position = index + 1
                    const currentPoints = pointsUpdates[participant.id] ?? participant.points

                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-4 rounded-lg border bg-[#052A5F] border-[#073266] ${
                          position <= 3 ? "ring-2 ring-blue-400/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#073266]">
                            {getRankIcon(position)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{participant.user?.username}</h3>
                            <p className="text-sm text-gray-300">
                              Participando desde {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Label htmlFor={`points-${participant.id}`} className="text-sm text-gray-200">
                              Pontos
                            </Label>
                            <Input
                              id={`points-${participant.id}`}
                              type="number"
                              min="0"
                              value={currentPoints}
                              onChange={(e) => handlePointsChange(participant.id, Number.parseInt(e.target.value) || 0)}
                              className="w-20 text-center bg-[#06224A] border-[#073266] text-white"
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
