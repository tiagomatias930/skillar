import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  try {
    const token = process.env.INTRA_API_TOKEN
    const baseHeaders: Record<string,string> = {
      Accept: 'application/json',
      'User-Agent': 'SkillarApp/1.0'
    }
    if (!token) console.warn('[v0] INTRA_API_TOKEN not set; requests may be rate-limited or rejected')

    const url = `https://api.intra.42.fr/v2/users/${encodeURIComponent(username)}`
    const res = await fetch(url, {
      headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, error: 'Failed to fetch Intra profile', details: text }, { status: res.status })
    }

    const data = await res.json()

    // Build simplified base profile
    const simplified: any = {
      username: data.login,
      displayname: data.displayname || null,
      avatar: data.image?.link || data.image || null,
      wallet: data.wallet ?? null,
      cursus: Array.isArray(data.cursus_users)
        ? data.cursus_users.map((c: any) => ({ name: c.cursus?.name || null, level: c.level || null }))
        : [],
      skills: Array.isArray(data.cursus_users) && data.cursus_users[0]?.skills
        ? data.cursus_users[0].skills.map((s: any) => ({ name: s.name, level: s.level }))
        : [],
      raw: data
    }

    // If campus id present, fetch campus details
    const campusId = data.campus?.[0]?.id
    if (campusId) {
      try {
  const campusRes = await fetch(`https://api.intra.42.fr/v2/campus/${campusId}`, { headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders })
        if (campusRes.ok) {
          simplified.campus = await campusRes.json()
        } else {
          simplified.campus = { name: data.campus?.[0]?.name || null }
        }
      } catch (e) {
        simplified.campus = { name: data.campus?.[0]?.name || null }
      }
    } else {
      simplified.campus = data.campus?.[0]?.name || null
    }

    // Try to fetch coalitions list (public endpoint) and include if available
    try {
  const coalRes = await fetch('https://api.intra.42.fr/v2/coalitions', { headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders })
      if (coalRes.ok) {
        const c = await coalRes.json()
        simplified.coalitions = c
      } else {
        simplified.coalitions = []
      }
    } catch (e) {
      simplified.coalitions = []
    }

    // Fetch recent locations and filter by username
    try {
  const locRes = await fetch('https://api.intra.42.fr/v2/locations', { headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders })
      if (locRes.ok) {
        const locs = await locRes.json()
        simplified.locations = Array.isArray(locs) ? locs.filter((l: any) => l.user?.login === data.login) : []
      } else {
        simplified.locations = []
      }
    } catch (e) {
      simplified.locations = []
    }

    return NextResponse.json({ success: true, profile: simplified })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error', details: (err as Error).message }, { status: 500 })
  }
}
