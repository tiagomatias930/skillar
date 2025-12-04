import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    console.log("=== OAuth Callback API Called ===")
    
    const body = await request.json().catch(() => null)
    console.log("Request body:", body)
    
    const { code } = body || {}
    
    if (!code) {
      console.log("❌ No authorization code provided")
      return NextResponse.json(
        { 
          success: false, 
          error: "Authorization code is required" 
        },
        { status: 400, headers }
      )
    }

    console.log("✅ Code received:", code.substring(0, 10) + "...")

    // OAuth credentials
    const clientId = process.env.INTRA42_CLIENT_ID
    const clientSecret = process.env.INTRA42_CLIENT_SECRET;
    const redirectUri = 'https://42skillar.vercel.app/login'

    // Ensure credentials are present at runtime
    if (!clientId || !clientSecret) {
      console.error("❌ Missing OAuth client credentials")
      return NextResponse.json(
        {
          success: false,
          error: "OAuth client credentials not configured"
        },
        { status: 500, headers }
      )
    }

    console.log("🔄 Exchanging code for token...")

    // Exchange code for access token
    const tokenParams = new URLSearchParams()
    tokenParams.append('grant_type', 'authorization_code')
    tokenParams.append('client_id', clientId)
    tokenParams.append('client_secret', clientSecret)
    tokenParams.append('code', String(code))
    tokenParams.append('redirect_uri', redirectUri)

    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      },
      body: tokenParams.toString()
    })

    console.log("📡 Token response status:", tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("❌ Token exchange failed:", errorText)
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to exchange authorization code",
          details: errorText
        },
        { status: 400, headers }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log("✅ Token received, length:", tokenData.access_token?.length)

    // Get user info
    console.log("👤 Fetching user data...")
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      }
    })

    console.log("👤 User response status:", userResponse.status)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("❌ User info failed:", errorText)
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to get user information",
          details: errorText
        },
        { status: 400, headers }
      )
    }

    const userData = await userResponse.json()
    console.log("✅ User authenticated:", userData.login)

    const result = {
      success: true,
      username: userData.login.trim(),
      access_token: tokenData.access_token,
      user_data: {
        id: userData.id,
        email: userData.email,
        displayname: userData.displayname,
        image: userData.image?.link || userData.image,
        campus: userData.campus?.[0]?.name || null
      }
    }

    console.log("🎉 Authentication successful!")
    return NextResponse.json(result, { headers })

  } catch (error) {
    console.error("💥 OAuth callback error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "This endpoint only accepts POST requests",
      timestamp: new Date().toISOString(),
      status: "API is running"
    },
    { status: 405 }
  )
}