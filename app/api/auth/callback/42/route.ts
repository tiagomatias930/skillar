import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
        redirect_uri: 'https://42skillar.vercel.app/' // Must match exactly what's registered in 42 OAuth app
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

    // Get primary campus info
    const primaryCampus = userData.campus_users?.[0]?.campus?.name || "Unknown Campus"

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

    // Create or update user in database
    const supabase = await createClient()
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(userInfo, {
        onConflict: 'intra_id'
      })

    if (upsertError) {
      console.error('Failed to upsert user:', upsertError)
      throw new Error('Failed to save user data')
    }

    // Store auth data in session cookie
    const session = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      username: userInfo.username,
      intra_id: userInfo.intra_id,
      displayname: userInfo.displayname,
      avatar_url: userInfo.avatar_url,
      campus: userInfo.campus,
      is_staff: userInfo.is_staff,
    }

    // Store basic user info in localStorage
    const clientData = {
      username: userInfo.username,
      displayname: userInfo.displayname,
      avatar_url: userInfo.avatar_url,
      campus: userInfo.campus,
    }
    
    // Set cookie with client data that should be available in the frontend
    const clientDataCookie = encodeURIComponent(JSON.stringify(clientData))

    // Get redirect URL from state parameter
    const state = searchParams.get("state")
    const redirectUrl = state ? decodeURIComponent(state) : "/competitions"

    // Construct full redirect URL
    const baseUrl = 'https://42skillar.vercel.app' as string
    const finalRedirectUrl = redirectUrl.startsWith("/") 
      ? `${baseUrl}${redirectUrl}`
      : `${baseUrl}/competitions`

    // Create response with redirect
    const response = NextResponse.redirect(finalRedirectUrl)
    
    // Set cookies individually with domain
    response.cookies.set('session', JSON.stringify(session), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    response.cookies.set('skillar_user', clientDataCookie, {
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      `https://42skillar.vercel.app/login?error=${encodeURIComponent((error as Error).message)}`
    )
  }
}