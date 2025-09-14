"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RefreshButtonProps {
  className?: string
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    // Small delay to show the loading state
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className={className}>
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Atualizando..." : "Atualizar"}
    </Button>
  )
}
