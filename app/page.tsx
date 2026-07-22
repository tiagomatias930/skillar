"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersThree, Crosshair, Medal, Trophy, ClockCounterClockwise, ChartBar, GameController, List, X } from "@phosphor-icons/react"
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
    <div className="min-h-screen bg-black text-white font-mono selection:bg-primary selection:text-black">
      {/* Header — 42network Terminal Style App Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded border border-primary/40 bg-primary/10 flex items-center justify-center">
                <Crosshair className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-wider text-white">SKILLAR_ARENA://</h1>
                <span className="text-[10px] text-primary/80 font-mono tracking-widest -mt-1">SEC_LABS.v1</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/competitions">
                <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all font-mono text-sm">
                  <span>./labs_ctf</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all font-mono text-sm">
                  <span>./scoreboard</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all font-mono text-sm">
                  <span>./operations</span>
                </Button>
              </Link>
              <Link href="/jogo">
                <Button variant="ghost" className="rounded-none border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all font-mono text-sm">
                  <span>./wargames</span>
                </Button>
              </Link>
              <div className="w-px h-6 bg-border mx-2" />
              <LanguageSelector />
              {!isAuthenticated && (
                <Link href="/login">
                  <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono text-sm font-bold ml-2">
                    <span>CONNECT</span>
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 border border-border hover:border-primary/40 rounded transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <List className="h-5 w-5" weight="bold" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
              <nav className="flex flex-col gap-2">
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/20 text-muted-foreground">
                    <span>./labs_ctf</span>
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/20 text-muted-foreground">
                    <span>./scoreboard</span>
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/20 text-muted-foreground">
                    <span>./operations</span>
                  </Button>
                </Link>
                <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent hover:border-primary/20 text-muted-foreground">
                    <span>./wargames</span>
                  </Button>
                </Link>
                <div className="px-3 py-2 border-t border-border mt-2">
                  <LanguageSelector />
                </div>
                {!isAuthenticated && (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all w-full mt-1 font-mono font-bold">
                      <span>CONNECT</span>
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section — 42network terminal visual style */}
      <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden border-b border-border bg-radial from-primary/5 to-black">
        {/* Decorative scanning line grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-45" />
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl lg:max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-8 tracking-widest uppercase">
              <Crosshair className="h-4 w-4 animate-spin-slow" />
              <span>Cyber Range & Pentesting Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 uppercase leading-[1.1] font-mono">
              Infiltre, Comprometa<br className="hidden sm:block" /> e <span className="text-primary font-bold shadow-primary/20">Domine</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-mono">
              Participe de campeonatos de hacking, comprometa laboratórios de pentest e dispute no scoreboard global da Skillar Arena.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/competitions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold text-base px-8">
                  Ver Laboratórios
                </Button>
              </Link>
              <Link href="/create-competition" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none border border-border hover:border-primary hover:text-primary transition-all font-mono text-base px-8">
                  Subir Novo Lab
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features — 42network Grid Cards */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-xs font-semibold text-primary tracking-widest uppercase mb-3 font-mono">_módulos_de_treinamento</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-mono">INFRAESTRUTURA DE INVASÃO E DEFESA</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="rounded-none border border-border bg-zinc-950/80 hover:border-primary/50 hover:bg-zinc-900/50 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                  <Crosshair className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-white font-mono uppercase tracking-wide">
                  Laboratórios de Pentest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-zinc-400 font-mono leading-relaxed">
                  Laboratórios virtuais cobrindo Active Directory, Web Exploitation, Cryptography, Reverse Engineering e Buffer Overflow.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border border-border bg-zinc-950/80 hover:border-primary/50 hover:bg-zinc-900/50 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                  <UsersThree className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-white font-mono uppercase tracking-wide">
                  Red vs Blue Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-zinc-400 font-mono leading-relaxed">
                  Participe de simulações realistas atacando infraestruturas críticas ou defendendo servidores contra invasores em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border border-border bg-zinc-950/80 hover:border-primary/50 hover:bg-zinc-900/50 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-white font-mono uppercase tracking-wide">
                  Hall of Fame
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-zinc-400 font-mono leading-relaxed">
                  Capture flags (CTF), comprometa alvos, submeta relatórios de POCs válidas, acumule pontos e conquiste seu posto de Elite Hacker.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section — Terminal connection prompt */}
      <section className="py-20 border-t border-b border-border bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto font-mono">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white tracking-wider uppercase">
              READY_TO_BREACH.SH
            </h3>
            <p className="text-sm sm:text-base mb-8 text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Conecte-se à VPN da Skillar Arena agora e comece a comprometer laboratórios virtuais.
            </p>
            <Link href="/login">
              <Button size="lg" className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold text-base px-10">
                INITIALIZE_VPN_CONNECTION
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — 42network style minimal footer */}
      <footer className="bg-black border-t border-border text-zinc-500 py-8 font-mono text-xs">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-6 w-6 border border-border flex items-center justify-center bg-zinc-950">
              <Crosshair className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="font-bold text-white tracking-widest">SKILLAR_ARENA_42</p>
          </div>
          <p className="max-w-md mx-auto text-zinc-500">
            Plataforma avançada de simulação de cybersegurança, hacking labs e CTFs em tempo real.
          </p>
        </div>
      </footer>
    </div>
  )
}
