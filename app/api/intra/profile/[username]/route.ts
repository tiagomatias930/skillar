import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  try {
    // Replace with your actual client_id and client_secret
    const clientId = "u-s4t2ud-a63865c995c8eeb14a1227c650d61edb4fc4a2f7e986f97e4f49d867efede229"
    const clientSecret = "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"
    const tokenRes = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'SkillarApp/1.0'
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    })
    if (!tokenRes.ok) console.warn('[v0] INTRA_API_TOKEN request failed; requests may be rate-limited or rejected')
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const url = `https://api.intra.42.fr/v2/users/${encodeURIComponent(username)}`

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SkillarApp/1.0'
      }
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

  // Define base headers for reuse
  const baseHeaders = {
    'User-Agent': 'SkillarApp/1.0'
  };

  // If campus id present, fetch campus details
  const campusId = data.campus?.[0]?.id;
  if (campusId) {
    try {
      const campusRes = await fetch(
        `https://api.intra.42.fr/v2/campus/${campusId}`,
        {
          headers: {
            ...baseHeaders,
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      if (campusRes.ok) {
        simplified.campus = await campusRes.json();
      } else {
        simplified.campus = { name: data.campus?.[0]?.name || null };
      }
    } catch (e) {
      simplified.campus = { name: data.campus?.[0]?.name || null };
    }
  } else {
    simplified.campus = data.campus?.[0]?.name || null;
  }

  // Try to fetch coalitions list (public endpoint) and include if available
  try {
    const coalRes = await fetch(
      'https://api.intra.42.fr/v2/coalitions',
      {
        headers: {
          ...baseHeaders,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    if (coalRes.ok) {
      const c = await coalRes.json();
      simplified.coalitions = c;
    } else {
      simplified.coalitions = [];
    }
  } catch (e) {
    simplified.coalitions = [];
  }

  // Fetch recent locations and filter by username
  try {
    const locRes = await fetch(
      'https://api.intra.42.fr/v2/locations',
      {
        headers: {
          ...baseHeaders,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    if (locRes.ok) {
      const locs = await locRes.json();
      simplified.locations = Array.isArray(locs) ? locs.filter((l: any) => l.user?.login === data.login) : [];
    } else {
      simplified.locations = [];
    }
  } catch (e) {
    simplified.locations = [];
  }

    return NextResponse.json({ success: true, profile: simplified })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error', details: (err as Error).message }, { status: 500 })
  }
}
