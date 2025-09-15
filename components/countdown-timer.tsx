"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    function updateCountdown() {
      const now = new Date()
      const end = new Date(endDate)
      const diff = end.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft("Encerrada")
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  return (
    <div className="flex items-center gap-2 text-blue-700 font-semibold">
      <Clock className="h-4 w-4" />
      <span>Tempo restante: {timeLeft}</span>
    </div>
  )
}
