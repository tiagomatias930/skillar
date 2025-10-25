import { type NextRequest, NextResponse } from "next/server"
import { joinCompetition, getUserByUsername } from "@/lib/database"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Join competition API called")
    const { competitionId, username, competitionTitle, teamId } = await request.json()
    console.log("[v0] Request data:", { competitionId, username, competitionTitle, teamId })

    if (!competitionId || !username) {
      console.log("[v0] Missing required data")
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    console.log("[v0] Calling joinCompetition function")
    const { success, supabaseError } = await joinCompetition(
      competitionId, 
      username
    )
    console.log("[v0] joinCompetition result:", success, supabaseError)

    if (!success) {
      console.log("[v0] joinCompetition returned false")
      return NextResponse.json({ error: supabaseError || "Erro ao participar da competição" }, { status: 500 })
    }

    // Create GitHub repository for the participant
    let repositoryUrl = null
    try {
      console.log("[v0] Creating GitHub repository for participant")
      const repoResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/github/create-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId,
          competitionTitle: competitionTitle || 'Desafio Skillar',
          username
        })
      })

      const repoData = await repoResponse.json()
      
      if (repoData.success) {
        repositoryUrl = repoData.repositoryUrl
        console.log("[v0] GitHub repository created:", repositoryUrl)

        // Update participant record with repository URL and team
        const user = await getUserByUsername(username)
        if (user) {
          const supabase = await createClient()
          const updateData: any = { repository_url: repositoryUrl }
          if (teamId) {
            updateData.team_id = teamId
          }
          
          const { error: updateError } = await supabase
            .from('participants')
            .update(updateData)
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)

          if (updateError) {
            console.error("[v0] Error updating participant record:", updateError)
          } else {
            console.log("[v0] Participant record updated with repository URL and team")
          }
        }
      } else {
        console.error("[v0] Failed to create GitHub repository:", repoData.error)
        // Don't fail the join if repo creation fails
      }
    } catch (repoError) {
      console.error("[v0] Error in GitHub repository creation:", repoError)
      // Don't fail the join if repo creation fails
    }

    console.log("[v0] Successfully joined competition")
    return NextResponse.json({ 
      success: true,
      repositoryUrl 
    })
  } catch (error) {
    console.error("[v0] Join competition API error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
