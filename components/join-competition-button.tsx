"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"
import { JoinCompetitionModal } from "@/components/join-competition-modal"

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
  const [participationInfo, setParticipationInfo] = useState<{
    isParticipating: boolean
    participationType?: string
    teamName?: string
  }>({ isParticipating: false })
  const [showModal, setShowModal] = useState(false)
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
      setParticipationInfo({
        isParticipating: data.isParticipating,
        participationType: data.participationType,
        teamName: data.teamName
      })
    } catch (error) {
      console.error("Error checking participation:", error)
    }
  }

  useEffect(() => {
    checkParticipation()
  }, [competitionId])

  const handleJoin = () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") : null
    
    if (!username) {
      router.push("/login")
      return
    }

    setShowModal(true)
  }

  const getButtonText = () => {
    if (disabled) return "Encerrada"
    
    if (participationInfo.isParticipating) {
      if (participationInfo.participationType === 'team' && participationInfo.teamName) {
        return `Participa (${participationInfo.teamName})`
      }
      return "Já Participa"
    }
    
    return "Participar"
  }

  return (
    <>
      <ToastContainer />
      <Button 
        onClick={handleJoin} 
        disabled={disabled || participationInfo.isParticipating} 
        className={`${participationInfo.isParticipating ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {getButtonText()}
      </Button>

      <JoinCompetitionModal
        competitionId={competitionId}
        competitionTitle={competitionTitle}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={checkParticipation}
      />
    </>
  )
}
