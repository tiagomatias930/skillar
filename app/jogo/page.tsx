"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, Trophy, History, LogIn, Gamepad2, AlertCircle } from "lucide-react"

export default function JogoPage() {
  const [currentUrl, setCurrentUrl] = useState("https://www.classicgames.me/sega/")
  const [customUrl, setCustomUrl] = useState("")

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header da aplicação */}
      <header className="w-full border-b bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                className="h-8 w-8 object-contain"
                src="/42skillar.png"
                alt="skiller"
              />
              <h1 className="text-lg font-bold text-gray-900">Skillar</h1>
              <p className="text-center text-xs text-gray-500">Arena dos Campeões</p>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  Início
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="ghost" size="sm">
                  <Trophy className="h-4 w-4 mr-1" />
                  Competições
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" size="sm">
                  Ranking
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  Histórico
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Barra de controle */}
      <div className="bg-white border-b p-4">
        <div className="container mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Jogo Atual: {currentUrl}</h2>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="url"
              placeholder="Cole uma URL de jogo aqui..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 sm:w-80 px-3 py-2 border rounded-md text-sm"
            />
            <Button onClick={handleCustomUrl} size="sm">
              Carregar
            </Button>
            <Link href={currentUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>Nota: Alguns sites bloqueiam carregamento em iframe por segurança. Use o botão de link externo se necessário.</span>
        </div>
      </div>

      {/* Conteúdo principal - iframe */}
      <div className="flex-1 relative bg-gray-200">
        <iframe
          src={currentUrl}
          className="w-full h-full border-0"
          title="Jogo Online"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}