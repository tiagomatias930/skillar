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
    console.log("Starting OAuth callback processing...")
    
    // Try server-side callback first
    const response = await fetch("/api/auth/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Callback API error:", errorText)
      throw new Error(`Server callback failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || "Authentication failed")
    }

    console.log("OAuth successful for user:", data.username)

    // Try to register/login the user in your system
    try {
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username }),
      })

      if (loginResponse.ok) {
        console.log("User registered/logged in successfully")
      } else {
        console.log("User registration failed, but continuing with OAuth login")
      }
    } catch (apiError) {
      console.log("Login API unavailable, continuing with OAuth login")
    }

    // Store username in localStorage for simple session management
    localStorage.setItem("skillar_username", data.username)
    localStorage.setItem("skillar_access_token", data.access_token)
    
    console.log("Login successful, redirecting to competitions")
    router.push("/competitions")
    
  } catch (error: unknown) {
    console.error("Login API error:", error)
    
    // More user-friendly error handling
    let errorMessage = "Falha na autenticação. "
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage += "Erro de conexão. Verifique sua internet e tente novamente."
      } else if (error.message.includes("CORS")) {
        errorMessage += "Erro de segurança do navegador."
      } else if (error.message.includes("Server callback failed")) {
        errorMessage += "Erro no servidor de autenticação."
      } else {
        errorMessage += error.message
      }
    } else {
      errorMessage += "Erro desconhecido."
    }
    
    alert(errorMessage)
    
    // Clear any OAuth parameters and stay on login page
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.delete('code')
    currentUrl.searchParams.delete('state')
    window.history.replaceState({}, '', currentUrl.toString())
  } finally {
    console.log("Finished OAuth callback processing")
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for OAuth callback code
  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      setError(`OAuth error: ${error}`)
      // Clean up URL parameters
      router.replace('/login')
      return
    }
    
    if (code && !isProcessingOAuth) {
      setIsProcessingOAuth(true)
      setIsLoading(true)
      login42(code, router).finally(() => {
        setIsLoading(false)
        setIsProcessingOAuth(false)
      })
    }
  }, [searchParams, router, isProcessingOAuth])

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
      console.error("Guest login error:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handle42Login = () => {
    setIsLoading(true)
    setError(null)
    
    const clientId = 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229'
    const redirectUri = 'https://42skillar.vercel.app/login'
    
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public`
    
    window.location.href = authUrl
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
              {isProcessingOAuth 
                ? "Processando login da 42..." 
                : "Digite seu username para participar das competições"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isProcessingOAuth && (
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
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                      {error}
                    </div>
                  )}

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
                    onClick={handle42Login}
                    disabled={isLoading}
                  >
                    <img
                      src="https://api.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg"
                      alt="42 Logo"
                      className="h-5 w-5 mr-2"
                    />
                    {isLoading ? "Redirecionando..." : "Entrar com a 42"}
                  </Button>
                </div>
              </form>
            )}

            {isProcessingOAuth && (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BABC] mx-auto mb-4"></div>
                <p>Autenticando com a 42...</p>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Entre com sua conta da 42 para participar das competições!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}