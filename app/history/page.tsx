import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Calendar, Users, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { getCompetitionHistory } from "@/lib/database"
import { createClient } from "@/lib/supabase/server"

export default async function HistoryPage() {
  const supabase = await createClient()
  const history = await getCompetitionHistory()

  // Get analytics data
  const { data: totalCompetitions } = await supabase.from("competitions").select("id", { count: "exact" })

  const { data: totalUsers } = await supabase.from("users").select("id", { count: "exact" })

  const { data: activeCompetitions } = await supabase
    .from("competitions")
    .select("id", { count: "exact" })
    .eq("is_active", true)

  const { data: totalParticipations } = await supabase.from("participants").select("id", { count: "exact" })

  // Get most successful users (winners count)
  const { data: winnerStats } = await supabase.from("competition_history").select(`
      winner_id,
      winner:users!competition_history_winner_id_fkey(username)
    `)

  const winnerCounts: Record<string, { username: string; wins: number }> = {}
  winnerStats?.forEach((stat) => {
    const username = stat.winner?.username || "Desconhecido"
    if (!winnerCounts[stat.winner_id]) {
      winnerCounts[stat.winner_id] = { username, wins: 0 }
    }
    winnerCounts[stat.winner_id].wins += 1
  })

  const topWinners = Object.values(winnerCounts)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5)

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Trophy className="h-6 w-6 text-blue-500" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico e Estatísticas</h1>
          <p className="text-gray-600">Acompanhe o desempenho da comunidade e vencedores das competições</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Competições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalCompetitions?.length || 0}</div>
              <p className="text-xs text-gray-600">Criadas até agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Competições Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCompetitions?.length || 0}</div>
              <p className="text-xs text-red-600">Encerradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalUsers?.length || 0}</div>
              <p className="text-xs text-gray-600">Registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Participações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalParticipations?.length || 0}</div>
              <p className="text-xs text-gray-600">Total de inscrições</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Resumo da Atividade
            </CardTitle>
            <CardDescription>Estatísticas gerais da plataforma 42Skillar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Estatísticas Gerais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competições criadas:</span>
                    <span className="font-medium">{totalCompetitions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competições ativas:</span>
                    <span className="font-medium text-green-600">{activeCompetitions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competições finalizadas:</span>
                    <span className="font-medium">{history.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de participações:</span>
                    <span className="font-medium">{totalParticipations?.length || 0}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Comunidade</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuários registrados:</span>
                    <span className="font-medium">{totalUsers?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuários com vitórias:</span>
                    <span className="font-medium">{topWinners.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Média de participações:</span>
                    <span className="font-medium">
                      {totalUsers?.length && totalParticipations?.length
                        ? Math.round((totalParticipations.length / totalUsers.length) * 10) / 10
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
