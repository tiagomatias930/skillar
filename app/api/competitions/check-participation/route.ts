import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByUsername } from "@/lib/database"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")
    const competitionId = request.nextUrl.searchParams.get("competitionId")

    if (!username || !competitionId) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("participants")
      .select("*, participation_type, team_id, team_name")
      .eq("competition_id", competitionId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 is the "no rows returned" error
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      isParticipating: !!data,
      participationType: data?.participation_type || null,
      teamId: data?.team_id || null,
      teamName: data?.team_name || null
    })
  } catch (error) {
    console.error("Check participation error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}