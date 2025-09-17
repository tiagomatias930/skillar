"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, Trophy, History, LogIn, BarChart3 } from "lucide-react"
import Image from "next/image"

export default function JogoPage() {
  const [currentUrl, setCurrentUrl] = useState("https://www.retrogames.cc/")
  const [customUrl, setCustomUrl] = useState("")
  const [iframeError, setIframeError] = useState(false)

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim())
      setIframeError(false)
    }
  }

  const handleIframeError = () => {
    setIframeError(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header da aplicação */}
      <header className="w-full border-b bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 relative">
                <Image
                  src="/42skillar.png"
                  alt="skillar"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Skillar</h1>
              <p className="text-center text-xs text-gray-500">Arena dos Campeões</p>
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
              <Link href="/login">
                <Button size="sm" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo principal - iframe */}
      <div className="flex-1 relative bg-900">
        {iframeError ? (
          <div className="w-full h-full flex items-center justify-center flex-col p-4 text-center">
            <p className="text-red-500 mb-4">Não foi possível carregar o site no iframe. Muitos sites bloqueiam a exibição em iframes por motivos de segurança.</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Digite uma URL diferente"
                className="border p-2 rounded"
              />
              <Button onClick={handleCustomUrl}>Tentar</Button>
            </div>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              <span>Abrir diretamente</span>
            </a>
          </div>
        ) : (
          <iframe
            src={currentUrl}
            className="w-full h-full border-0"
            title="Jogo Online"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  )
}