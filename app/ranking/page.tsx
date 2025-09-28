"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { RefreshButton } from "@/components/refresh-button"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/lib/supabase/client"

type UserRanking = {
  userId: string
  username: string
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
    const userPoints: Record<string, { username: string; totalPoints: number; competitions: number }> = {}

    type Participant = {
      user_id: string
      points: number
      user:
        | { username?: string }[]
        | { username?: string }
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

      if (!userPoints[userId]) {
        userPoints[userId] = {
          username,
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
        ...data,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    setSortedRanking(ranking)
    setLoading(false)
  }

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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t("ranking.title")}</h1>
          <p className="text-gray-300">{t("ranking.description")}</p>
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
              <div className="space-y-4">
                {sortedRanking.map((user, index) => {
                  const position = index + 1
                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center justify-between p-6 rounded-lg border transition-all hover:shadow-md bg-[#052A5F] border-[#073266] ${
                        position <= 3
                          ? "ring-2 ring-blue-400/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#073266]">
                          {getRankIcon(position)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{user.username}</h3>
                            <Badge variant="outline" className={getRankBadgeColor(position)}>
                              {getRankTitle(position)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300">
                            {t("ranking.participatingIn")} {user.competitions} {user.competitions > 1 ? t("ranking.competitions") : t("ranking.competition")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{user.totalPoints}</div>
                        <div className="text-sm text-gray-300">{t("ranking.totalPoints")}</div>
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
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t("ranking.currentPodium")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {sortedRanking.slice(0, 3).map((user, index) => {
                const position = index + 1
                return (
                  <Card
                    key={user.userId}
                    className={`text-center bg-[#073266] border-[#052A5F] ${
                      position === 1
                        ? "ring-2 ring-yellow-400/50"
                        : position === 2
                          ? "ring-2 ring-gray-400/50"
                          : "ring-2 ring-amber-400/50"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-center mb-4">{getRankIcon(position)}</div>
                      <CardTitle className="text-lg text-white">{user.username}</CardTitle>
                      <CardDescription className="text-gray-300">{getRankTitle(position)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white mb-2">{user.totalPoints}</div>
                      <div className="text-sm text-gray-300">{t("ranking.totalPoints")}</div>
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
