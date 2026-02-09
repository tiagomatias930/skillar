"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Users } from "lucide-react"
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
        return <img className="h-12 w-12 text-yellow-500" src="/rank-1.png" alt="Crown" />
      case 2:
        return <img className="h-12 w-12 text-gray-400" src="/rank-2.png" alt="Medal" />
      case 3:
        return <img className="h-12 w-12 text-amber-600" src="/rank-3.png" alt="Award" />
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#06224A] flex items-center justify-center">
            <span className="text-sm font-bold text-white">#{position}</span>
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">{t("ranking.title")}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300">{t("ranking.description")}</p>
        </div>

        <Card className="bg-[#073266] border-[#052A5F] shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-blue-400" />
                  {t("ranking.globalRanking")}
                </CardTitle>
                <CardDescription className="text-gray-300">
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
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{t("ranking.noParticipants")}</h3>
                <p className="text-gray-300">{t("ranking.joinCompetitions")}</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sortedRanking.map((user, index) => {
                  const position = index + 1
                  return (
                    <div
                      key={user.userId}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-lg border transition-all hover:shadow-md bg-[#052A5F] border-[#073266] ${
                        position <= 3
                          ? "ring-2 ring-blue-400/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#073266] shrink-0">
                          {getRankIcon(position)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            {user.avatar_url && (
                              <HoverCard.Root openDelay={150} closeDelay={100}>
                                <HoverCard.Trigger asChild>
                                  <img
                                    src={user.avatar_url}
                                    alt={`Avatar de ${user.username}`}
                                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-[#073266] object-cover cursor-pointer shrink-0"
                                  />
                                </HoverCard.Trigger>
                                <HoverCard.Content side="right" align="center" sideOffset={8} className="z-50 p-3 bg-[#073266] border border-[#052A5F] rounded hc-content hc-shadow hc-delay-150 hidden sm:block">
                                  <IntraProfilePreview username={user.username} avatarUrl={user.avatar_url} />
                                </HoverCard.Content>
                              </HoverCard.Root>
                            )}
                            <h3 className="text-base sm:text-xl font-bold text-white truncate">{user.username}</h3>
                            <Badge variant="outline" className={`${getRankBadgeColor(position)} text-xs sm:text-sm shrink-0`}>
                              {getRankTitle(position)}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-300">
                            {t("ranking.participatingIn")} {user.competitions} {user.competitions > 1 ? t("ranking.competitions") : t("ranking.competition")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-3 sm:mt-0 pl-13 sm:pl-0">
                        <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">{user.totalPoints}</div>
                        <div className="text-xs sm:text-sm lg:text-base text-gray-300">{t("ranking.totalPoints")}</div>
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
          <div className="mt-6 sm:mt-8 lg:mt-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 text-center">{t("ranking.currentPodium")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 lg:max-w-5xl xl:max-w-6xl lg:mx-auto">
              {sortedRanking.slice(0, 3).map((user, index) => {
                const position = index + 1
                return (
                  <Card
                    key={user.userId}
                    className={`text-center bg-[#073266] border-[#052A5F] ${
                      position === 1
                        ? "ring-2 ring-yellow-400/50 sm:order-2"
                        : position === 2
                          ? "ring-2 ring-gray-400/50 sm:order-1"
                          : "ring-2 ring-amber-400/50 sm:order-3"
                    }`}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="flex justify-center mb-2 sm:mb-4">{getRankIcon(position)}</div>
                      {user.avatar_url && (
                        <div className="flex justify-center mb-2 sm:mb-4">
                          <img
                            src={user.avatar_url}
                            alt={`Avatar de ${user.username}`}
                            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-[#073266] object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-base sm:text-lg text-white">{user.username}</CardTitle>
                      <CardDescription className="text-gray-300 text-xs sm:text-sm">{getRankTitle(position)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{user.totalPoints}</div>
                      <div className="text-xs sm:text-sm text-gray-300">{t("ranking.totalPoints")}</div>
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
