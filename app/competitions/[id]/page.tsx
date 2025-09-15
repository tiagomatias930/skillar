import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { Trophy, Crown, Medal, Award, Users, Calendar, Edit, Clock } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
// ...existing code...
// Removed CountdownTimer function implementation
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { JoinCompetitionButton } from "@/components/join-competition-button"
import { RefreshButton } from "@/components/refresh-button"
import { getCompetitionRanking } from "@/lib/database"
import { createClient } from "@/lib/supabase/server"

interface CompetitionPageProps {
  params: Promise<{ id: string }>
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get competition details
  const { data: competition } = await supabase
    .from("competitions")
    .select(`*, creator:users!competitions_creator_id_fkey(*)`)
    .eq("id", id)
    .single()

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Competição não encontrada</h3>
              <Link href="/competitions">
                <Button>Voltar às Competições</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const participants = await getCompetitionRanking(id)

  console.log("[v0] Participants in page component:", participants)
  console.log("[v0] First participant points:", participants[0]?.points)

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>
    }
  }

  const getRankTitle = (position: number) => {
    switch (position) {
      case 1:
        return "Presidente"
      case 2:
        return "Vice-presidente"
      case 3:
        return "Diretor"
      default:
        return `${position}º Lugar`
    }
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // i18n
  const { lang } = useI18n()
  const t = (key: string) => {
    const dict = require("@/lib/i18n").translations[lang] || {}
    return dict[key] || key
  }
  // Verifica se a competição está encerrada (tempo esgotado)
  const now = new Date()
  const endDate = new Date(competition.custom_end_date || competition.end_date)
  const isOver = now > endDate

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Competition Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.title}</h1>
              <p className="text-gray-600 mb-4">{competition.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{t("created_by")} {competition.creator?.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{t("ends_at")} {new Date(competition.custom_end_date || competition.end_date).toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <CountdownTimer endDate={competition.custom_end_date || competition.end_date} />
                {competition.duration_type && competition.duration_value && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">{t("duration")}:</span>
                    <span>{competition.duration_value} {competition.duration_type}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={competition.is_active ? "default" : "secondary"}>
                {competition.is_active ? t("active") : t("closed")}
              </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            <JoinCompetitionButton competitionId={competition.id} disabled={isOver} />
            <Link href={`/competitions/${competition.id}/manage`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {t("manage")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  {t("ranking")}
                </CardTitle>
                <CardDescription>
                  {participants.length === 0
                    ? t("no_participants")
                    : `${participants.length} ${lang === "pt" ? (participants.length > 1 ? "participantes" : "participante") : (participants.length > 1 ? "participants" : "participant")}`}
                </CardDescription>
              </div>
              <RefreshButton />
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum participante ainda</h3>
                <p className="text-gray-600">Seja o primeiro a participar desta competição!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant, index) => {
                  const position = index + 1
                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        position <= 3 ? "bg-gradient-to-r from-white to-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                          {getRankIcon(position)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{participant.user?.username}</h3>
                            <Badge variant="outline" className={getRankBadgeColor(position)}>
                              {getRankTitle(position)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Participando desde {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{participant.points || 0}</div>
                        <div className="text-sm text-gray-600">{t("points")}</div>
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