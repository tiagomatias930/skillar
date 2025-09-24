"use client"

import { Trophy, LogOut, History, Gamepad2, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navigation() {
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem("skillar_username")
    setUsername(storedUsername)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("skillar_username")
    router.push("/")
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/42skillar.png" alt="42Skillar Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-3xl font-bold text-gray-900">Skillar</h1>
            <p className="text-center text-lg text-italic text-gray-300">Arena dos Campeões</p>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/competitions">
             <Trophy className="h-4 w-4 mr-1" />
              <Button variant="ghost">Competições</Button>
            </Link>
            <Link href="/ranking">
              <BarChart3 className="h-4 w-4" />
              <Button variant="ghost">Ranking</Button>
            </Link>
            <Link href="/history">
               <History className="h-4 w-4 mr-1" />
              <Button variant="ghost">Histórico</Button>
            </Link>
            <Link href="/jogo">
              <Gamepad2 className="h-4 w-4" />
              <Button variant="ghost">Jogos & Diversão</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Relatórios</Button>
            </Link>
            <Link href="/blacklist">
              <Button variant="ghost">Lista Negra</Button>
            </Link>

            {username ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Olá, {username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
