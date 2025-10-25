"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"
import { User, Users, X, Plus, UserPlus } from "lucide-react"

interface JoinCompetitionButtonProps {
  competitionId: string
  competitionTitle?: string
  disabled?: boolean
}

interface Team {
  id: string
  name: string
  creator: { username: string }
  members: { username: string; avatar_url?: string }[]
  memberCount: number
}

export function JoinCompetitionButton({ 
  competitionId, 
  competitionTitle = "Competição",
  disabled = false 
}: JoinCompetitionButtonProps) {
  const [isParticipating, setIsParticipating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<'choose' | 'create-team' | 'join-team'>('choose')
  const [teamName, setTeamName] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  const checkParticipation = async () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    if (!username) return

    try {
      const response = await fetch(
        `/api/competitions/check-participation?competitionId=${competitionId}&username=${encodeURIComponent(username)}`
      )
      const data = await response.json()
      setIsParticipating(data.isParticipating)
      if (data.repositoryUrl) {
        setRepositoryUrl(data.repositoryUrl)
      }
    } catch (error) {
      console.error("Error checking participation:", error)
    }
  }

  useEffect(() => {
    checkParticipation()
  }, [competitionId])

  const fetchTeams = async () => {
    setLoadingTeams(true)
    try {
      const response = await fetch(`/api/teams/${competitionId}`)
      const data = await response.json()
      if (data.success) {
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleOpenModal = () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    if (!username) {
      router.push("/login")
      return
    }
    setShowModal(true)
    setModalStep('choose')
  }

  const handleJoinSolo = async () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    
    if (!username) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    setShowModal(false)
    
    try {
      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          competitionId, 
          username,
          competitionTitle,
          teamId: null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Inscrição confirmada!", "success")
        setIsParticipating(true)
        
        if (data.repositoryUrl) {
          setRepositoryUrl(data.repositoryUrl)
          setTimeout(() => {
            showToast("Repositório GitHub criado com sucesso!", "success")
          }, 1500)
        }
        
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

  const handleCreateTeam = async () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    
    if (!username || !teamName.trim()) {
      showToast("Nome da equipe é obrigatório", "error")
      return
    }

    setIsLoading(true)
    
    try {
      const teamResponse = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamName: teamName.trim(),
          competitionId,
          username
        }),
      })

      const teamData = await teamResponse.json()

      if (!teamResponse.ok) {
        console.error("[TEAMS] Create team error:", teamData)
        
        // Check if it's a database table issue
        if (teamData.error && (
          teamData.error.includes("table") || 
          teamData.error.includes("relation") ||
          teamData.error.includes("does not exist")
        )) {
          showToast(
            "⚠️ Tabelas de equipes não encontradas! Execute o script SQL no Supabase: /scripts/009_create_teams_tables.sql",
            "error"
          )
        } else {
          showToast(teamData.error || "Erro ao criar equipe", "error")
        }
        setIsLoading(false)
        return
      }

      const joinResponse = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          competitionId, 
          username,
          competitionTitle,
          teamId: teamData.team.id
        }),
      })

      const joinData = await joinResponse.json()

      if (joinResponse.ok) {
        showToast(`Equipe "${teamName}" criada e inscrita!`, "success")
        setIsParticipating(true)
        setShowModal(false)
        setTeamName('')
        
        if (joinData.repositoryUrl) {
          setRepositoryUrl(joinData.repositoryUrl)
          setTimeout(() => {
            showToast("Repositório GitHub criado com sucesso!", "success")
          }, 1500)
        }
        
        router.refresh()
      } else {
        showToast(joinData.error || "Erro ao participar da competição", "error")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      showToast("Erro ao criar equipe", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinTeam = async (teamId: string, teamName: string) => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    
    if (!username) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    
    try {
      const teamResponse = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamId,
          username
        }),
      })

      const teamData = await teamResponse.json()

      if (!teamResponse.ok) {
        showToast(teamData.error || "Erro ao juntar-se à equipe", "error")
        setIsLoading(false)
        return
      }

      const joinResponse = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          competitionId, 
          username,
          competitionTitle,
          teamId
        }),
      })

      const joinData = await joinResponse.json()

      if (joinResponse.ok) {
        showToast(`Juntou-se à equipe "${teamName}"!`, "success")
        setIsParticipating(true)
        setShowModal(false)
        
        if (joinData.repositoryUrl) {
          setRepositoryUrl(joinData.repositoryUrl)
          setTimeout(() => {
            showToast("Repositório GitHub criado com sucesso!", "success")
          }, 1500)
        }
        
        router.refresh()
      } else {
        showToast(joinData.error || "Erro ao participar da competição", "error")
      }
    } catch (error) {
      console.error("Error joining team:", error)
      showToast("Erro ao juntar-se à equipe", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (disabled) return "Encerrada"
    if (isLoading) return "A processar..."
    if (isParticipating) return "Já Participa"
    return "Participar"
  }

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handleOpenModal} 
          disabled={disabled || isParticipating || isLoading} 
          className={`${isParticipating ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {getButtonText()}
        </Button>
        
        {repositoryUrl && (
          <a 
            href={repositoryUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-center px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-600 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Ver Repositório no GitHub
          </a>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#052A5F] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {modalStep === 'choose' && 'Como deseja participar?'}
                {modalStep === 'create-team' && 'Criar Nova Equipe'}
                {modalStep === 'join-team' && 'Juntar-se a uma Equipe'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-300 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {modalStep === 'choose' && (
                <div className="grid gap-4">
                  <button
                    onClick={handleJoinSolo}
                    disabled={isLoading}
                    className="p-6 rounded-lg border-2 border-white/20 hover:border-green-500 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-green-500/20 group-hover:bg-green-500/30">
                        <User className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">Participar Sozinho</h3>
                        <p className="text-sm text-gray-300">
                          Participe individualmente e compita pelos seus próprios pontos.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setModalStep('create-team')}
                    disabled={isLoading}
                    className="p-6 rounded-lg border-2 border-white/20 hover:border-blue-500 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30">
                        <Plus className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">Criar Equipe</h3>
                        <p className="text-sm text-gray-300">
                          Crie uma nova equipe e convide outros participantes a juntarem-se.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setModalStep('join-team')
                      fetchTeams()
                    }}
                    disabled={isLoading}
                    className="p-6 rounded-lg border-2 border-white/20 hover:border-purple-500 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30">
                        <UserPlus className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">Juntar-se a uma Equipe</h3>
                        <p className="text-sm text-gray-300">
                          Entre numa equipe existente e compitam juntos.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {modalStep === 'create-team' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName" className="text-white">Nome da Equipe</Label>
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Digite o nome da equipe..."
                      className="mt-2"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModalStep('choose')
                        setTeamName('')
                      }}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={isLoading || !teamName.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Criando...' : 'Criar e Participar'}
                    </Button>
                  </div>
                </div>
              )}

              {modalStep === 'join-team' && (
                <div className="space-y-4">
                  {loadingTeams ? (
                    <div className="text-center py-8 text-gray-300">Carregando equipes...</div>
                  ) : teams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300">Nenhuma equipe disponível ainda.</p>
                      <p className="text-sm text-gray-400 mt-2">Seja o primeiro a criar uma!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {teams.map((team) => (
                        <div
                          key={team.id}
                          className="p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{team.name}</h3>
                              <p className="text-sm text-gray-300">
                                Criador: {team.creator.username}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {team.memberCount} {team.memberCount === 1 ? 'membro' : 'membros'}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleJoinTeam(team.id, team.name)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Juntar-se
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setModalStep('choose')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
