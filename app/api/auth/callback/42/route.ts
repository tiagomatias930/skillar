// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server"

// Configuração de CORS
const allowedOrigins = ['https://42skillar.vercel.app', 'http://localhost:3000', 'http://localhost:5000']
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 horas
}

// Handler para OPTIONS (preflight requests)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  // Verificar a origem da requisição
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  // Atualizar o header de CORS com a origem permitida
  const headers = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  }
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      )
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
        client_id: process.env.FORTY_TWO_CLIENT_ID || 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229',
        client_secret: process.env.FORTY_TWO_CLIENT_SECRET || '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',
        code: code,
        redirect_uri: process.env.FORTY_TWO_REDIRECT_URI || 'https://42skillar.vercel.app/login'
      }).toString()
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("42 API token error:", errorData)
      return NextResponse.json(
        { error: errorData.error_description || errorData.error || "Failed to get access token" },
        { status: 400, headers }
      )
    }

    const tokenData = await tokenResponse.json()

    // Get user info from 42 API
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    if (!userResponse.ok) {
      console.error("Failed to get user info from 42 API")
      return NextResponse.json(
        { error: 'Failed to get user info from 42 API' },
        { status: 400, headers }
      )
    }

    const userData = await userResponse.json()

    // Here you can save the user to your database or perform other operations
    // For now, we'll just return the user data
    
    return NextResponse.json({
      success: true,
      username: userData.login.trim(),
      access_token: tokenData.access_token,
      user_data: {
        id: userData.id,
        email: userData.email,
        displayname: userData.displayname,
        image: userData.image,
        campus: userData.campus?.[0]?.name || null
      }
    }, { headers })

  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.json(
      { error: "Internal server error during OAuth callback" },
      { status: 500, headers }
    )
  }
}

// Handle GET requests (in case someone tries to access this endpoint directly)
export async function GET() {
  return NextResponse.json(
    { error: "This endpoint only accepts POST requests" },
    { status: 405, headers: corsHeaders }
  )
}