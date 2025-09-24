import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import router from "next/dist/shared/lib/router/router"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      throw new Error('No authorization code provided')
    }

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
        redirect_uri: 'https://42skillar.vercel.app/competitions' // Must match exactly what's registered in 42 OAuth app
      }).toString()
    })

    console.log("Token response status:", tokenResponse.status)
    const tokenData = await tokenResponse.json()
    console.log("Token response body:", JSON.stringify(tokenData, null, 2))

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

    let primaryCampus = userData.campus_users?.[0]?.campus?.name || "Unknown Campus"
    console.log("Detected primary campus:", primaryCampus)

    // Prepare user data
    const userInfo = {
      username: userData.login,
      intra_id: userData.id,
      email: userData.email,
      avatar_url: userData.image?.link,
      campus: primaryCampus,
      displayname: `${userData.login} - ${primaryCampus}`,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      location: userData.location,
      correction_points: userData.correction_point || 0,
      wallet: userData.wallet || 0,
      is_staff: Boolean(userData.staff),
      updated_at: new Date().toISOString()
    }
    
    try {
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
      return NextResponse.redirect("https://42skillar.vercel.app/competitions")
    } catch (error: unknown) {
      alert("Login failed: " + (error instanceof Error ? error.message : "Unknown error"))
      console.error("Login API error: ++++", error)
    } finally {
      console.log("Finished OAuth callback processing ++++")
      alert("Finished OAuth callback processing ++++")  
      // No loading state to set in server-side code
    }
  
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      `https://42skillar.vercel.app/login?error=${encodeURIComponent((error as Error).message)}`
    )
  }
}