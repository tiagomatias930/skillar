"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, Users, Calendar, Edit, Clock } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { RefreshButton } from "@/components/refresh-button"
import Link from "next/link"
import { JoinCompetitionButton } from "@/components/join-competition-button"

export default function CompetitionDetailsClient({ 
  competition, 
  participants
}: any) {

  const now = new Date()
  const endDate = new Date(competition.custom_end_date || competition.end_date)
  const isOver = now > endDate

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>
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
    <main className="container mx-auto px-4 py-8">
      {/* Competition Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{competition.title}</h1>
            <p className="text-gray-300 mb-4">{competition.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Criado por {competition.creator?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Termina em {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <CountdownTimer endDate={competition.custom_end_date || competition.end_date} />
              {competition.duration_type && competition.duration_value && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#052A5F]">Duração:</span>
                  <span>{competition.duration_value} {competition.duration_type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={competition.is_active ? "default" : "secondary"} className="bg-[#052A5F] text-white">
              {competition.is_active ? "Ativa" : "Encerrada"}
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
              Gerenciar
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
                Ranking em Tempo Real
              </CardTitle>
              <CardDescription className="text-gray-300">
                {participants.length === 0
                  ? "Nenhum participante ainda"
                  : `${participants.length} ${participants.length > 1 ? "participantes" : "participante"}`}
              </CardDescription>
            </div>
            <RefreshButton />
          </div>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-[#052A5F] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum participante ainda</h3>
              <p className="text-gray-300">Seja o primeiro a participar desta competição!</p>
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
                          <h3 className="font-semibold text-white">{participant.user?.username}</h3>
                          <Badge variant="outline" className={`border-[#052A5F] ${getRankBadgeColor(position)}`}>
                            {getRankTitle(position)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300">
                          Participando desde {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#052A5F]">{participant.points || 0}</div>
                      <div className="text-sm text-gray-300">pontos</div>
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
