"use client"

import { Trophy, LogOut, History, Gamepad2, BarChart3, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUsername } from "@/hooks/use-local-storage"
import { useTranslation } from "@/hooks/use-translation"
import { LanguageSelector } from "@/components/language-selector"

export function Navigation() {
  const [username, setUsername] = useUsername()
  const router = useRouter()
  const { t } = useTranslation()

  const handleLogout = () => {
    setUsername(null)
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
              <Button variant="ghost">{t('navigation.competitions')}</Button>
            </Link>
                <Link href="/equipas">
                  <Users className="h-4 w-4 mr-1" />
                  <Button variant="ghost">{t('navigation.teams')}</Button>
                </Link>
            <Link href="/ranking">
              <BarChart3 className="h-4 w-4" />
              <Button variant="ghost">{t('navigation.ranking')}</Button>
            </Link>
            <Link href="/history">
               <History className="h-4 w-4 mr-1" />
              <Button variant="ghost">{t('navigation.history')}</Button>
            </Link>
            <Link href="/jogo">
              <Gamepad2 className="h-4 w-4" />
              <Button variant="ghost">Jogos & Diversão</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">{t('navigation.reports')}</Button>
            </Link>
            <Link href="/blacklist">
              <Button variant="ghost">{t('navigation.blacklist')}</Button>
            </Link>

            <LanguageSelector />

            {username ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Olá, {username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>{t('navigation.login')}</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
