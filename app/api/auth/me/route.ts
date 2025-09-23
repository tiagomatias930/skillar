import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    const userCookie = cookieStore.get('skillar_user')

    if (!sessionCookie || !userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userData = JSON.parse(decodeURIComponent(userCookie.value))

    // Get user data from Supabase
    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', userData.username)
      .single()

    if (error) {
      console.error('Failed to get user data:', error)
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 })
    }

    return NextResponse.json({
      session,
      userData,
      databaseData: user
    })
  } catch (error) {
    console.error('Error getting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}