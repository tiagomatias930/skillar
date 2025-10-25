import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// Get all teams for a competition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  try {
    const { competitionId } = await params

    if (!competitionId) {
      return NextResponse.json({ 
        error: "ID da competição é obrigatório" 
      }, { status: 400 })
    }

    console.log("[v0] Fetching teams for competition:", competitionId)

    const supabase = await createClient()
    
    // Get all teams for this competition with member count
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        competition_id,
        creator_id,
        created_at,
        creator:users!teams_creator_id_fkey(id, username, avatar_url),
        team_members(
          id,
          user:users(id, username, avatar_url)
        )
      `)
      .eq("competition_id", competitionId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching teams:", error)
      return NextResponse.json({ error: "Erro ao buscar equipes" }, { status: 500 })
    }

    // Transform data to include member count and member list
    const teamsWithDetails = teams?.map(team => ({
      id: team.id,
      name: team.name,
      competition_id: team.competition_id,
      creator_id: team.creator_id,
      created_at: team.created_at,
      creator: team.creator,
      members: team.team_members?.map(tm => tm.user) || [],
      memberCount: team.team_members?.length || 0
    })) || []

    console.log("[v0] Found teams:", teamsWithDetails.length)

    return NextResponse.json({ 
      success: true,
      teams: teamsWithDetails
    })
  } catch (error) {
    console.error("[v0] Get teams error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
