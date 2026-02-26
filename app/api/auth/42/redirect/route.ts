import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.INTRA42_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: "INTRA42_CLIENT_ID not configured" },
      { status: 500 }
    )
  }

  const redirectUri = encodeURIComponent("https://42skillar.vercel.app/login")
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`

  return NextResponse.redirect(authUrl)
}
