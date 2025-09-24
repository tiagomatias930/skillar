"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Crown, Trophy, UserMinus, Settings } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useUsername } from "@/hooks/use-local-storage"

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
  const [username] = useUsername()

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
    if (!newTeamName.trim() || !username) return

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
          maxMembers: 5
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
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const joinTeam = async (teamId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'POST',
      })

      if (response.ok) {
        loadTeams() // Recarregar as equipas
      } else {
        const errorData = await response.json()
        console.error('Error joining team:', errorData.error)
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    } catch (error) {
      console.error('Error joining team:', error)
    }
  }

  const leaveTeam = async (teamId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUserTeam(null)
        loadTeams() // Recarregar as equipas
      } else {
        const errorData = await response.json()
        console.error('Error leaving team:', errorData.error)
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    } catch (error) {
      console.error('Error leaving team:', error)
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedTeams = filteredTeams.sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Equipas</h1>
          <p className="text-lg text-gray-600">
            Junte-se a uma equipa ou crie a sua própria para competir em grupo
          </p>
        </div>

        {/* Minha Equipa */}
        {userTeam && (
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Minha Equipa: {userTeam.name}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => leaveTeam(userTeam.id)}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Sair da Equipa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{userTeam.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Membros ({userTeam.members.length}/{userTeam.maxMembers})</h4>
                  <div className="space-y-2">
                    {userTeam.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {member.role === 'leader' && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">{member.username}</span>
                        </div>
                        <Badge variant="secondary">{member.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Estatísticas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Pontos:</span>
                      <Badge variant="default">{userTeam.totalPoints} pts</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Criada em:</span>
                      <span className="text-gray-600">{userTeam.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar equipas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {!userTeam && (
            <Button onClick={() => setShowCreateForm(true)} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Criar Equipa
            </Button>
          )}
        </div>

        {/* Formulário de Criação */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Criar Nova Equipa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Equipa</label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Digite o nome da equipa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Input
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Descreva os objetivos da equipa"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createTeam} disabled={!newTeamName.trim()}>
                  Criar Equipa
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking de Equipas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Ranking de Equipas
          </h2>
        </div>

        {/* Lista de Equipas */}
        <div className="grid gap-6">
          {sortedTeams.map((team, index) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{team.name}</h3>
                      <p className="text-gray-600">{team.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="text-sm">
                      {team.totalPoints} pts
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Membros ({team.members.length}/{team.maxMembers})
                    </h4>
                    <div className="space-y-2">
                      {team.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {member.role === 'leader' && <Crown className="h-4 w-4 text-yellow-500" />}
                            <span className={member.role === 'leader' ? 'font-semibold' : ''}>{member.username}</span>
                          </div>
                          <Badge variant="secondary">{member.points} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Informações</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Criada em:</span>
                        <span className="text-gray-600">{team.createdAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vagas disponíveis:</span>
                        <span className="text-gray-600">{team.maxMembers - team.members.length}</span>
                      </div>
                    </div>

                    {!userTeam && username && team.members.length < team.maxMembers && 
                     !team.members.some(member => member.username === username) && (
                      <Button 
                        onClick={() => joinTeam(team.id)} 
                        className="w-full mt-4"
                        size="sm"
                      >
                        Juntar-se à Equipa
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma equipa encontrada</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Tente pesquisar com outros termos." : "Seja o primeiro a criar uma equipa!"}
            </p>
            {!userTeam && !searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Equipa
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}