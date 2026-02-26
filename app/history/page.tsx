"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Calendar, Users, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/lib/supabase/client"

export default function HistoryPage() {
  const { t } = useTranslation()
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    totalUsers: 0,
    activeCompetitions: 0,
    totalParticipations: 0,
    topWinners: [] as Array<{ username: string; wins: number }>
  })

  useEffect(() => {
    fetchHistoryData()
  }, [])

  async function fetchHistoryData() {
    const supabase = createClient()

    // Get competition history directly
    const { data: competitionHistory } = await supabase
      .from("competitions")
      .select("*")
      .eq("is_active", false)
      .order("created_at", { ascending: false })

    setHistory(competitionHistory || [])

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
    winnerStats?.forEach((stat: any) => {
      const username = Array.isArray(stat.winner) && stat.winner.length > 0 ? stat.winner[0].username : t("history.unknown")
      if (!winnerCounts[stat.winner_id]) {
        winnerCounts[stat.winner_id] = { username, wins: 0 }
      }
      winnerCounts[stat.winner_id].wins += 1
    })

    const topWinners = Object.values(winnerCounts)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5)

    setStats({
      totalCompetitions: totalCompetitions?.length || 0,
      totalUsers: totalUsers?.length || 0,
      activeCompetitions: activeCompetitions?.length || 0,
      totalParticipations: totalParticipations?.length || 0,
      topWinners
    })
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Trophy className="h-6 w-6 text-blue-500" />
    }
  }

  const getRankTitle = (position: number) => {
    switch (position) {
      case 1:
        return t("history.president")
      case 2:
        return t("history.vicePresident")
      case 3:
        return t("history.director")
      default:
        return `${position}${t("history.position")}`
    }
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
      case 2:
        return "bg-blue-500/15 text-blue-300 border-blue-500/30"
      case 3:
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      default:
        return "bg-[var(--md3-secondary-container)] text-[var(--md3-on-secondary-container)] border-[var(--md3-outline-variant)]"
    }
  }

  return (
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 tracking-tight">{t("history.title")}</h1>
          <p className="text-sm sm:text-base text-[var(--md3-on-surface-variant)]">{t("history.description")}</p>
        </div>

        {/* Analytics Cards — MD3 Surface Containers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card className="bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--md3-on-surface-variant)]">{t("history.totalCompetitions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{stats.totalCompetitions}</div>
              <p className="text-xs text-[var(--md3-on-surface-variant)] hidden sm:block">{t("history.createdSoFar")}</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--md3-on-surface-variant)]">{t("history.totalUsers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent">{stats.totalUsers}</div>
              <p className="text-xs text-[var(--md3-on-surface-variant)] hidden sm:block">{t("history.registered")}</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--md3-on-surface-variant)]">{t("history.participations")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--md3-tertiary)]">{stats.totalParticipations}</div>
              <p className="text-xs text-[var(--md3-on-surface-variant)] hidden sm:block">{t("history.totalRegistrations")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card className="mt-8 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-sm sm:text-base lg:text-lg">
              <div className="h-8 w-8 rounded-xl bg-accent/15 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              {t("history.activitySummary")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("history.platformStats")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t("history.generalStats")}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.competitionsCreated")}</span>
                    <span className="font-medium text-foreground">{stats.totalCompetitions}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.activeCompetitions")}</span>
                    <span className="font-medium text-emerald-400">{stats.activeCompetitions}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.finishedCompetitions")}</span>
                    <span className="font-medium text-foreground">{history.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.totalParticipations")}</span>
                    <span className="font-medium text-foreground">{stats.totalParticipations}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t("history.community")}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.registeredUsers")}</span>
                    <span className="font-medium text-foreground">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.usersWithWins")}</span>
                    <span className="font-medium text-foreground">{stats.topWinners.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--md3-on-surface-variant)]">{t("history.avgParticipations")}</span>
                    <span className="font-medium text-foreground">
                      {stats.totalUsers && stats.totalParticipations
                        ? Math.round((stats.totalParticipations / stats.totalUsers) * 10) / 10
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
