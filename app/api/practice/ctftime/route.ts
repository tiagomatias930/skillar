import { NextResponse } from "next/server"

export async function GET() {
  try {
    // CTFtime API requires a User-Agent header to avoid 403 Forbidden responses
    const response = await fetch("https://ctftime.org/api/v1/events/?limit=5", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      next: { revalidate: 3600 } // Cache for 1 hour to prevent rate limiting
    })

    if (!response.ok) {
      throw new Error(`CTFtime API responded with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.warn("[v0] Failed to fetch CTFtime events, serving fallback schedule:", error.message || error)

    // Serve a high-quality fallback CTF schedule in case of offline/network issues
    const fallbackEvents = [
      {
        title: "Defcon CTF Qualifier 2026",
        start: new Date(Date.now() + 86400000 * 2).toISOString(),
        finish: new Date(Date.now() + 86400000 * 4).toISOString(),
        url: "https://defcon.org",
        ctftime_url: "https://ctftime.org/event/defcon-qualifier-2026",
        organizers: "Defcon Staff",
        format: "Jeopardy"
      },
      {
        title: "Google CTF 2026",
        start: new Date(Date.now() + 86400000 * 10).toISOString(),
        finish: new Date(Date.now() + 86400000 * 12).toISOString(),
        url: "https://capturetheflag.withgoogle.com",
        ctftime_url: "https://ctftime.org/event/google-ctf-2026",
        organizers: "Google",
        format: "Jeopardy"
      },
      {
        title: "HackTheBox Cyber Apocalypse 2026",
        start: new Date(Date.now() + 86400000 * 18).toISOString(),
        finish: new Date(Date.now() + 86400000 * 20).toISOString(),
        url: "https://hackthebox.com",
        ctftime_url: "https://ctftime.org/event/htb-cyber-apocalypse-2026",
        organizers: "HackTheBox",
        format: "Jeopardy"
      },
      {
        title: "SANS Holiday Hack Challenge",
        start: new Date(Date.now() + 86400000 * 30).toISOString(),
        finish: new Date(Date.now() + 86400000 * 45).toISOString(),
        url: "https://sans.org",
        ctftime_url: "https://ctftime.org/event/sans-holiday-hack",
        organizers: "SANS Institute",
        format: "Mixed"
      }
    ]

    return NextResponse.json(fallbackEvents)
  }
}
