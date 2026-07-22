"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Crosshair, Trophy, CheckCircle, Warning, MagnifyingGlass, Funnel } from "@phosphor-icons/react"
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
  const [solvedCtfs, setSolvedCtfs] = useState<string[]>([])
  const [flags, setFlags] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

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
  }, [router])

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
        
        // Add to solved local state and localStorage
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
              Desafios CTF individuais e independentes. Capture flags nos sistemas alvos e acumule pontos para subir na classificação global.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-3 shrink-0 self-start md:self-center">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">DESAFIOS RESOLVIDOS:</span>
              <span className="text-xs font-bold text-white tracking-widest">{solvedCtfs.length} / {PRACTICE_CTFS.length}</span>
            </div>
          </div>
        </div>

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
      </main>
    </div>
  )
}
