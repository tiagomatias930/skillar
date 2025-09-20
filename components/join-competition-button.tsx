"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"


interface JoinCompetitionButtonProps {
  competitionId: string;
  disabled?: boolean;
}

export function JoinCompetitionButton({ competitionId, disabled = false }: JoinCompetitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isParticipating, setIsParticipating] = useState(false)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    const checkParticipation = async () => {
      const username = localStorage.getItem("skillar_username")
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

    checkParticipation()
  }, [competitionId])

  const handleJoin = async () => {
    const username = localStorage.getItem("skillar_username")
    console.log("[v0] Join button clicked, username:", username)
    console.log("[v0] Competition ID:", competitionId)

    if (!username) {
      console.log("[v0] No username found, redirecting to login")
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Making API request to join competition")
      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId,
          username,
        }),
      })

      console.log("[v0] API response status:", response.status)
      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (response.ok) {
        console.log("[v0] Successfully joined competition")
        showToast("Participação confirmada com sucesso!", "success")
        router.refresh()
      } else {
        console.error("[v0] Error response:", data.error)
        showToast(data.error || "Erro ao participar da competição", "error")
      }
    } catch (error) {
      console.error("[v0] Network error:", error)
      showToast("Erro ao participar da competição", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastContainer />
      <Button 
        onClick={handleJoin} 
        disabled={isLoading || disabled || isParticipating} 
        className={`${isParticipating ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isLoading 
          ? "Participando..." 
          : disabled 
            ? "Encerrada" 
            : isParticipating 
              ? "Já Participa" 
              : "Participar"}
      </Button>
    </>
  )
}
