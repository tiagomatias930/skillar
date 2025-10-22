import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Store used codes temporarily (in production, use a database or Redis)
const usedCodes = new Set<string>()

export async function POST(request: NextRequest) {
  console.log("=== OAuth Callback API Called ===")
  
  try {
    const body = await request.json()
    const { code } = body
    
    console.log("Received code:", code ? code.substring(0, 10) + "..." : "null")

    if (!code) {
      console.log("❌ No code provided")
      return NextResponse.json(
        { 
          success: false, 
          error: "Authorization code is required" 
        },
        { status: 400 }
      )
    }

    // Check if code was already used
    if (usedCodes.has(code)) {
      console.log("❌ Code already used:", code.substring(0, 10) + "...")
      return NextResponse.json(
        { 
          success: false,
          error: "Authorization code has already been used"
        },
        { status: 400 }
      )
    }

    // Mark code as used
    usedCodes.add(code)
    console.log("✅ Code marked as used")

    // OAuth credentials
    const clientId = 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229'
    const clientSecret = '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'
    const redirectUri = 'https://42skillar.vercel.app/login'

    console.log("🔄 Exchanging code for token...")

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
    })

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
      console.error("❌ Token exchange failed:", tokenResponse.status, errorText)
      
      // Remove code from used set if token exchange failed
      usedCodes.delete(code)
      
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to get access token from 42 API",
          details: errorText,
          status: tokenResponse.status
        },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log("✅ Token received, access_token length:", tokenData.access_token?.length)

    // Get user info from 42 API
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
          error: 'Failed to get user info from 42 API',
          details: errorText,
          status: userResponse.status
        },
        { status: 400 }
      )
    }

    const userData = await userResponse.json()
    console.log("✅ User authenticated:", userData.login)

    // Persist user with avatar_url
    const { createUserWithAvatar } = await import("@/lib/database")
    const username = userData.login.trim()
    const avatar_url = userData.image?.link || userData.image
    await createUserWithAvatar(username, avatar_url)

    const result = {
      success: true,
      username,
      access_token: tokenData.access_token,
      user_data: {
        id: userData.id,
        email: userData.email,
        displayname: userData.displayname,
        image: avatar_url,
        campus: userData.campus?.[0]?.name || null
      }
    }

    console.log("🎉 Authentication successful!")
    return NextResponse.json(result)

  } catch (error) {
    console.error("💥 OAuth callback error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error during OAuth callback",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: "This endpoint only accepts POST requests",
      timestamp: new Date().toISOString(),
      status: "API is running"
    },
    { status: 405 }
  )
}