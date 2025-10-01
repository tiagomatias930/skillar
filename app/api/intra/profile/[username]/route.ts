import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  try {
    const url = `https://api.intra.42.fr/v2/users/${encodeURIComponent(username)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      }
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, error: 'Failed to fetch Intra profile', details: text }, { status: res.status })
    }

    const data = await res.json()

    // Simplify the returned payload
    const simplified = {
      username: data.login,
      displayname: data.displayname || null,
      avatar: data.image?.link || data.image || null,
      campus: data.campus?.[0]?.name || null,
      wallet: data.wallet ?? null,
      cursus: Array.isArray(data.cursus_users)
        ? data.cursus_users.map((c: any) => ({ name: c.cursus?.name || null, level: c.level || null }))
        : [],
      skills: Array.isArray(data.cursus_users) && data.cursus_users[0]?.skills
        ? data.cursus_users[0].skills.map((s: any) => ({ name: s.name, level: s.level }))
        : []
    }

    return NextResponse.json({ success: true, profile: simplified })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error', details: (err as Error).message }, { status: 500 })
  }
}
