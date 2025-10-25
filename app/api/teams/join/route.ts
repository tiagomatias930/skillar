import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByUsername } from "@/lib/database"

export const dynamic = 'force-dynamic'

// Join an existing team
export async function POST(request: NextRequest) {
  try {
    const { teamId, username } = await request.json()

    if (!teamId || !username) {
      return NextResponse.json({ 
        error: "ID da equipe e username são obrigatórios" 
      }, { status: 400 })
    }

    console.log("[v0] Joining team:", { teamId, username })

    const supabase = await createClient()
    
    // Get user by username
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*, competition:competitions(id, title)")
      .eq("id", teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "Equipe não encontrada" }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ 
        error: "Você já é membro desta equipe" 
      }, { status: 409 })
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: teamId,
        user_id: user.id
      })

    if (memberError) {
      console.error("[v0] Error adding team member:", memberError)
      return NextResponse.json({ error: "Erro ao juntar-se à equipe" }, { status: 500 })
    }

    console.log("[v0] User joined team successfully")

    return NextResponse.json({ 
      success: true,
      team: {
        id: team.id,
        name: team.name,
        competition_id: team.competition_id
      }
    })
  } catch (error) {
    console.error("[v0] Join team error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
