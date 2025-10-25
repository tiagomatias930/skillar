import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByUsername } from "@/lib/database"

export const dynamic = 'force-dynamic'

// Create a new team
export async function POST(request: NextRequest) {
  try {
    const { teamName, competitionId, username } = await request.json()

    if (!teamName || !competitionId || !username) {
      return NextResponse.json({ 
        error: "Nome da equipe, competição e username são obrigatórios" 
      }, { status: 400 })
    }

    console.log("[v0] Creating team:", { teamName, competitionId, username })

    const supabase = await createClient()
    
    // Get user by username
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Check if team name already exists in this competition
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("competition_id", competitionId)
      .eq("name", teamName)
      .single()

    if (existingTeam) {
      return NextResponse.json({ 
        error: "Já existe uma equipe com este nome nesta competição" 
      }, { status: 409 })
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        competition_id: competitionId,
        creator_id: user.id
      })
      .select()
      .single()

    if (teamError) {
      console.error("[v0] Error creating team:", teamError)
      return NextResponse.json({ error: "Erro ao criar equipe" }, { status: 500 })
    }

    // Add creator as first team member
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id
      })

    if (memberError) {
      console.error("[v0] Error adding team member:", memberError)
      // Rollback: delete team if member creation fails
      await supabase.from("teams").delete().eq("id", team.id)
      return NextResponse.json({ error: "Erro ao adicionar membro à equipe" }, { status: 500 })
    }

    console.log("[v0] Team created successfully:", team.id)

    return NextResponse.json({ 
      success: true, 
      team: {
        id: team.id,
        name: team.name,
        competition_id: team.competition_id,
        creator_id: team.creator_id
      }
    })
  } catch (error) {
    console.error("[v0] Create team error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
