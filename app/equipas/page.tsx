"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Crown, Trophy, UserMinus, Settings } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useUsername } from "@/hooks/use-local-storage"
import { useTranslation } from "@/hooks/use-translation"

interface TeamMember {
  id: string
  username: string
  points: number
  role: 'leader' | 'member'
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  totalPoints: number
  createdAt: string
  maxMembers: number
}

export default function EquipasPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(false)
  const [username] = useUsername()
  const { t } = useTranslation()

  useEffect(() => {
    loadTeams()
  }, [])

  useEffect(() => {
    if (username) {
      // Verificar se o usuário atual está em alguma equipa
      const userTeamFound = teams.find((team: Team) => 
        team.members.some(member => member.username === username)
      )
      setUserTeam(userTeamFound || null)
    }
  }, [teams, username])

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const teamsData = await response.json()
        setTeams(teamsData)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  const createTeam = async () => {
    if (!newTeamName.trim() || !username || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
          maxMembers: 5,
          username: username
        }),
      })

      if (response.ok) {
        setNewTeamName("")
        setNewTeamDescription("")
        setShowCreateForm(false)
        loadTeams() // Recarregar as equipas
      } else {
        const errorData = await response.json()
        console.error('Error creating team:', errorData.error)
        alert(`${t('teams.errors.createTeam')}: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert(`${t('teams.errors.createTeam')}. ${t('teams.errors.tryAgain')}`)
    } finally {
      setLoading(false)
    }
  }

  const joinTeam = async (teamId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      })

      if (response.ok) {
        loadTeams() // Recarregar as equipas
      } else {
        const errorData = await response.json()
        console.error('Error joining team:', errorData.error)
        alert(`${t('teams.errors.joinTeam')}: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error joining team:', error)
      alert(`${t('teams.errors.joinTeam')}. ${t('teams.errors.tryAgain')}`)
    }
  }

  const leaveTeam = async (teamId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      })

      if (response.ok) {
        setUserTeam(null)
        loadTeams() // Recarregar as equipas
      } else {
        const errorData = await response.json()
        console.error('Error leaving team:', errorData.error)
        alert(`${t('teams.errors.leaveTeam')}: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error leaving team:', error)
      alert(`${t('teams.errors.leaveTeam')}. ${t('teams.errors.tryAgain')}`)
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedTeams = filteredTeams.sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('teams.title')}</h1>
          {!userTeam && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('teams.createTeam')}
            </Button>
          )}
        </div>

        {/* Formulário de criação de equipa */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('teams.createTeam')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder={t('teams.teamName')}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder={t('teams.teamDescription')}
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={createTeam} 
                  disabled={loading || !newTeamName.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? t('common.loading') : t('teams.create')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewTeamName("")
                    setNewTeamDescription("")
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de pesquisa */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('teams.searchTeams')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Minha Equipa */}
        {userTeam && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('teams.myTeam')}</h2>
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {userTeam.name}
                      <Crown className="h-5 w-5 text-yellow-500" />
                    </h3>
                    <p className="text-gray-600 mt-1">{userTeam.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {userTeam.members.length}/{userTeam.maxMembers} {t('teams.members')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {userTeam.totalPoints} {t('teams.totalPoints')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => leaveTeam(userTeam.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {t('teams.leaveTeam')}
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">{t('teams.members')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {userTeam.members.map((member) => (
                      <Badge 
                        key={member.id} 
                        variant={member.role === 'leader' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {member.role === 'leader' && <Crown className="h-3 w-3" />}
                        {member.username} ({member.points}pts)
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de equipas */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {userTeam ? "Outras Equipas" : "Todas as Equipas"}
          </h2>
          
          {sortedTeams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('teams.noTeamsFound')}</p>
                {!userTeam && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4"
                  >
                    {t('teams.createFirstTeam')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedTeams
                .filter(team => !userTeam || team.id !== userTeam.id)
                .map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{team.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{team.members.length}/{team.maxMembers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{team.totalPoints}pts</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {team.members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {member.role === 'leader' && <Crown className="h-3 w-3 text-yellow-500" />}
                              <span>{member.username}</span>
                            </div>
                            <span className="text-gray-500">{member.points}pts</span>
                          </div>
                        ))}
                        {team.members.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{team.members.length - 3} mais...
                          </p>
                        )}
                      </div>

                      {!userTeam && (
                        <Button
                          onClick={() => joinTeam(team.id)}
                          disabled={team.members.length >= team.maxMembers}
                          className="w-full"
                          size="sm"
                        >
                          {team.members.length >= team.maxMembers 
                            ? t('teams.teamFull')
                            : t('teams.joinTeam')
                          }
                        </Button>
                      )}
                      
                      {userTeam && (
                        <div className="text-center text-sm text-gray-500">
                          {t('teams.alreadyInTeam')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}