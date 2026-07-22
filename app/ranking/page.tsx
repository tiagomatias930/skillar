"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, MedalMilitary, UsersThree } from "@phosphor-icons/react"
import { Navigation } from "@/components/navigation"
import { RefreshButton } from "@/components/refresh-button"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/lib/supabase/client"
import * as HoverCard from '@radix-ui/react-hover-card'
import IntraProfilePreview from '@/components/intra-profile-preview'

type UserRanking = {
  userId: string
  username: string
  avatar_url: string | null
  totalPoints: number
  competitions: number
}

export default function RankingPage() {
  const { t } = useTranslation()
  const [sortedRanking, setSortedRanking] = useState<UserRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRankingData()
  }, [])

  async function fetchRankingData() {
    const supabase = createClient()

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
    const userPoints: Record<string, { username: string; avatar_url: string | null; totalPoints: number; competitions: number }> = {}

    type Participant = {
      user_id: string
      points: number
      user:
        | { username?: string; avatar_url?: string | null }[]
        | { username?: string; avatar_url?: string | null }
        | null
      competition: { title: string; is_active: boolean }
    }

    globalRanking?.forEach((participant) => {
      // Map the participant to the expected Participant type
      const mappedParticipant: Participant = {
        user_id: participant.user_id,
        points: participant.points,
        user: participant.user,
        competition: Array.isArray(participant.competition)
          ? participant.competition[0]
          : participant.competition,
      }

      const userId = mappedParticipant.user_id
      const username = Array.isArray(mappedParticipant.user)
        ? mappedParticipant.user[0]?.username || t("ranking.unknownUser")
        : mappedParticipant.user?.username || t("ranking.unknownUser")
      
      const avatar_url = Array.isArray(mappedParticipant.user)
        ? mappedParticipant.user[0]?.avatar_url || null
        : mappedParticipant.user?.avatar_url || null

      if (!userPoints[userId]) {
        userPoints[userId] = {
          username,
          avatar_url,
          totalPoints: 0,
          competitions: 0,
        }
      }

      userPoints[userId].totalPoints += mappedParticipant.points
      userPoints[userId].competitions += 1
    })

    // Convert to array and sort by total points
    const ranking = Object.entries(userPoints)
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        avatar_url: data.avatar_url,
        totalPoints: data.totalPoints,
        competitions: data.competitions,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    setSortedRanking(ranking)
    setLoading(false)
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
        return (
          <div className="w-8 h-8 border border-border bg-black flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-500">#{position}</span>
          </div>
        )
    }
  }

  const getRankTitle = (position: number) => {
    switch (position) {
      case 1:
        return t("ranking.generalPresident")
      case 2:
        return t("ranking.generalVicePresident")
      case 3:
        return t("ranking.generalDirector")
      default:
        return `${position}${t("ranking.generalPosition")}`
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight uppercase">{t("ranking.title")}</h1>
          <p className="text-xs sm:text-sm text-zinc-400">{t("ranking.description")}</p>
        </div>

        <Card className="rounded-none border border-border bg-zinc-950">
          <CardHeader className="border-b border-border mb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="h-8 w-8 border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  {t("ranking.globalRanking")}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-1 font-mono">
                  {sortedRanking.length === 0
                    ? t("ranking.noParticipants")
                    : `${sortedRanking.length} ${
                        sortedRanking.length > 1 ? t("ranking.participantsCountPlural") : t("ranking.participantsCount")
                      }`}
                </CardDescription>
              </div>
              <RefreshButton />
            </div>
          </CardHeader>
          <CardContent>
            {sortedRanking.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-6">
                  <UsersThree className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase mb-2">{t("ranking.noParticipants")}</h3>
                <p className="text-xs text-zinc-500">{t("ranking.joinCompetitions")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRanking.map((user, index) => {
                  const position = index + 1
                  return (
                    <div
                      key={user.userId}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-none border transition-all duration-200 bg-zinc-950 border-border ${
                        position <= 3
                          ? "border-primary/30 bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-6 font-mono">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 border border-border bg-black shrink-0">
                          {getRankIcon(position)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            {user.avatar_url && (
                              <HoverCard.Root openDelay={150} closeDelay={100}>
                                <HoverCard.Trigger asChild>
                                  <img
                                    src={user.avatar_url}
                                    alt={`Avatar`}
                                    className="w-8 h-8 sm:w-11 sm:h-11 rounded-none border border-border object-cover cursor-pointer shrink-0"
                                  />
                                </HoverCard.Trigger>
                                <HoverCard.Content side="right" align="center" sideOffset={8} className="z-50 p-3 bg-zinc-900 border border-border rounded-none hc-content hc-shadow hc-delay-150 hidden sm:block">
                                  <IntraProfilePreview username={user.username} avatarUrl={user.avatar_url} />
                                </HoverCard.Content>
                              </HoverCard.Root>
                            )}
                            <h3 className="text-sm sm:text-base font-bold text-white truncate">{user.username}</h3>
                            <Badge variant="outline" className={`${getRankBadgeColor(position)} border font-mono`}>
                              {getRankTitle(position)}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {t("ranking.participatingIn")} {user.competitions} {user.competitions > 1 ? t("ranking.competitions") : t("ranking.competition")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-3 sm:mt-0 pl-13 sm:pl-0 border-l border-border/40 sm:border-l-0 sm:pl-4 pl-4">
                        <div className="text-xl sm:text-2xl font-bold text-white tracking-widest">{user.totalPoints}</div>
                        <div className="text-[10px] text-primary font-bold uppercase">{t("ranking.totalPoints")}</div>
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
          <div className="mt-12">
            <h2 className="text-lg font-bold text-white mb-6 uppercase text-center tracking-widest">{t("ranking.currentPodium")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 lg:max-w-5xl lg:mx-auto">
              {sortedRanking.slice(0, 3).map((user, index) => {
                const position = index + 1
                return (
                  <Card
                    key={user.userId}
                    className={`text-center rounded-none bg-zinc-950 border ${
                      position === 1
                        ? "border-yellow-500/50 bg-yellow-500/5 sm:order-2"
                        : position === 2
                          ? "border-zinc-500/50 bg-zinc-500/5 sm:order-1"
                          : "border-amber-600/50 bg-amber-600/5 sm:order-3"
                    }`}
                  >
                    <CardHeader className="pb-2 sm:pb-4 border-b border-border/50 mb-3">
                      <div className="flex justify-center mb-3">{getRankIcon(position)}</div>
                      {user.avatar_url && (
                        <div className="flex justify-center mb-3">
                          <img
                            src={user.avatar_url}
                            alt={`Avatar`}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-none border border-border object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-sm font-bold text-white uppercase font-mono truncate">{user.username}</CardTitle>
                      <CardDescription className="text-xs font-mono">{getRankTitle(position)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 font-mono">
                      <div className="text-xl sm:text-2xl font-bold text-white tracking-widest mb-1">{user.totalPoints}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{t("ranking.totalPoints")}</div>
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
