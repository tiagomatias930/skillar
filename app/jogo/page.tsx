"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, Trophy, History, LogIn, BarChart3, Users } from "lucide-react"

export default function JogoPage() {
  const [currentUrl, setCurrentUrl] = useState("https://www.onlinegames.io/")
  const [customUrl, setCustomUrl] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim())
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F] flex flex-col">
      {/* Header da aplicação */}
      <header className="w-full border-b border-blue-900 bg-transparent shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                className="h-12 w-12 object-contain"
                src="/42skillar.png"
                alt="skiller"
              />
              <h1 className="text-3xl font-bold text-white">Skillar</h1>
              <p className="text-center text-lg text-gray-300">Arena dos Campeões</p>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Competições</span>
                </Button>
              </Link>

              <Link href="/ranking">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Ranking</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  <span>Histórico</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo principal - iframe */}
<div className="flex-1 flex flex-col">
  <iframe
    src={currentUrl}
    className="flex-1 w-full border-0"
    title="Jogo Online"
    allowFullScreen
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  />
</div>
    </div>
  )
}
