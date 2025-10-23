"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

interface JoinCompetitionButtonProps {
  competitionId: string
  competitionTitle?: string
  disabled?: boolean
}

export function JoinCompetitionButton({ 
  competitionId, 
  competitionTitle = "Competição",
  disabled = false 
}: JoinCompetitionButtonProps) {
  const [isParticipating, setIsParticipating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null)
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

  const handleJoin = async () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    
    if (!username) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          competitionId, 
          username,
          competitionTitle 
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
          onClick={handleJoin} 
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
    </>
  )
}
