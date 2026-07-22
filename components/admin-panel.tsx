"use client"

import type React from "react"
import { useToast } from "@/components/toast"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GearSix, Prohibit, ArrowCounterClockwise } from "@phosphor-icons/react"

export function AdminPanel() {
  const [isClosingCompetitions, setIsClosingCompetitions] = useState(false)
  const [blacklistUsername, setBlacklistUsername] = useState("")
  const [blacklistReason, setBlacklistReason] = useState("")
  const [isBlacklisting, setIsBlacklisting] = useState(false)
  const { showToast, ToastContainer } = useToast()

  const handleCloseCompetitions = async () => {
    setIsClosingCompetitions(true)
    try {
      const response = await fetch("/api/admin/close-competitions", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Competições expiradas fechadas com sucesso!", "success")
      } else {
        showToast(data.error || "Erro ao fechar competições", "error")
      }
    } catch (error) {
      showToast("Erro ao fechar competições", "error")
    } finally {
      setIsClosingCompetitions(false)
    }
  }

  const handleBlacklistUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!blacklistUsername.trim()) {
      showToast("Username é obrigatório", "error")
      return
    }

    setIsBlacklisting(true)
    try {
      const response = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: blacklistUsername.trim(),
          reason: blacklistReason.trim() || "Violação das regras da comunidade",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Usuário adicionado à lista negra com sucesso!", "success")
        setBlacklistUsername("")
        setBlacklistReason("")
      } else {
        showToast(data.error || "Erro ao adicionar usuário à lista negra", "error")
      }
    } catch (error) {
      showToast("Erro ao adicionar usuário à lista negra", "error")
    } finally {
      setIsBlacklisting(false)
    }
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      <ToastContainer />
      <Card className="rounded-none border border-border bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
            <div className="h-9 w-9 border border-primary/40 bg-primary/10 flex items-center justify-center">
              <GearSix className="h-4.5 w-4.5 text-primary" />
            </div>
            CONSOLA_ADMIN_ARENA
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 font-mono">Comandos operacionais de SysAdmin para controle do Skillar Arena</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Close Competitions */}
        <Card className="rounded-none border border-border bg-zinc-950 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-400 text-sm font-bold uppercase tracking-wider">
              <div className="h-8 w-8 border border-amber-500/20 bg-amber-500/5 flex items-center justify-center">
                <ArrowCounterClockwise className="h-4 w-4 text-amber-500" />
              </div>
              Desativar Labs Expirados
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-mono">Desativa automaticamente instâncias de laboratórios com limite de tempo excedido</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCloseCompetitions} disabled={isClosingCompetitions} className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold py-2.5 font-mono uppercase tracking-wider">
              {isClosingCompetitions ? "DESATIVANDO LABS..." : "DESATIVAR LABS EXPIRADOS"}
            </Button>
          </CardContent>
        </Card>

        {/* Blacklist User */}
        <Card className="rounded-none border border-border bg-zinc-950 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-500 text-sm font-bold uppercase tracking-wider">
              <div className="h-8 w-8 border border-red-500/20 bg-red-500/5 flex items-center justify-center">
                <Prohibit className="h-4 w-4 text-red-500" />
              </div>
              Inserir na Banlist
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-mono">Bane operadores e bloqueia credenciais PGP/VPN na arena</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBlacklistUser} className="space-y-4">
              <div>
                <Label htmlFor="blacklist-username" className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Identificação do Operador</Label>
                <Input
                  id="blacklist-username"
                  type="text"
                  placeholder="Username do operador..."
                  value={blacklistUsername}
                  onChange={(e) => setBlacklistUsername(e.target.value)}
                  className="bg-black border border-border text-white text-xs rounded-none px-3 py-1.5 outline-none focus:border-primary transition-all font-mono"
                  required
                />
              </div>
              <div>
                <Label htmlFor="blacklist-reason" className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Motivo (opcional)</Label>
                <Textarea
                  id="blacklist-reason"
                  placeholder="Descreva a violação das regras de engajamento..."
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="bg-black border border-border text-white text-xs rounded-none px-3 py-1.5 outline-none focus:border-primary transition-all font-mono"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isBlacklisting} className="w-full rounded-none border border-red-500 bg-red-600 text-white hover:bg-black hover:text-red-400 transition-all font-bold py-2.5 font-mono uppercase tracking-wider">
                {isBlacklisting ? "GRAVANDO BLOQUEIO..." : "GRAVAR BLOQUEIO NA REDE"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
