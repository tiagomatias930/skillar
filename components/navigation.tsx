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
    <header className="sticky top-0 z-50 border-b border-[var(--md3-outline-variant)]/50 bg-[var(--md3-surface-container)]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">SkillarCode</h1>
            </div>
            <span className="hidden md:block text-sm text-[var(--md3-on-surface-variant)] font-medium">Arena dos Campeões</span>
          </Link>

          {/* Desktop Navigation — MD3 Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/competitions">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">{t('navigation.competitions')}</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">{t('navigation.ranking')}</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">{t('navigation.history')}</Button>
            </Link>
            <Link href="/jogo">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">Jogos & Diversão</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">{t('navigation.reports')}</Button>
            </Link>
            <Link href="/blacklist">
              <Button variant="ghost" className="rounded-full px-4 text-[var(--md3-on-surface-variant)] hover:text-foreground">{t('navigation.blacklist')}</Button>
            </Link>

            <div className="w-px h-6 bg-[var(--md3-outline-variant)] mx-2" />

            <LanguageSelector />

            {username ? (
              <div className="flex items-center gap-3 ml-2">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border-2 border-[var(--md3-outline-variant)] object-cover ring-2 ring-primary/20"
                  />
                )}
                <span className="text-sm text-[var(--md3-on-surface-variant)] font-medium">Olá, {username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full border-[var(--md3-outline)] text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                <Button className="rounded-full bg-primary text-primary-foreground hover:brightness-110">{t('navigation.login')}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground p-2.5 hover:bg-foreground/[0.08] rounded-full transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation — MD3 Modal Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col gap-1">
              <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  {t('navigation.competitions')}
                </Button>
              </Link>
              <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  {t('navigation.ranking')}
                </Button>
              </Link>
              <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  {t('navigation.history')}
                </Button>
              </Link>
              <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  Jogos & Diversão
                </Button>
              </Link>
              <Link href="/reports" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  {t('navigation.reports')}
                </Button>
              </Link>
              <Link href="/blacklist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  {t('navigation.blacklist')}
                </Button>
              </Link>
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              {username ? (
                <div className="flex flex-col gap-2 px-3 py-3 border-t border-[var(--md3-outline-variant)] mt-2">
                  <div className="flex items-center gap-3">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full border-2 border-[var(--md3-outline-variant)] object-cover"
                      />
                    )}
                    <span className="text-sm text-[var(--md3-on-surface-variant)] font-medium">Olá, {username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full border-[var(--md3-outline)] text-[var(--md3-on-surface-variant)] w-full justify-start">
                    <LogOut className="h-4 w-4 mr-1.5" />
                    {t('navigation.logout')}
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="rounded-full bg-primary text-primary-foreground w-full mt-2">
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
