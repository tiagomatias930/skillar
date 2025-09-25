import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { RefreshButton } from "@/components/refresh-button"
import { createClient } from "@/lib/supabase/server"

export default async function RankingPage() {
  const supabase = await createClient()

  // Get global ranking across all active competitions
  const { data: globalRanking } = await supabase
    .from("participants")
    .select(`
      user_id,
      points,
      user:users!participants_user_id_fkey(*),
      competition:competitions!participants_competition_id_fkey(title, is_active)
    `)
    .eq("competition.is_active", true)

  // Aggregate points by user
  const userPoints: Record<string, { username: string; totalPoints: number; competitions: number }> = {}

  globalRanking?.forEach((participant) => {
    const userId = participant.user_id
    const username = participant.user?.username || "Usuário Desconhecido"

    if (!userPoints[userId]) {
      userPoints[userId] = {
        username,
        totalPoints: 0,
        competitions: 0,
      }
    }

    userPoints[userId].totalPoints += participant.points
    userPoints[userId].competitions += 1
  })

  // Convert to array and sort by total points
  const sortedRanking = Object.entries(userPoints)
    .map(([userId, data]) => ({
      userId,
      ...data,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">#{position}</span>
          </div>
        )
    }
  }

  const getRankTitle = (position: number) => {
    switch (position) {
      case 1:
        return "Presidente Geral"
      case 2:
        return "Vice-presidente Geral"
      case 3:
        return "Diretor Geral"
      default:
        return `${position}º Lugar Geral`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking Geral</h1>
          <p className="text-gray-600">Classificação baseada na soma de pontos de todas as competições ativas</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  Ranking Global
                </CardTitle>
                <CardDescription>
                  {sortedRanking.length === 0
                    ? "Nenhum participante ainda"
                    : `${sortedRanking.length} participante${sortedRanking.length > 1 ? "s" : ""} no ranking`}
                </CardDescription>
              </div>
              <RefreshButton />
            </div>
          </CardHeader>
          <CardContent>
            {sortedRanking.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum participante ainda</h3>
                <p className="text-gray-600">Participe de competições para aparecer no ranking!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRanking.map((user, index) => {
                  const position = index + 1
                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center justify-between p-6 rounded-lg border transition-all hover:shadow-md ${
                        position <= 3
                          ? "bg-gradient-to-r from-white to-gray-50 border-gray-200"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                          {getRankIcon(position)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
                            <Badge variant="outline" className={getRankBadgeColor(position)}>
                              {getRankTitle(position)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Participando de {user.competitions} competição{user.competitions > 1 ? "ões" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{user.totalPoints}</div>
                        <div className="text-sm text-gray-600">pontos totais</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Highlight */}
        {sortedRanking.length >= 3 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pódio Atual</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {sortedRanking.slice(0, 3).map((user, index) => {
                const position = index + 1
                return (
                  <Card
                    key={user.userId}
                    className={`text-center ${
                      position === 1
                        ? "ring-2 ring-yellow-200 bg-gradient-to-b from-yellow-50 to-white"
                        : position === 2
                          ? "ring-2 ring-gray-200 bg-gradient-to-b from-gray-50 to-white"
                          : "ring-2 ring-amber-200 bg-gradient-to-b from-amber-50 to-white"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-center mb-4">{getRankIcon(position)}</div>
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      <CardDescription>{getRankTitle(position)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{user.totalPoints}</div>
                      <div className="text-sm text-gray-600">pontos totais</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
