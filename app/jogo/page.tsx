"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, Trophy, History } from "lucide-react"

export default function JogoPage() {
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
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo principal - iframe em fullscreen */}
      <div className="flex-1 relative">
        <iframe
          src="https://www.classicgames.me/sega/"
          className="w-full h-full border-0"
          title="SEGA Play"
          allowFullScreen
        />
      </div>
    </div>
  )
}