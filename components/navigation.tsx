"use client"

import { Trophy, LogOut } from "lucide-react"
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
            <Trophy className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Skillar</h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/competitions">
              <Button variant="ghost">Competições</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="ghost">Ranking</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost">Histórico</Button>
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
