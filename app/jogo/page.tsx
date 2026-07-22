"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowSquareOut, House, Trophy, ClockCounterClockwise, SignIn, ChartBar, UsersThree, List, X } from "@phosphor-icons/react"

export default function JogoPage() {
  const [currentUrl, setCurrentUrl] = useState("https://playgama.com/") // https://www.onlinegames.io/ ;
  const [customUrl, setCustomUrl] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim())
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-spin rounded-none h-16 w-16 border border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-widest">INITIALIZING SECURE SANDBOX...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-black shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border border-primary/40 bg-primary/10 flex items-center justify-center">
                <ArrowSquareOut className="h-4.5 w-4.5 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-wider text-white">SKILLAR_ARENA://WARGAMES</h1>
                <span className="text-[9px] text-zinc-500 font-mono tracking-widest -mt-1">CYBER_RANGE.v1</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="rounded-none font-mono text-xs border border-transparent hover:border-primary/25 hover:text-primary">
                  <span>./home</span>
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="rounded-none font-mono text-xs border border-transparent hover:border-primary/25 hover:text-primary">
                  <span>./labs_ctf</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" size="sm" className="rounded-none font-mono text-xs border border-transparent hover:border-primary/25 hover:text-primary">
                  <span>./scoreboard</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="rounded-none font-mono text-xs border border-transparent hover:border-primary/25 hover:text-primary">
                  <span>./operations</span>
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 border border-border hover:border-primary/40 rounded transition-colors"
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

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none text-xs text-zinc-400">
                    ./home
                  </Button>
                </Link>
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none text-xs text-zinc-400">
                    ./labs_ctf
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none text-xs text-zinc-400">
                    ./scoreboard
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-none text-xs text-zinc-400">
                    ./operations
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Control Area for URL connection */}
      <div className="bg-zinc-950 border-b border-border px-4 py-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold text-zinc-500">VPN Sandbox Target:</span>
          <div className="flex gap-2 w-full sm:w-[350px]">
            <input
              type="text"
              placeholder="Digite a URL do Cyber Range ou Terminal..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="bg-black text-xs border border-border px-3 py-1.5 outline-none focus:border-primary text-white w-full rounded-none font-mono"
            />
            <Button
              size="sm"
              onClick={handleCustomUrl}
              className="rounded-none text-xs border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold shrink-0"
            >
              TUNNEL
            </Button>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono self-start sm:self-center">
          TUNNEL_STATUS: <strong className="text-emerald-400">ESTABLISHED</strong> | GATEWAY: <strong className="text-primary">{currentUrl.substring(0, 30)}...</strong>
        </div>
      </div>

      {/* Main Content - iframe */}
      <div className="flex-1 flex flex-col bg-black">
        <iframe
          src={currentUrl}
          className="flex-1 w-full border-0 bg-black"
          title="Hacking Sandbox"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
