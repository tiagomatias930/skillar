"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crosshair } from "@phosphor-icons/react"
import Link from "next/link"
import { NextResponse } from 'next/server'


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

    // Redirect through server-side API route so it can read the env var from Vercel
    window.location.href = "/api/auth/42/redirect"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative font-mono text-white">
      {/* Decorative scanning line grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="h-12 w-12 border border-primary/40 bg-primary/10 flex items-center justify-center mb-2">
              <Crosshair className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-white uppercase">SKILLARCODE://SECURE_SHELL</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">AUTHENTICATION_REQUIRED</p>
          </Link>
        </div>

        <Card className="bg-zinc-950/95 border border-border rounded-none shadow-2xl">
          <CardHeader className="border-b border-border/50 pb-4 mb-4">
            <CardTitle className="text-sm font-bold text-center text-white uppercase tracking-widest">
              SECURE_ACCESS_PORTAL
            </CardTitle>
            <CardDescription className="text-center text-xs text-zinc-500 font-mono">
              {isProcessingOAuth
                ? "ESTABLISHING SECURE CONNECTION TO INTRA_42..."
                : "SELECIONE PROVEDOR DE IDENTIDADE"
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
                      className="w-full rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold py-5 flex items-center justify-center gap-2"
                      onClick={handle42Login}
                      disabled={isLoading}
                    >
                      <img
                        src="https://api.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg"
                        alt="42 Logo"
                        className="h-4 w-4 filter invert"
                      />
                      {isLoading ? "ESTABLISHING_LINK..." : "INITIATE_OAUTH_FLOW://INTRA_42"}
                    </Button>
                  </div>
                </form>

                {/* Debug info */}
                {searchParams.get('code') && (
                  <div className="mt-4 p-3 text-[10px] bg-black border border-border text-zinc-500 font-mono space-y-1">
                    <div>CODE_DETECTED: {searchParams.get('code')?.substring(0, 20)}...</div>
                    <div>PROCESSING: {isProcessingOAuth ? 'TRUE' : 'FALSE'}</div>
                    <div>LINK_ACTIVE: {isLoading ? 'TRUE' : 'FALSE'}</div>
                  </div>
                )}
              </div>
            )}

            {isProcessingOAuth && (
              <div className="text-center p-8">
                <div className="animate-spin rounded-none h-10 w-10 border border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-zinc-500 text-xs">VERIFYING DIGITAL SIGNATURE...</p>
              </div>
            )}

            <div className="mt-6 text-center text-[10px] text-zinc-600 font-mono tracking-widest">
              <p>SKILLAR_CODE // PROT://SSH_AUTH</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
