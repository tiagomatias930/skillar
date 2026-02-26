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

    // Try the existing callback API endpoint
    const response = await fetch("/api/auth/callback/42", {  // Updated to match your current path
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Authentication failed")
    }

    // Store user data
    localStorage.setItem("skillar_username", data.username)
    localStorage.setItem("skillar_access_token", data.access_token)

    // Clear the processed code to prevent reuse
    localStorage.removeItem('last_processed_code')

    try {
      const response1 = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username.trim() }),
      })

      const data1 = await response1.json()

      if (!response1.ok) {
        throw new Error(data1.error || "Erro ao fazer login")
      }
    } catch (error: unknown) {
      // setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      // setIsLoading(false)
    }

    window.location.href = "https://42skillar.vercel.app/competitions"
    //router.replace("/competitions")    
  } catch (error: unknown) {

    let errorMessage = "Falha na autenticação."
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage += "Erro de conexão. Verifique sua internet."
      } else if (error.message.includes("invalid_grant")) {
        errorMessage += "Código de autorização expirado ou já usado. Tente fazer login novamente."
        // Clear the invalid code
        localStorage.removeItem('last_processed_code')
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
  }
}

async function directOAuthFlow(code: string, router: ReturnType<typeof useRouter>) {
  // This function is no longer needed since we're using a simpler approach
  throw new Error("Direct OAuth flow not implemented")
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
      router.replace('/login')
      return
    }

    // Prevent multiple processing of the same code
    if (code && !isProcessingOAuth && code !== localStorage.getItem('last_processed_code')) {
      localStorage.setItem('last_processed_code', code) // Prevent reprocessing
      setIsProcessingOAuth(true)
      setIsLoading(true)

      login42(code, router).finally(() => {
        setIsLoading(false)
        setIsProcessingOAuth(false)
        // Clean up URL after processing
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.delete('code')
        currentUrl.searchParams.delete('state')
        window.history.replaceState({}, '', currentUrl.toString())
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
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handle42Login = () => {
    setIsLoading(true)
    setError(null)

    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.INTRA42_CLIENT_ID}&redirect_uri=https%3A%2F%2F42skillar.vercel.app%2Flogin&response_type=code`

    window.location.href = authUrl
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/foto_Implementada_no_centro.png')` }}
    >
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl lg:text-3xl font-bold text-gray-900">
            {/*<img src="/42skillar.png" alt="42Skillar Logo" className="h-10 w-10 object-contain" />*/}
            <h1 className="text-lg lg:text-xl xl:text-2xl text-white">SkillarCode</h1>
            <p className="text-center text-sm lg:text-base text-italic text-gray-300">Arena dos Campeões</p>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl text-center">Entrar no SkillarCode</CardTitle>
            <CardDescription className="text-center">
              {isProcessingOAuth
                ? "Processando login da 42..."
                : "Escolha um método para entrar"
              }
            </CardDescription>
                   </CardHeader>
          <CardContent>
            {!isProcessingOAuth && (
              <div>
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
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
                      {isLoading ? "Redirecionando..." : "Entrar com o intra.42.fr"}
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
                <p>Autenticando com 42.intra.fr</p>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Arena dos Campeões</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
