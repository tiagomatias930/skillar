"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Crosshair, 
  Trophy, 
  CheckCircle, 
  Warning, 
  MagnifyingGlass, 
  Funnel, 
  CalendarBlank, 
  Globe, 
  User, 
  Shield, 
  CircleNotch, 
  LinkSimple 
} from "@phosphor-icons/react"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/toast"

interface CTFChallenge {
  id: string
  title: string
  points: number
  difficulty: "Iniciante" | "Médio" | "Avançado"
  category: "Web" | "Pwnable" | "Reversing" | "Cryptography" | "Forensics"
  description: string
  hint?: string
}

const PRACTICE_CTFS: CTFChallenge[] = [
  {
    id: "ctf-1",
    title: "SQL Infiltration",
    points: 100,
    difficulty: "Iniciante",
    category: "Web",
    description: "Um portal de login corporativo está vulnerável a SQL Injection. O banco de dados relacional contém uma tabela secreta. Obtenha a flag contida nela explorando o parâmetro de input.",
    hint: "Dica: Tente injetar aspas simples (') para quebrar a query ou use payloads de UNION Select."
  },
  {
    id: "ctf-4",
    title: "Hash Telemetry",
    points: 100,
    difficulty: "Iniciante",
    category: "Cryptography",
    description: "Interceptamos um hash MD5 da comunicação interna de um operador malicioso: e99a18c428cb38d5f260853678922e03. Descubra a senha correspondente em texto claro.",
    hint: "Dica: A senha em texto claro é uma variação do nome da nossa arena. O formato da flag final é FLAG{senha_descoberta}."
  },
  {
    id: "ctf-5",
    title: "Shadow Exfiltration",
    points: 200,
    difficulty: "Médio",
    category: "Forensics",
    description: "Analise a telemetria PCAP capturada do tráfego interno. Um atacante exfiltrou informações confidenciais através de canais ocultos no protocolo DNS (DNS Tunneling). Identifique a flag transmitida.",
    hint: "Dica: Inspecione requisições do tipo TXT e queries de subdomínios codificados em Base64."
  },
  {
    id: "ctf-2",
    title: "Buffer Overflow POC",
    points: 250,
    difficulty: "Médio",
    category: "Pwnable",
    description: "Um executável compilado em C e rodando em arquitetura x86 possui uma vulnerabilidade de estouro de buffer clássica. Analise a pilha (stack) para sobrescrever a variável de controle e capturar a flag.",
    hint: "Dica: Calcule o offset correto até a variável de retorno para injetar o payload de controle."
  },
  {
    id: "ctf-3",
    title: "Reverse Engineering Vault",
    points: 400,
    difficulty: "Avançado",
    category: "Reversing",
    description: "Recebemos um binário ELF criptografado que atua como cofre digital. Ele executa validações complexas, incluindo operações bitwise XOR e loops de verificação matemática. Descompile o binário e extraia a flag.",
    hint: "Dica: Utilize ferramentas como Ghidra ou IDA Pro para inspecionar a função main e os arrays de constantes XOR."
  }
]

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState<"desafios" | "integracoes">("desafios")
  const [solvedCtfs, setSolvedCtfs] = useState<string[]>([])
  const [flags, setFlags] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  // CTFtime State
  const [ctftimeEvents, setCtftimeEvents] = useState<any[]>([])
  const [loadingCtftime, setLoadingCtftime] = useState(false)

  // Root-Me State
  const [rootmeUsername, setRootmeUsername] = useState("")
  const [rootmeProfile, setRootmeProfile] = useState<any>(null)
  const [syncingRootme, setSyncingRootme] = useState(false)

  // picoCTF State
  const [picoUrl, setPicoUrl] = useState("https://play.picoctf.org")
  const [picoStatus, setPicoStatus] = useState<any>(null)
  const [testingPico, setTestingPico] = useState(false)

  useEffect(() => {
    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }
    
    setIsAuthenticated(true)
    setIsCheckingAuth(false)

    // Load solved CTFs from localStorage
    const savedSolved = localStorage.getItem("skillar_solved_ctfs")
    if (savedSolved) {
      try {
        setSolvedCtfs(JSON.parse(savedSolved))
      } catch (e) {
        console.error("Error parsing solved CTFs", e)
      }
    }

    // Load saved Root-Me Username
    const savedRootme = localStorage.getItem("skillar_rootme_user")
    if (savedRootme) {
      setRootmeUsername(savedRootme)
      syncRootmeProfile(savedRootme)
    }

    // Load saved picoCTF instance URL
    const savedPico = localStorage.getItem("skillar_pico_url")
    if (savedPico) {
      setPicoUrl(savedPico)
    }
  }, [router])

  // Trigger CTFtime loading when switching tabs
  useEffect(() => {
    if (activeTab === "integracoes" && ctftimeEvents.length === 0) {
      fetchCtftimeEvents()
    }
  }, [activeTab, ctftimeEvents.length])

  // API Call: CTFtime
  const fetchCtftimeEvents = async () => {
    setLoadingCtftime(true)
    try {
      const response = await fetch("/api/practice/ctftime")
      if (response.ok) {
        const data = await response.json()
        setCtftimeEvents(data)
      } else {
        showToast("Erro ao carregar dados do CTFtime", "error")
      }
    } catch (err) {
      showToast("Erro de conexão ao acessar dados externos do CTFtime", "error")
    } finally {
      setLoadingCtftime(false)
    }
  }

  // API Call: Root-Me Sync
  const syncRootmeProfile = async (usernameToSync: string) => {
    if (!usernameToSync.trim()) {
      showToast("Insira um username do Root-Me válido", "error")
      return
    }
    setSyncingRootme(true)
    try {
      const response = await fetch(`/api/practice/rootme?username=${encodeURIComponent(usernameToSync.trim())}`)
      const data = await response.json()
      if (response.ok && data.synced) {
        setRootmeProfile(data)
        localStorage.setItem("skillar_rootme_user", usernameToSync.trim())
        showToast("Perfil do Root-Me sincronizado com sucesso!", "success")
      } else {
        showToast(data.error || "Erro ao localizar perfil no Root-Me", "error")
      }
    } catch (err) {
      showToast("Erro na requisição à API do Root-Me", "error")
    } finally {
      setSyncingRootme(false)
    }
  }

  // Action: Unlink Root-Me
  const handleUnlinkRootme = () => {
    setRootmeProfile(null)
    setRootmeUsername("")
    localStorage.removeItem("skillar_rootme_user")
    showToast("Conta do Root-Me desvinculada", "info")
  }

  // API Call: picoCTF Test
  const handleTestPico = async () => {
    if (!picoUrl.trim()) {
      showToast("A URL da instância picoCTF não pode estar em branco", "error")
      return
    }
    setTestingPico(true)
    try {
      const response = await fetch(`/api/practice/picoctf?url=${encodeURIComponent(picoUrl.trim())}`)
      const data = await response.json()
      setPicoStatus(data)
      localStorage.setItem("skillar_pico_url", picoUrl.trim())
      if (data.status === "ONLINE") {
        showToast("Conexão estabelecida com a instância picoCTF!", "success")
      } else {
        showToast(data.message || "Conexão com a instância picoCTF limitada", "warning")
      }
    } catch (err) {
      showToast("Falha crítica de comunicação com o servidor picoCTF", "error")
    } finally {
      setTestingPico(false)
    }
  }

  const handleFlagSubmit = async (challengeId: string) => {
    const username = localStorage.getItem("skillar_username")
    const flag = flags[challengeId] || ""

    if (!username) {
      router.push("/login")
      return
    }

    if (!flag.trim()) {
      showToast("Por favor, insira a flag", "error")
      return
    }

    setSubmitting(prev => ({ ...prev, [challengeId]: true }))

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          challengeId,
          flag: flag.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showToast(`Correto! +${data.pointsAdded} flags adicionadas ao Scoreboard!`, "success")
        
        const newSolved = [...solvedCtfs, challengeId]
        setSolvedCtfs(newSolved)
        localStorage.setItem("skillar_solved_ctfs", JSON.stringify(newSolved))
      } else {
        showToast(data.error || "Flag incorreta. Tente novamente!", "error")
      }
    } catch (error) {
      showToast("Erro ao submeter flag", "error")
    } finally {
      setSubmitting(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Iniciante":
        return <Badge className="rounded-none border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase">Iniciante</Badge>
      case "Médio":
        return <Badge className="rounded-none border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase">Médio</Badge>
      case "Avançado":
        return <Badge className="rounded-none border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[9px] uppercase">Avançado</Badge>
      default:
        return null
    }
  }

  const categories = ["Todos", "Web", "Pwnable", "Reversing", "Cryptography", "Forensics"]

  const filteredChallenges = PRACTICE_CTFS.filter(ctf => {
    const matchesCategory = activeCategory === "Todos" || ctf.category === activeCategory
    const matchesSearch = ctf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ctf.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs">ACESSANDO CANAL PRÁTICA...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      <Navigation />
      <ToastContainer />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-10">
        {/* Page Header */}
        <div className="mb-8 border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white uppercase tracking-widest mb-2">
              SKILLAR_ARENA://PRACTICE_CTF
            </h1>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Desafios CTF individuais e independentes. Capture flags nos sistemas alvos ou conecte plataformas externas para treinar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
            {/* Tab Switched Header */}
            <div className="flex border border-border bg-zinc-950 p-1">
              <button
                onClick={() => setActiveTab("desafios")}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 transition-all ${
                  activeTab === "desafios"
                    ? "bg-primary text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                ./desafios_internos
              </button>
              <button
                onClick={() => setActiveTab("integracoes")}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 transition-all ${
                  activeTab === "integracoes"
                    ? "bg-primary text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                ./plataformas_externas
              </button>
            </div>
            
            {activeTab === "desafios" && (
              <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-3">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">CONCLUÍDOS:</span>
                  <span className="text-xs font-bold text-white tracking-widest">{solvedCtfs.length} / {PRACTICE_CTFS.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Local Challenges */}
        {activeTab === "desafios" && (
          <>
            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-stretch md:items-center bg-zinc-950 p-4 border border-border">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase mr-2 flex items-center gap-1">
                  <Funnel className="h-3 w-3" /> CATEGORIA:
                </span>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-[10px] uppercase font-bold px-3 py-1.5 border transition-all ${
                      activeCategory === category
                        ? "border-primary bg-primary text-black"
                        : "border-border bg-black text-zinc-500 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlass className="h-4 w-4 text-zinc-500" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar desafios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black text-xs border border-border pl-9 pr-3 py-2 outline-none focus:border-primary text-white w-full rounded-none font-mono placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Challenges Grid */}
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 p-4 bg-zinc-950">
                <Warning className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-xs font-bold text-white uppercase mb-1">Nenhum desafio encontrado</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Tente ajustar seus termos de pesquisa ou filtros de categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredChallenges.map(ctf => {
                  const isSolved = solvedCtfs.includes(ctf.id)
                  const userFlag = flags[ctf.id] || ""

                  return (
                    <Card 
                      key={ctf.id} 
                      className={`rounded-none border transition-all duration-300 bg-zinc-950 flex flex-col justify-between ${
                        isSolved 
                          ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                          : "border-border hover:border-zinc-700"
                      }`}
                    >
                      <CardHeader className="border-b border-border/40 pb-4 mb-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {isSolved && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" weight="fill" />}
                              <CardTitle className={`text-sm font-bold uppercase tracking-wider ${isSolved ? 'text-emerald-400' : 'text-white'}`}>
                                {ctf.title}
                              </CardTitle>
                            </div>
                            <span className="text-[9px] font-bold text-primary uppercase font-mono tracking-widest">
                              {ctf.category}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-bold font-mono text-white bg-zinc-900 border border-border px-2 py-0.5 shrink-0 uppercase">
                              {ctf.points} PTS
                            </span>
                            {getDifficultyBadge(ctf.difficulty)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                            {ctf.description}
                          </p>
                          
                          {ctf.hint && (
                            <div className="mt-3 p-2 bg-zinc-900 border border-border/60 text-[10px] text-zinc-500 font-mono leading-relaxed">
                              <strong className="text-zinc-400">HINT:</strong> {ctf.hint}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-border/40">
                          {isSolved ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold justify-center uppercase tracking-widest">
                              <CheckCircle className="h-4 w-4" weight="fill" />
                              LAB_STATUS://RESOLVIDO_FLAG_CAPTURED
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor={`flag-${ctf.id}`} className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono block">Submeter Flag Capturada:</Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`flag-${ctf.id}`}
                                  type="text"
                                  placeholder="FLAG{...}"
                                  value={userFlag}
                                  onChange={(e) => setFlags(prev => ({ ...prev, [ctf.id]: e.target.value }))}
                                  className="bg-black text-xs border border-border rounded-none px-3 py-1.5 outline-none focus:border-primary text-white w-full font-mono placeholder:text-zinc-700"
                                  disabled={submitting[ctf.id]}
                                />
                                <Button
                                  onClick={() => handleFlagSubmit(ctf.id)}
                                  disabled={submitting[ctf.id]}
                                  className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary font-bold font-mono text-xs px-4 uppercase shrink-0"
                                >
                                  {submitting[ctf.id] ? "SUBMETENDO..." : "ENVIAR"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Tab 2: External CTF APIs Integrations */}
        {activeTab === "integracoes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Column 1: CTFtime Event Feed */}
            <Card className="rounded-none border border-border bg-zinc-950 lg:col-span-1">
              <CardHeader className="border-b border-border/40 pb-4 mb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <Globe className="h-4.5 w-4.5 text-primary" />
                  CTFtime // EVENTOS GLOBAIS
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 font-mono">
                  Próximas competições de cibersegurança internacionais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCtftime ? (
                  <div className="text-center py-10 font-mono text-zinc-500 text-xs">
                    <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    CONECTANDO AO FEED GLOBAL...
                  </div>
                ) : ctftimeEvents.length === 0 ? (
                  <div className="text-center py-10 font-mono text-zinc-600 text-xs">
                    Nenhum evento agendado ou erro de API.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ctftimeEvents.map((event, index) => (
                      <div key={index} className="p-3 border border-border/80 bg-black space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-white uppercase truncate">{event.title}</h4>
                          <Badge className="text-[8px] bg-zinc-900 border border-border text-primary rounded-none shrink-0 uppercase">
                            {event.format || "Jeopardy"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-[9px] text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <CalendarBlank className="h-3.5 w-3.5 text-zinc-600" />
                            <span>Início: {new Date(event.start).toLocaleDateString()} {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <Globe className="h-3.5 w-3.5 text-zinc-600" />
                            <span>Org: {event.organizers || "CTFtime Group"}</span>
                          </div>
                        </div>
                        <div className="pt-1 flex gap-2">
                          <a 
                            href={event.ctftime_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 text-center py-1 text-[9px] border border-border hover:border-primary text-zinc-400 hover:text-primary transition-all font-bold uppercase"
                          >
                            VER CTFTIME
                          </a>
                          {event.url && (
                            <a 
                              href={event.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex-1 text-center py-1 text-[9px] border border-primary/20 bg-primary/5 hover:bg-primary hover:text-black text-primary transition-all font-bold uppercase"
                            >
                              PLATAFORMA
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-center">
                      <Button 
                        onClick={fetchCtftimeEvents} 
                        variant="ghost" 
                        size="sm" 
                        className="text-[9px] text-zinc-500 hover:text-primary uppercase tracking-widest font-mono font-bold"
                      >
                        RECARREGAR FEED
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Root-Me Sync Module */}
            <Card className="rounded-none border border-border bg-zinc-950 lg:col-span-1">
              <CardHeader className="border-b border-border/40 pb-4 mb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <Shield className="h-4.5 w-4.5 text-primary" />
                  Root-Me // INTEGRADOR DE PERFIL
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 font-mono">
                  Sincronize suas pontuações e status da plataforma Root-Me.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rootmeProfile ? (
                  /* Profile Dashboard view */
                  <div className="space-y-4 font-mono">
                    <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                        <span className="text-zinc-500 font-bold uppercase text-[9px]">AGENT_STATUS:</span>
                        <Badge className="bg-emerald-500 text-black font-bold text-[8px] rounded-none uppercase animate-pulse">SINCRONIZADO</Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Username:</span>
                          <span className="text-white font-bold">{rootmeProfile.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Score Root-Me:</span>
                          <span className="text-primary font-bold">{rootmeProfile.score} PTS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Posição Global:</span>
                          <span className="text-white">#{rootmeProfile.position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Patente:</span>
                          <span className="text-white bg-zinc-900 border border-border px-1 text-[10px] uppercase font-bold">{rootmeProfile.rank}</span>
                        </div>
                      </div>
                    </div>

                    {rootmeProfile.simulated && (
                      <div className="p-2 border border-amber-500/20 bg-amber-500/5 text-[9px] text-amber-500 flex gap-1.5 items-start">
                        <Warning className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Visualização offline/simulada devido a limites de requisição da API pública do Root-Me.</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => syncRootmeProfile(rootmeUsername)}
                        disabled={syncingRootme}
                        className="flex-1 rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold text-[10px] uppercase py-2"
                      >
                        {syncingRootme ? "SINCRONIZANDO..." : "ATUALIZAR"}
                      </Button>
                      <Button
                        onClick={handleUnlinkRootme}
                        variant="outline"
                        className="rounded-none border-border hover:border-red-500/50 hover:text-red-400 text-[10px] font-mono transition-all px-3"
                      >
                        DESVINCULAR
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Sync Input view */
                  <div className="space-y-4">
                    <div className="p-3 border border-border bg-black text-[11px] text-zinc-500 leading-relaxed">
                      Insira o seu nome de usuário (nom) do Root-Me para buscar seus dados e conquistas de forma automatizada via API pública.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rootme-user" className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Username Root-Me:</Label>
                      <Input
                        id="rootme-user"
                        type="text"
                        placeholder="Ex: tiagomatias930"
                        value={rootmeUsername}
                        onChange={(e) => setRootmeUsername(e.target.value)}
                        className="bg-black text-xs border border-border rounded-none px-3 py-2 outline-none focus:border-primary text-white w-full font-mono placeholder:text-zinc-700"
                        disabled={syncingRootme}
                      />
                    </div>
                    <Button
                      onClick={() => syncRootmeProfile(rootmeUsername)}
                      disabled={syncingRootme || !rootmeUsername.trim()}
                      className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary font-bold font-mono text-xs py-3 uppercase tracking-wider"
                    >
                      {syncingRootme ? (
                        <>
                          <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                          PROCURANDO PERFIL...
                        </>
                      ) : (
                        "SINCRONIZAR OPERAÇÕES"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 3: picoCTF OpenAPI Explorer */}
            <Card className="rounded-none border border-border bg-zinc-950 lg:col-span-1">
              <CardHeader className="border-b border-border/40 pb-4 mb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <User className="h-4.5 w-4.5 text-primary" />
                  picoCTF // INSTANCE EXPLORER
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 font-mono">
                  Gerenciador de instâncias picoCTF locais ou públicas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border border-border bg-black text-[11px] text-zinc-500 leading-relaxed">
                  picoCTF possui suporte nativo para OpenAPI (API Web). Caso você esteja rodando sua própria instância do picoCTF, configure e teste a integridade da API abaixo.
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pico-url" className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Endereço da Instância:</Label>
                  <Input
                    id="pico-url"
                    type="text"
                    placeholder="https://play.picoctf.org"
                    value={picoUrl}
                    onChange={(e) => setPicoUrl(e.target.value)}
                    className="bg-black text-xs border border-border rounded-none px-3 py-2 outline-none focus:border-primary text-white w-full font-mono placeholder:text-zinc-700"
                    disabled={testingPico}
                  />
                </div>

                <Button
                  onClick={handleTestPico}
                  disabled={testingPico}
                  className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary font-bold font-mono text-xs py-3 uppercase tracking-wider"
                >
                  {testingPico ? (
                    <>
                      <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                      TESTANDO INSTÂNCIA...
                    </>
                  ) : (
                    "TESTAR CONEXÃO DA API"
                  )}
                </Button>

                {picoStatus && (
                  <div className="border border-border p-3 bg-black space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">STATUS:</span>
                      <Badge className={`rounded-none text-[9px] font-mono border font-bold uppercase ${
                        picoStatus.status === "ONLINE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
                          : picoStatus.status === "LIMITED_ACCESS"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {picoStatus.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">{picoStatus.message}</p>
                    
                    <div className="pt-2 border-t border-border/40 space-y-1.5 text-[9px] text-zinc-500">
                      <div className="flex items-center gap-1">
                        <LinkSimple className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="truncate">Docs: <a href={picoStatus.apiDocs} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{picoStatus.apiDocs}</a></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LinkSimple className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="truncate">Swagger: <a href={picoStatus.openApiSchema} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{picoStatus.openApiSchema}</a></span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
