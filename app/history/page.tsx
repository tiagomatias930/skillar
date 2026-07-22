"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, MedalMilitary, CalendarBlank, UsersThree, TrendUp } from "@phosphor-icons/react"
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
        return <Crown className="h-6 w-6 text-yellow-400 animate-bounce" weight="fill" />
      case 2:
        return <Medal className="h-6 w-6 text-zinc-400" weight="fill" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" weight="fill" />
      default:
        return <Trophy className="h-6 w-6 text-primary" weight="fill" />
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
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 rounded-none"
      case 2:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30 rounded-none"
      case 3:
        return "bg-amber-600/10 text-amber-500 border-amber-600/30 rounded-none"
      default:
        return "bg-zinc-950 text-zinc-400 border-border rounded-none"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight uppercase">{t("history.title")}</h1>
          <p className="text-xs sm:text-sm text-zinc-400">{t("history.description")}</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card className="rounded-none border border-border bg-zinc-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t("history.totalCompetitions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-3xl font-bold text-primary tracking-widest">{stats.totalCompetitions}</div>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t("history.createdSoFar")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-none border border-border bg-zinc-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t("history.totalUsers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-3xl font-bold text-white tracking-widest">{stats.totalUsers}</div>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t("history.registered")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-none border border-border bg-zinc-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t("history.participations")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-3xl font-bold text-primary tracking-widest">{stats.totalParticipations}</div>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t("history.totalRegistrations")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card className="rounded-none border border-border bg-zinc-950">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-wider">
              <div className="h-8 w-8 border border-primary/30 bg-primary/10 flex items-center justify-center">
                <CalendarBlank className="h-4 w-4 text-primary" />
              </div>
              {t("history.activitySummary")}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-mono mt-1">{t("history.platformStats")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-xs uppercase text-white border-b border-border/40 pb-2 mb-3 tracking-widest">{t("history.generalStats")}</h4>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.competitionsCreated")}</span>
                    <span className="font-bold text-white">{stats.totalCompetitions}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.activeCompetitions")}</span>
                    <span className="font-bold text-emerald-400">{stats.activeCompetitions}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.finishedCompetitions")}</span>
                    <span className="font-bold text-white">{history.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.totalParticipations")}</span>
                    <span className="font-bold text-white">{stats.totalParticipations}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase text-white border-b border-border/40 pb-2 mb-3 tracking-widest">{t("history.community")}</h4>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.registeredUsers")}</span>
                    <span className="font-bold text-white">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.usersWithWins")}</span>
                    <span className="font-bold text-white">{stats.topWinners.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">{t("history.avgParticipations")}</span>
                    <span className="font-bold text-white">
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
