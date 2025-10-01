"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Users, Calendar, Edit, Clock } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { RefreshButton } from "@/components/refresh-button"
import Link from "next/link"
import { JoinCompetitionButton } from "@/components/join-competition-button"
import { useTranslation } from "@/hooks/use-translation"

export default function CompetitionDetailsClient({ 
  competition, 
  participants
}: any) {
  const { t } = useTranslation()

  const now = new Date()
  const endDate = new Date(competition.custom_end_date || competition.end_date)
  const isOver = now > endDate

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <img src="/rank-1.png" className="h-12 w-12 text-yellow-500" />
      case 2:
        return <img src="/rank-2.png" className="h-12 w-12 text-gray-400" />
      case 3:
        return <img src="/rank-3.png" className="h-12 w-12 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>
    }
  }

  const getRankTitle = (position: number) => {
    switch (position) {
      case 1:
        return t('competitionDetail.president')
      case 2:
        return t('competitionDetail.vicePresident')
      case 3:
        return t('competitionDetail.director')
      default:
        return `${position}${t('competitionDetail.position')}`
    }
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-[#052A5F] text-white border-[#073266]"
      case 2:
        return "bg-[#073266] text-white border-[#052A5F]"
      case 3:
        return "bg-[#06224A] text-white border-[#073266]"
      default:
        return "bg-[#041a3a] text-white border-[#052A5F]"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F] container mx-auto px-4 py-8">
      {/* Competition Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{competition.title}</h1>
            <p className="text-gray-300 mb-4">{competition.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                {competition.creator?.avatar_url && (
                  <img
                    src={competition.creator.avatar_url}
                    alt="Avatar do criador"
                    className="w-12 h-12 rounded-full border border-[#073266] object-cover"
                  />
                )}
                <span>{t('competitionDetail.createdBy')} {competition.creator?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('competitionDetail.endsOn')} {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <CountdownTimer endDate={competition.custom_end_date || competition.end_date} />
              {competition.duration_type && competition.duration_value && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#052A5F]">{t('competitionDetail.duration')}</span>
                  <span>{competition.duration_value} {competition.duration_type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={competition.is_active ? "default" : "secondary"} className="bg-[#052A5F] text-white">
              {competition.is_active ? t('competitionDetail.active') : t('competitionDetail.finished')}
            </Badge>
          </div>
        </div>

        <div className="flex gap-4">
          <JoinCompetitionButton 
            competitionId={competition.id} 
            competitionTitle={competition.title}
            disabled={isOver} 
          />
          <Link href={`/competitions/${competition.id}/manage`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t('competitionDetail.manage')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Ranking */}
      <Card className="bg-[#073266] border-[#052A5F]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-[#052A5F]" />
                {t('competitionDetail.realtimeRanking')}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {participants.length === 0
                  ? t('competitionDetail.noParticipants')
                  : `${participants.length} ${participants.length > 1 ? t('competitionDetail.participants') : t('competitionDetail.participant')}`}
              </CardDescription>
            </div>
            <RefreshButton />
          </div>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-[#052A5F] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t('competitionDetail.noParticipants')}</h3>
              <p className="text-gray-300">{t('competitionDetail.noParticipantsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant: any, index: number) => {
                const position = index + 1
                return (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      position <= 3 ? "bg-[#052A5F]" : "bg-[#06224A]"
                    } border-[#073266]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#073266]">
                        {getRankIcon(position)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {participant.user?.avatar_url && (
                            <img
                              src={participant.user.avatar_url}
                              alt={`Avatar de ${participant.user.username}`}
                              className="w-12 h-12 rounded-full border border-[#073266] object-cover"
                            />
                          )}
                          <h3 className="font-semibold text-white">{participant.user?.username}</h3>
                          <Badge variant="outline" className={`border-[#052A5F] ${getRankBadgeColor(position)}`}>
                            {getRankTitle(position)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300">
                          {t('competitionDetail.participatingSince')} {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{participant.points || 0}</div>
                      <div className="text-sm text-gray-300">{t('competitionDetail.points')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
