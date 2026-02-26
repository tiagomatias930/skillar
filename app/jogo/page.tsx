"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, Trophy, History, LogIn, BarChart3, Users, Menu, X } from "lucide-react"

export default function JogoPage() {
  const [currentUrl, setCurrentUrl] = useState("https://playgama.com/") // https://www.onlinegames.io/ ;
  const [customUrl, setCustomUrl] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--md3-on-surface-variant)] text-sm sm:text-base">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)] flex flex-col">
      {/* Header da aplicação */}
      <header className="w-full border-b border-blue-900 bg-transparent shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/*   LOGOTYPE          <img
                className="h-8 w-8 sm:h-12 sm:w-12 object-contain"
                src="/42skillar.png"
                alt="skillar"
              /> */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">SkillarCode</h1>
              <p className="hidden sm:block text-center text-lg lg:text-xl text-[var(--md3-on-surface-variant)]">Arena dos Campeões</p>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <span>Início</span>
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <span>Competições</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <span>Ranking</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <span>Histórico</span>
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground">
                    Início
                  </Button>
                </Link>
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground">
                    Competições
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground">
                    Ranking
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground">
                    Histórico
                  </Button>
                </Link>
              </nav>
            </div>
          )}
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
