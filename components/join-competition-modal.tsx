"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"
import { useUsername } from "@/hooks/use-local-storage"
import { Users, User, Crown, CheckCircle } from "lucide-react"

interface Team {
  id: string
  name: string
  description: string
  members: Array<{
    id: string
    username: string
    points: number
    role: 'leader' | 'member'
  }>
  totalPoints: number
}

interface JoinCompetitionModalProps {
  competitionId: string
  competitionTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function JoinCompetitionModal({ 
  competitionId, 
  competitionTitle, 
  isOpen, 
  onClose,
  onSuccess 
}: JoinCompetitionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [isUserTeamLeader, setIsUserTeamLeader] = useState(false)
  const [username] = useUsername()
  const [selectedParticipationType, setSelectedParticipationType] = useState<'solo' | 'team' | null>(null)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    if (isOpen && username) {
      loadUserTeam()
    }
  }, [isOpen, username])

  const loadUserTeam = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const teams = await response.json()
        const userTeamFound = teams.find((team: Team) => 
          team.members.some((member: any) => member.username === username)
        )
        
        if (userTeamFound) {
          setUserTeam(userTeamFound)
          const userMember = userTeamFound.members.find((member: any) => member.username === username)
          setIsUserTeamLeader(userMember?.role === 'leader')
        }
      }
    } catch (error) {
      console.error('Error loading user team:', error)
    }
  }

  const handleJoin = async () => {
    if (!username || !selectedParticipationType) return

    setIsLoading(true)

    try {
      let participationType = selectedParticipationType
      let teamId = null

      // Se for participação em equipa, verificar se é o líder
      if (selectedParticipationType === 'team') {
        if (!isUserTeamLeader) {
          showToast("Apenas o líder da equipa pode inscrevê-la em competições", "error")
          setIsLoading(false)
          return
        }
        teamId = userTeam?.id
      }

      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId,
          username,
          participationType,
          teamId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const message = selectedParticipationType === 'team' 
          ? `Equipa "${userTeam?.name}" inscrita com sucesso!`
          : "Participação individual confirmada!"
        
        showToast(message, "success")
        onSuccess?.() // Call the success callback if provided
        onClose()
        router.refresh()
      } else {
        showToast(data.error || "Erro ao participar da competição", "error")
      }
    } catch (error) {
      console.error("Error joining competition:", error)
      showToast("Erro ao participar da competição", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participar em: {competitionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opção Solo */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedParticipationType === 'solo' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedParticipationType('solo')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Participação Individual</h3>
                    <p className="text-sm text-gray-600">Participar sozinho na competição</p>
                  </div>
                </div>
                {selectedParticipationType === 'solo' && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opção Equipa (se tiver equipa) */}
          {userTeam && (
            <Card 
              className={`cursor-pointer transition-all ${
                selectedParticipationType === 'team' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:shadow-md'
              } ${!isUserTeamLeader ? 'opacity-60' : ''}`}
              onClick={() => isUserTeamLeader && setSelectedParticipationType('team')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Participar com a Equipa</h3>
                        {isUserTeamLeader && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        {userTeam.name} ({userTeam.members.length} membros)
                      </p>
                      {!isUserTeamLeader && (
                        <p className="text-xs text-orange-600">
                          Apenas o líder pode inscrever a equipa
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedParticipationType === 'team' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                
                {selectedParticipationType === 'team' && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Membros da Equipa:</h4>
                    <div className="space-y-1">
                      {userTeam.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            {member.role === 'leader' && <Crown className="h-3 w-3 text-yellow-500" />}
                            <span>{member.username}</span>
                          </div>
                          <Badge variant="secondary">{member.points} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleJoin} 
              disabled={!selectedParticipationType || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Participando...' : 'Confirmar Participação'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}