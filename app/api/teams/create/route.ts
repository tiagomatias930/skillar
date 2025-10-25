import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByUsername } from "@/lib/database"

export const dynamic = 'force-dynamic'

// Create a new team
export async function POST(request: NextRequest) {
  try {
    const { teamName, competitionId, username } = await request.json()

    console.log("[TEAMS] Create request received:", { teamName, competitionId, username })

    if (!teamName || !competitionId || !username) {
      console.error("[TEAMS] Missing required fields")
      return NextResponse.json({ 
        error: "Nome da equipe, competição e username são obrigatórios" 
      }, { status: 400 })
    }

    const supabase = await createClient()
    console.log("[TEAMS] Supabase client created")
    
    // Get user by username
    console.log("[TEAMS] Getting user by username:", username)
    const user = await getUserByUsername(username)
    if (!user) {
      console.error("[TEAMS] User not found:", username)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.log("[TEAMS] User found:", user.id)

    // Check if team name already exists in this competition
    console.log("[TEAMS] Checking for existing team with name:", teamName)
    const { data: existingTeam, error: checkError } = await supabase
      .from("teams")
      .select("id")
      .eq("competition_id", competitionId)
      .eq("name", teamName)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("[TEAMS] Error checking existing team:", checkError)
      return NextResponse.json({ 
        error: `Erro ao verificar equipe existente: ${checkError.message}. Certifique-se que a tabela 'teams' existe no banco de dados.`,
        details: checkError
      }, { status: 500 })
    }

    if (existingTeam) {
      console.log("[TEAMS] Team name already exists")
      return NextResponse.json({ 
        error: "Já existe uma equipe com este nome nesta competição" 
      }, { status: 409 })
    }

    // Create team
    console.log("[TEAMS] Creating team in database")
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
      console.error("[TEAMS] Error creating team:", teamError)
      return NextResponse.json({ 
        error: `Erro ao criar equipe: ${teamError.message}. Verifique se a tabela 'teams' existe no banco de dados.`,
        details: teamError
      }, { status: 500 })
    }

    console.log("[TEAMS] Team created successfully:", team.id)

    // Add creator as first team member
    console.log("[TEAMS] Adding creator as team member")
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id
      })

    if (memberError) {
      console.error("[TEAMS] Error adding team member:", memberError)
      // Rollback: delete team if member creation fails
      await supabase.from("teams").delete().eq("id", team.id)
      return NextResponse.json({ 
        error: `Erro ao adicionar membro à equipe: ${memberError.message}. Verifique se a tabela 'team_members' existe no banco de dados.`,
        details: memberError
      }, { status: 500 })
    }

    console.log("[TEAMS] Team member added successfully")

    return NextResponse.json({ 
      success: true, 
      team: {
        id: team.id,
        name: team.name,
        competition_id: team.competition_id,
        creator_id: team.creator_id
      }
    })
  } catch (error: any) {
    console.error("[TEAMS] Unexpected error:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      message: error.message || "Erro desconhecido",
      details: error
    }, { status: 500 })
  }
}
