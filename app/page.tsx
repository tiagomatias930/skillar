"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Trophy, History, BarChart3, Gamepad2, Menu, X } from "lucide-react"
import Link from "next/link"
import { LanguageSelector } from "@/components/language-selector"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (username) {
      setIsAuthenticated(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      {/* Header — MD3 Top App Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--md3-outline-variant)]/50 bg-[var(--md3-surface-container)]/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">SkillarCode</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/competitions">
                <Button variant="ghost" className="rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  <span>Competições</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" className="rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  <span>Ranking</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" className="rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  <span>Histórico</span>
                </Button>
              </Link>
              <Link href="/jogo">
                <Button variant="ghost" className="rounded-full text-[var(--md3-on-surface-variant)] hover:text-foreground">
                  <span>Jogo</span>
                </Button>
              </Link>
              <div className="w-px h-6 bg-[var(--md3-outline-variant)] mx-2" />
              <LanguageSelector />
              {!isAuthenticated && (
                <Link href="/login">
                  <Button className="rounded-full ml-2">
                    <span>Entrar</span>
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2.5 hover:bg-foreground/[0.08] rounded-full transition-all duration-200"
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

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
              <nav className="flex flex-col gap-1">
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)]">
                    <span>Competições</span>
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)]">
                    <span>Ranking</span>
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)]">
                    <span>Histórico</span>
                  </Button>
                </Link>
                <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-[var(--md3-on-surface-variant)]">
                    <span>Jogo</span>
                  </Button>
                </Link>
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
                {!isAuthenticated && (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="rounded-full w-full mt-1">
                      <span>Entrar</span>
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section — MD3 large display style */}
      <section className="py-16 sm:py-24 lg:py-32 xl:py-40 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl lg:max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Trophy className="h-4 w-4" />
              <span>Plataforma de Competições</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight text-balance leading-[1.1]">
              Compete, Evolua<br className="hidden sm:block" /> e <span className="text-primary">Conquiste</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-[var(--md3-on-surface-variant)] mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              Participe de competições semanais, desafie outros usuários e prove suas habilidades no SkillarCode.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/competitions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-base px-8">
                  Ver Competições
                </Button>
              </Link>
              <Link href="/create-competition" className="w-full sm:w-auto">
                <Button size="lg" variant="tonal" className="w-full sm:w-auto rounded-full text-base px-8">
                  Criar Competição
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features — MD3 Cards */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[var(--md3-surface-container-low)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Funcionalidades</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Tudo o que precisa para competir</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="text-center group hover:shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/25 transition-colors duration-300">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Crie ou Participe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Qualquer usuário pode criar uma competição ou participar das existentes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="h-14 w-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/25 transition-colors duration-300">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Alcance Objectivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Uma meta sem um plano é apenas um desejo.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30 sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="h-14 w-14 rounded-2xl bg-[var(--md3-tertiary)]/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--md3-tertiary)]/25 transition-colors duration-300">
                  <Award className="h-7 w-7 text-[var(--md3-tertiary)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                  Conquiste Posições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Torne-se Nível Mago (1º lugar), RANK S (2º lugar) ou Diretor (3º lugar) e entre para o histórico.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section — MD3 filled container */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--md3-primary-container)] to-[var(--md3-surface-container-high)]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-[var(--md3-on-primary-container)] tracking-tight">
              Pronto para Começar?
            </h3>
            <p className="text-lg sm:text-xl mb-8 text-[var(--md3-on-primary-container)]/80 max-w-xl mx-auto leading-relaxed">
              Entre no SkillarCode agora e mostre suas habilidades!
            </p>
            <Link href="/login">
              <Button size="lg" className="rounded-full text-base px-10 bg-[var(--md3-inverse-surface)] text-[var(--md3-inverse-on-surface)] hover:brightness-110">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — MD3 surface */}
      <footer className="bg-[var(--md3-surface-container-low)] border-t border-[var(--md3-outline-variant)]/30 text-foreground py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">SkillarCode</p>
          </div>
          <p className="text-sm text-[var(--md3-on-surface-variant)] max-w-md mx-auto">
            Plataforma de competições de tecnologia em tempo real — Mostre suas habilidades
          </p>
        </div>
      </footer>
    </div>
  )
}
