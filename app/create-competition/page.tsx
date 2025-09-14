"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"

export default function CreateCompetitionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }

    if (!title.trim() || !description.trim()) {
      setError("Título e descrição são obrigatórios")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          creatorUsername: username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar competição")
      }

      router.push(`/competitions/${data.competition.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Competição</h1>
            <p className="text-gray-600">Defina os detalhes da sua competição semanal</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Competição</CardTitle>
              <CardDescription>Sua competição será ativa por 7 dias a partir da criação</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Título da Competição</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ex: Desafio de Programação Semanal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os objetivos, regras e critérios de avaliação da competição..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Criando..." : "Criar Competição"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
