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
        body: JSON.stringify({ competitionId, username }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Inscrição confirmada!", "success")
        setIsParticipating(true)
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
      <Button 
        onClick={handleJoin} 
        disabled={disabled || isParticipating || isLoading} 
        className={`${isParticipating ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {getButtonText()}
      </Button>
    </>
  )
}
