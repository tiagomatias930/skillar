"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, MedalMilitary, UsersThree, CalendarBlank, PencilSimple, Clock } from "@phosphor-icons/react"
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
        return <Crown className="h-6 w-6 text-yellow-400 animate-bounce" weight="fill" />
      case 2:
        return <Medal className="h-6 w-6 text-zinc-400" weight="fill" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" weight="fill" />
      default:
        return <span className="text-sm font-bold text-zinc-500">#{position}</span>
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
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 rounded-none text-xs"
      case 2:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30 rounded-none text-xs"
      case 3:
        return "bg-amber-600/10 text-amber-500 border-amber-600/30 rounded-none text-xs"
      default:
        return "bg-zinc-950 text-zinc-400 border-border rounded-none text-xs"
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
      {/* Competition Header */}
      <div className="mb-8 border border-border bg-zinc-950/40 p-6 rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 uppercase tracking-widest font-mono">LAB_DOSSIER</span>
              <Badge variant={competition.is_active ? "default" : "secondary"} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-none text-[10px] uppercase">
                {competition.is_active ? t('competitionDetail.active') : t('competitionDetail.finished')}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 uppercase">{competition.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4 leading-relaxed max-w-3xl">{competition.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 border-t border-border/50 pt-4">
              <div className="flex items-center gap-2">
                {competition.creator?.avatar_url && (
                  <img
                    src={competition.creator.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-none border border-border object-cover"
                  />
                )}
                <span>{t('competitionDetail.createdBy')} <strong className="text-white">{competition.creator?.username}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarBlank className="h-4 w-4 text-primary" />
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
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50 mt-4">
          <JoinCompetitionButton 
            competitionId={competition.id} 
            competitionTitle={competition.title}
            disabled={isOver} 
          />
          <Link href={`/competitions/${competition.id}/manage`}>
            <Button variant="outline" className="w-full sm:w-auto rounded-none border-border hover:border-primary text-xs">
              <PencilSimple className="h-4 w-4 mr-2 text-primary" />
              {t('competitionDetail.manage')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Ranking */}
      <Card className="rounded-none border border-border bg-zinc-950">
        <CardHeader className="border-b border-border mb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <Trophy className="h-4 w-4 text-primary" />
                {t('competitionDetail.realtimeRanking')}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 font-mono">
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
            <div className="text-center py-12">
              <UsersThree className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white uppercase mb-2">{t('competitionDetail.noParticipants')}</h3>
              <p className="text-xs text-zinc-500">{t('competitionDetail.noParticipantsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant: any, index: number) => {
                const position = index + 1
                return (
                  <div
                    key={participant.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-none border ${
                      position <= 3 ? "border-primary/30 bg-primary/5" : "border-border bg-zinc-950"
                    } gap-3 font-mono`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 border border-border bg-black shrink-0">
                        {getRankIcon(position)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {participant.user?.avatar_url && (
                            <HoverCard.Root openDelay={150} closeDelay={100}>
                              <HoverCard.Trigger asChild>
                                <img
                                  src={participant.user.avatar_url}
                                  alt={`Avatar`}
                                  className="w-8 h-8 rounded-none border border-border object-cover cursor-pointer shrink-0"
                                />
                              </HoverCard.Trigger>
                              <HoverCard.Content side="right" align="center" sideOffset={8} className="z-50 p-3 bg-zinc-900 border border-border rounded-none hc-content hc-shadow hc-delay-150 hidden sm:block">
                                <IntraProfilePreview username={participant.user.username} avatarUrl={participant.user.avatar_url} />
                              </HoverCard.Content>
                            </HoverCard.Root>
                          )}
                          <h3 className="font-bold text-white text-sm sm:text-base truncate">{participant.user?.username}</h3>
                          <Badge variant="outline" className={`${getRankBadgeColor(position)} border font-mono`}>
                            {getRankTitle(position)}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {t('competitionDetail.participatingSince')} {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-13 sm:pl-0 border-l border-border/40 sm:border-l-0 sm:pl-4 pl-4">
                      <div className="text-xl sm:text-2xl font-bold text-white tracking-widest">{participant.points || 0}</div>
                      <div className="text-[10px] text-primary uppercase font-bold">{t('competitionDetail.points')}</div>
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
