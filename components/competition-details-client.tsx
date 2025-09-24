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
  participants, 
  participantsWithTeams 
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
    <main className="container mx-auto px-4 py-8">
      {/* Competition Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.title}</h1>
            <p className="text-gray-600 mb-4">{competition.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  <span className="font-semibold text-blue-700">Duração:</span>
                  <span>{competition.duration_value} {competition.duration_type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={competition.is_active ? "default" : "secondary"}>
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                Ranking em Tempo Real
              </CardTitle>
              <CardDescription>
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
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum participante ainda</h3>
              <p className="text-gray-600">Seja o primeiro a participar desta competição!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant: any, index: number) => {
                const position = index + 1
                return (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      position <= 3 ? "bg-gradient-to-r from-white to-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {getRankIcon(position)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{participant.user?.username}</h3>
                          <Badge variant="outline" className={getRankBadgeColor(position)}>
                            {getRankTitle(position)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Participando desde {new Date(participant.joined_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{participant.points || 0}</div>
                      <div className="text-sm text-gray-600">pontos</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipas Participantes */}
      {participantsWithTeams && participantsWithTeams.some((p: any) => p.participation_type === 'team') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipas Participantes
                </CardTitle>
                <CardDescription>
                  Equipas inscritas nesta competição
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Group participants by team */}
              {Object.entries(
                participantsWithTeams
                  .filter((p: any) => p.participation_type === 'team')
                  .reduce((acc: any, participant: any) => {
                    const teamKey = participant.team_id || 'unknown'
                    if (!acc[teamKey]) {
                      acc[teamKey] = {
                        teamName: participant.team_name || 'Equipa Desconhecida',
                        teamId: participant.team_id,
                        members: [],
                        totalPoints: 0
                      }
                    }
                    acc[teamKey].members.push(participant)
                    acc[teamKey].totalPoints += participant.points || 0
                    return acc
                  }, {})
              )
                .sort(([,a]: any, [,b]: any) => b.totalPoints - a.totalPoints)
                .map(([teamKey, team]: any, index: number) => (
                  <div
                    key={teamKey}
                    className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                          <p className="text-sm text-gray-600">
                            {team.members.length} {team.members.length === 1 ? 'membro' : 'membros'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{team.totalPoints}</div>
                        <div className="text-sm text-gray-600">pontos</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm font-medium">{member.user?.username}</span>
                          <Badge variant="secondary">{member.points || 0} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
