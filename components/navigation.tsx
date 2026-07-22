"use client"

import { useState } from "react"
import { Crosshair, Trophy, SignOut, ClockCounterClockwise, GameController, ChartBar, UsersThree, List, X } from "@phosphor-icons/react"
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
    <header className="sticky top-0 z-50 border-b border-border bg-black/90 backdrop-blur-xl font-mono">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 border border-primary/40 bg-primary/10 flex items-center justify-center">
                <Crosshair className="h-4.5 w-4.5 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white group-hover:text-primary transition-colors duration-200">SKILLAR_ARENA://</h1>
            </div>
            <span className="hidden md:block text-xs text-primary/80 font-mono tracking-widest bg-primary/5 px-2 py-0.5 border border-primary/20">SEC_LABS</span>
          </Link>

          {/* Desktop Navigation — 42network Terminal Style Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/competitions">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">{t('navigation.competitions')}</Button>
            </Link>
            <Link href="/practice">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">./praticar</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">{t('navigation.ranking')}</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">{t('navigation.history')}</Button>
            </Link>
            <Link href="/jogo">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">WarGames</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">{t('navigation.reports')}</Button>
            </Link>
            <Link href="/blacklist">
              <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/25 text-muted-foreground hover:text-primary transition-all font-mono text-sm">{t('navigation.blacklist')}</Button>
            </Link>

            <div className="w-px h-6 bg-border mx-2" />

            <LanguageSelector />

            {username ? (
              <div className="flex items-center gap-3 ml-2">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-border object-cover"
                  />
                )}
                <span className="text-xs text-muted-foreground">User: <strong className="text-white">{username}</strong></span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-none border-border hover:border-primary text-muted-foreground hover:text-primary">
                  <SignOut className="h-4 w-4 mr-1.5" weight="bold" />
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary font-bold transition-all text-sm">{t('navigation.login')}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground p-2 border border-border hover:border-primary/40 rounded transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" weight="bold" />
            ) : (
              <List className="h-5 w-5" weight="bold" />
            )}
          </button>
        </div>

        {/* Mobile Navigation — 42network Terminal Style Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col gap-2">
              <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  {t('navigation.competitions')}
                </Button>
              </Link>
              <Link href="/practice" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  ./praticar
                </Button>
              </Link>
              <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  {t('navigation.ranking')}
                </Button>
              </Link>
              <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  {t('navigation.history')}
                </Button>
              </Link>
              <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  WarGames
                </Button>
              </Link>
              <Link href="/reports" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  {t('navigation.reports')}
                </Button>
              </Link>
              <Link href="/blacklist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/25 text-muted-foreground">
                  {t('navigation.blacklist')}
                </Button>
              </Link>
              <div className="px-3 py-2 border-t border-border">
                <LanguageSelector />
              </div>
              {username ? (
                <div className="flex flex-col gap-2 px-3 py-3 border-t border-border mt-2">
                  <div className="flex items-center gap-3">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full border border-border object-cover"
                      />
                    )}
                    <span className="text-xs text-muted-foreground">User: <strong className="text-white">{username}</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-none border-border hover:border-primary text-muted-foreground w-full justify-start">
                    <SignOut className="h-4 w-4 mr-1.5" weight="bold" />
                    {t('navigation.logout')}
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary w-full mt-2 font-bold font-mono">
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
