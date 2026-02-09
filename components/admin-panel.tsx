"use client"

import type React from "react"
import { useToast } from "@/components/toast"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Ban, RotateCcw } from "lucide-react"

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
    <div className="space-y-6">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Painel Administrativo
          </CardTitle>
          <CardDescription>Ferramentas para gerenciar a plataforma SkillarCode</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Close Competitions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <RotateCcw className="h-5 w-5" />
              Fechar Competições Expiradas
            </CardTitle>
            <CardDescription>Encerra automaticamente competições que passaram de 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCloseCompetitions} disabled={isClosingCompetitions} className="w-full">
              {isClosingCompetitions ? "Fechando..." : "Fechar Competições Expiradas"}
            </Button>
          </CardContent>
        </Card>

        {/* Blacklist User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Adicionar à Lista Negra
            </CardTitle>
            <CardDescription>Banir usuário que violou as regras da comunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBlacklistUser} className="space-y-4">
              <div>
                <Label htmlFor="blacklist-username">Username</Label>
                <Input
                  id="blacklist-username"
                  type="text"
                  placeholder="Username do usuário"
                  value={blacklistUsername}
                  onChange={(e) => setBlacklistUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="blacklist-reason">Motivo (opcional)</Label>
                <Textarea
                  id="blacklist-reason"
                  placeholder="Motivo do banimento..."
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isBlacklisting} className="w-full bg-red-600 hover:bg-red-700">
                {isBlacklisting ? "Adicionando..." : "Adicionar à Lista Negra"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
