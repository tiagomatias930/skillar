"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

async function login42(code: string, router: ReturnType<typeof useRouter>) {
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229',
        client_secret: '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',
        code: code,
        redirect_uri: 'https://42skillar.vercel.app/login' // Atualizado para redirecionar para a página de login
      }).toString()
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData)
      throw new Error(tokenData.error_description || tokenData.error || "Failed to get access token")
    }

    // Get user info from 42 API
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const userData = await userResponse.json()

    // Enviar dados do usuário para a API de login
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userData.login.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer login")
    }

    // Store username in localStorage for simple session management
    localStorage.setItem("skillar_username", userData.login.trim())
    router.push("/competitions")
  } catch (error: unknown) {
    alert("Login failed: " + (error instanceof Error ? error.message : "Unknown error"))
    console.error("Login API error:", error)
  } finally {
    console.log("Finished OAuth callback processing")
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se há um parâmetro 'code' na URL e chamar login42
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setIsLoading(true)
      login42(code, router).finally(() => setIsLoading(false))
    }
  }, [searchParams, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Por favor, digite um username")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login")
      }

      // Store username in localStorage for simple session management
      localStorage.setItem("skillar_username", username.trim())
      router.push("/competitions")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/_.gif')` }}
    >
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <img src="/42skillar.png" alt="42Skillar Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-lg text-white">Skillar</h1>
            <p className="text-center text-sm text-italic text-gray-300">Arena dos Campeões</p>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Entrar no 42Skillar</CardTitle>
            <CardDescription className="text-center">
              Digite seu username para participar das competições
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="mb-1">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu username único"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full mb-4" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar como Visitante"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou entre com
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full mt-4 bg-[#00BABC] hover:bg-[#00BABC]/90"
                  onClick={() => {
                    setIsLoading(true)
                    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229&redirect_uri=https://42skillar.vercel.app/login&response_type=code`
                  }}
                  disabled={isLoading}
                >
                  <img
                    src="https://api.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg"
                    alt="42 Logo"
                    className="h-5 w-5 mr-2"
                  />
                  Entrar com a 42
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Entre com sua conta da 42 para participar das competições!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}