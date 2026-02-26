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
import * as HoverCard from '@radix-ui/react-hover-card'
import IntraProfilePreview from '@/components/intra-profile-preview'

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
        return <img src="/rank-2.png" className="h-12 w-12 text-muted-foreground" />
      case 3:
        return <img src="/rank-3.png" className="h-12 w-12 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>
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
        return "bg-[var(--md3-primary-container)] text-foreground border-[var(--md3-outline-variant)]"
      case 2:
        return "bg-[var(--md3-surface-container-high)] text-foreground border-[var(--md3-outline-variant)]"
      case 3:
        return "bg-[var(--md3-surface-container-low)] text-foreground border-[var(--md3-outline-variant)]"
      default:
        return "bg-[var(--md3-surface-container-lowest)] text-foreground border-[var(--md3-outline-variant)]"
    }
  }

  return (
    <main className="min-h-screen bg-[var(--md3-surface-container-lowest)] container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
      {/* Competition Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2">{competition.title}</h1>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--md3-on-surface-variant)] mb-4">{competition.description}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--md3-on-surface-variant)]">
              <div className="flex items-center gap-2">
                {competition.creator?.avatar_url && (
                  <img
                    src={competition.creator.avatar_url}
                    alt="Avatar do criador"
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-[var(--md3-outline-variant)] object-cover"
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
                  <span className="font-semibold text-primary">{t('competitionDetail.duration')}</span>
                  <span>{competition.duration_value} {competition.duration_type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={competition.is_active ? "default" : "secondary"} className="bg-[var(--md3-primary-container)] text-foreground text-xs sm:text-sm">
              {competition.is_active ? t('competitionDetail.active') : t('competitionDetail.finished')}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <JoinCompetitionButton 
            competitionId={competition.id} 
            competitionTitle={competition.title}
            disabled={isOver} 
          />
          <Link href={`/competitions/${competition.id}/manage`}>
            <Button variant="outline" className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              {t('competitionDetail.manage')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Ranking */}
      <Card className="bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                {t('competitionDetail.realtimeRanking')}
              </CardTitle>
              <CardDescription className="text-[var(--md3-on-surface-variant)]">
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
              <Users className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('competitionDetail.noParticipants')}</h3>
              <p className="text-[var(--md3-on-surface-variant)]">{t('competitionDetail.noParticipantsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant: any, index: number) => {
                const position = index + 1
                return (
                  <div
                    key={participant.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border ${
                      position <= 3 ? "bg-[var(--md3-primary-container)]" : "bg-[var(--md3-surface-container-low)]"
                    } border-[var(--md3-outline-variant)] gap-3`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--md3-surface-container-high)] shrink-0">
                        {getRankIcon(position)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {participant.user?.avatar_url && (
                            <HoverCard.Root openDelay={150} closeDelay={100}>
                              <HoverCard.Trigger asChild>
                                <img
                                  src={participant.user.avatar_url}
                                  alt={`Avatar de ${participant.user.username}`}
                                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-[var(--md3-outline-variant)] object-cover cursor-pointer shrink-0"
                                />
                              </HoverCard.Trigger>
                              <HoverCard.Content side="right" align="center" sideOffset={8} className="z-50 p-3 bg-[var(--md3-surface-container-high)] border border-[var(--md3-outline-variant)] rounded hc-content hc-shadow hc-delay-150 hidden sm:block">
                                <IntraProfilePreview username={participant.user.username} avatarUrl={participant.user.avatar_url} />
                              </HoverCard.Content>
                            </HoverCard.Root>
                          )}
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{participant.user?.username}</h3>
                          <Badge variant="outline" className={`border-[var(--md3-outline-variant)] ${getRankBadgeColor(position)} text-xs sm:text-sm`}>
                            {getRankTitle(position)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--md3-on-surface-variant)]">
                          {t('competitionDetail.participatingSince')} {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-13 sm:pl-0">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{participant.points || 0}</div>
                      <div className="text-xs sm:text-sm lg:text-base text-[var(--md3-on-surface-variant)]">{t('competitionDetail.points')}</div>
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
