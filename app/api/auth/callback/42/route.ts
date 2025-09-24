import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("OAuth callback API called")
  
  try {
    const body = await request.json()
    const { code } = body
    
    console.log("Received code:", code ? code.substring(0, 10) + "..." : "null")

    if (!code) {
      console.log("No code provided")
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      )
    }

    // OAuth credentials
    const clientId = 'u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229'
    const clientSecret = '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'
    const redirectUri = 'https://42skillar.vercel.app/login'

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
    })

    console.log("Making token request to 42 API...")
    
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      },
      body: tokenParams.toString()
    })

    console.log("Token response status:", tokenResponse.status)
    console.log("Token response headers:", Object.fromEntries(tokenResponse.headers.entries()))

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("42 API token error:", tokenResponse.status, errorText)
      return NextResponse.json(
        { 
          error: `Failed to get access token from 42 API`,
          details: errorText,
          status: tokenResponse.status
        },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log("Token received, access_token length:", tokenData.access_token?.length)

    // Get user info from 42 API
    console.log("Making user info request...")
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      }
    })

    console.log("User response status:", userResponse.status)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("Failed to get user info:", userResponse.status, errorText)
      return NextResponse.json(
        { 
          error: 'Failed to get user info from 42 API',
          details: errorText,
          status: userResponse.status
        },
        { status: 400 }
      )
    }

    const userData = await userResponse.json()
    console.log("User data received for:", userData.login)

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

    console.log("Returning success response")
    return NextResponse.json(result)

  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error during OAuth callback",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("GET request to callback API - returning method not allowed")
  return NextResponse.json(
    { error: "This endpoint only accepts POST requests", timestamp: new Date().toISOString() },
    { status: 405 }
  )
}