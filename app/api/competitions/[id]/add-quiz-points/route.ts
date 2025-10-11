import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserByUsername } from "@/lib/database"

export const dynamic = 'force-dynamic'

// Add quiz points to a participant's score
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: competitionId } = await params
    const { username, quizScore } = await request.json()

    if (!username || typeof quizScore !== 'number') {
      return NextResponse.json({ error: "Username e pontuação são obrigatórios" }, { status: 400 })
    }

    console.log("[v0] Adding quiz points:", { competitionId, username, quizScore })

    const supabase = await createClient()
    
    // Get user by username
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Check if participant exists
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id, points")
      .eq("competition_id", competitionId)
      .eq("user_id", user.id)
      .single()

    if (participantError || !participant) {
      console.error("[v0] Participant not found or error:", participantError)
      return NextResponse.json({ 
        error: "Participante não encontrado. Junte-se à competição primeiro." 
      }, { status: 404 })
    }

    // Update points by adding quiz score
    const newPoints = (participant.points || 0) + quizScore
    
    const { data: updated, error: updateError } = await supabase
      .from("participants")
      .update({ points: newPoints })
      .eq("id", participant.id)
      .select("points")
      .single()

    if (updateError) {
      console.error("[v0] Error updating quiz points:", updateError)
      return NextResponse.json({ error: "Erro ao adicionar pontos" }, { status: 500 })
    }

    console.log("[v0] Quiz points added successfully:", { oldPoints: participant.points, newPoints: updated.points })

    return NextResponse.json({ 
      success: true, 
      points: updated.points,
      quizScore 
    })
  } catch (error) {
    console.error("[v0] Add quiz points error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
