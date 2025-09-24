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
    console.log("Starting OAuth callback processing with code:", code.substring(0, 10) + "...")
    
    // Test if API route exists first
    try {
      const testResponse = await fetch("/api/auth/callback", {
        method: "GET"
      })
      console.log("API route test:", testResponse.status)
    } catch (testError) {
      console.log("API route test failed, might not exist")
    }
    
    // Try server-side callback
    console.log("Attempting server-side callback...")
    const response = await fetch("/api/auth/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    console.log("Callback response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Callback API error:", response.status, errorText)
      
      // If server callback fails, try direct approach as fallback
      console.log("Server callback failed, trying direct approach...")
      return await directOAuthFlow(code, router)
    }

    const data = await response.json()
    console.log("Callback response data:", data)
    
    if (!data.success) {
      throw new Error(data.error || "Authentication failed")
    }

    console.log("OAuth successful for user:", data.username)

    // Store user data
    localStorage.setItem("skillar_username", data.username)
    localStorage.setItem("skillar_access_token", data.access_token)
    
    console.log("Login successful, redirecting to competitions")
    router.push("/competitions")
    
  } catch (error: unknown) {
    console.error("OAuth processing error:", error)
    
    // More user-friendly error handling
    let errorMessage = "Falha na autenticação. "
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage += "Erro de conexão. Tente novamente."
      } else if (error.message.includes("Server callback failed")) {
        errorMessage += "Erro no servidor. Tentando método alternativo..."
        // Try direct approach as last resort
        try {
          await directOAuthFlow(code, router)
          return
        } catch (directError) {
          errorMessage += " Método alternativo também falhou."
        }
      } else {
        errorMessage += error.message
      }
    }
    
    alert(errorMessage)
    
    // Clear OAuth parameters
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.delete('code')
    currentUrl.searchParams.delete('state')
    window.history.replaceState({}, '', currentUrl.toString())
  } finally {
    console.log("Finished OAuth callback processing")
  }
}

// Fallback direct OAuth flow (for when server callback fails)
async function directOAuthFlow(code: string, router: ReturnType<typeof useRouter>) {
  console.log("Attempting direct OAuth flow...")
  
  // Create a simple proxy to avoid CORS
  const proxyUrl = `https://cors-anywhere.herokuapp.com/https://api.intra.42.fr/oauth/token`
  
  try {
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
        redirect_uri: 'https://42skillar.vercel.app/login'
      }).toString()
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    console.log("Direct token received")

    // Get user info
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status}`)
    }

    const userData = await userResponse.json()
    console.log("Direct user data received:", userData.login)

    // Store user data
    localStorage.setItem("skillar_username", userData.login.trim())
    localStorage.setItem("skillar_access_token", tokenData.access_token)
    
    router.push("/competitions")
  } catch (error) {
    console.error("Direct OAuth flow failed:", error)
    throw error
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
    
    console.log('OAuth callback detected:', { code: code?.substring(0, 10), error })
    
    if (error) {
      setError(`OAuth error: ${error}`)
      // Clean up URL parameters
      router.replace('/login')
      return
    }
    
    if (code && !isProcessingOAuth) {
      console.log('Processing OAuth code...')
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
    
    // Use environment variables for OAuth config (you should move these to env vars)
    const clientId = process.env.NEXT_PUBLIC_42_CLIENT_ID || 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229'
    const redirectUri = process.env.NEXT_PUBLIC_42_REDIRECT_URI || 'https://42skillar.vercel.app/login'
    
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
              <div>
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

                {/* Debug info - remova isso depois de resolver o problema */}
                {searchParams.get('code') && (
                  <div className="mt-4 p-3 text-xs bg-gray-100 border rounded">
                    <div>Code detected: {searchParams.get('code')?.substring(0, 20)}...</div>
                    <div>Processing: {isProcessingOAuth ? 'Yes' : 'No'}</div>
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>URL: {window.location.href}</div>
                  </div>
                )}
              </div>
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