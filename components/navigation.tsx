"use client"

import { useState } from "react"
import { Trophy, LogOut, History, Gamepad2, BarChart3, Users, Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUsername, useLocalStorage } from "@/hooks/use-local-storage"
import { useTranslation } from "@/hooks/use-translation"
import { LanguageSelector } from "@/components/language-selector"

export function Navigation() {
  const [username, setUsername] = useUsername()
  const [avatarUrl] = useLocalStorage('skillar_avatar_url')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleLogout = () => {
    setUsername(null)
    router.push("/")
  }

  return (
    <header className="border-b bg-black/80 backdrop-blur-sm border-[#073266]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
           {/*<img src="/42skillar.png" alt="42Skillar Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />*/}
            <h1 className="text-xl sm:text-3xl font-bold text-white">SkillarCode</h1>
            <p className="hidden sm:block text-center text-sm sm:text-lg text-gray-300">Arena dos Campeões</p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/competitions">
              <Button variant="ghost">{t('navigation.competitions')}</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="ghost">{t('navigation.ranking')}</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost">{t('navigation.history')}</Button>
            </Link>
            <Link href="/jogo">
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
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-[#073266] object-cover"
                  />
                )}
                <span className="text-sm text-gray-300">Olá, {username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-[#073266] text-white hover:bg-[#052A5F]">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-[#052A5F] hover:bg-[#073266] text-white">{t('navigation.login')}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
          <div className="lg:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  {t('navigation.competitions')}
                </Button>
              </Link>
              <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  {t('navigation.ranking')}
                </Button>
              </Link>
              <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  {t('navigation.history')}
                </Button>
              </Link>
              <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  Jogos & Diversão
                </Button>
              </Link>
              <Link href="/reports" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  {t('navigation.reports')}
                </Button>
              </Link>
              <Link href="/blacklist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white">
                  {t('navigation.blacklist')}
                </Button>
              </Link>
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              {username ? (
                <div className="flex flex-col gap-2 px-3 py-2 border-t border-[#073266] mt-2">
                  <div className="flex items-center gap-3">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border border-[#073266] object-cover"
                      />
                    )}
                    <span className="text-sm text-gray-300">Olá, {username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="border-[#073266] text-white hover:bg-[#052A5F] w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navigation.logout')}
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-[#052A5F] hover:bg-[#073266] text-white w-full justify-start">
                    {t('navigation.login')}
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
