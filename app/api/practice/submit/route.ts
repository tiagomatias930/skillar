import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const CTF_CHALLENGES = {
  "ctf-1": { flag: "FLAG{sql_injection_master_99}", points: 100 },
  "ctf-2": { flag: "FLAG{bof_stack_overflow_success}", points: 250 },
  "ctf-3": { flag: "FLAG{xor_key_cracked_bin_101}", points: 400 },
  "ctf-4": { flag: "FLAG{sk1llar}", points: 100 },
  "ctf-5": { flag: "FLAG{dns_exfiltration_detected}", points: 200 }
}

export async function POST(request: NextRequest) {
  try {
    const { username, challengeId, flag } = await request.json()

    if (!username || !challengeId || !flag) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const challenge = CTF_CHALLENGES[challengeId as keyof typeof CTF_CHALLENGES]
    if (!challenge) {
      return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 })
    }

    // Verify flag (case-sensitive matching for precision)
    if (flag.trim() !== challenge.flag) {
      return NextResponse.json({ success: false, error: "Flag incorreta. Tente novamente!" })
    }

    const supabase = await createClient()

    // 1. Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // 2. Find or create the Practice Competition
    let { data: competition } = await supabase
      .from("competitions")
      .select("id")
      .eq("title", "Laboratório de Prática Individual")
      .eq("is_active", true)
      .single()

    if (!competition) {
      // Create it dynamically
      const { data: newComp, error: createError } = await supabase
        .from("competitions")
        .insert({
          title: "Laboratório de Prática Individual",
          description: "Desafios CTF individuais e independentes para treinamento técnico e aprimoramento de habilidades de exploração.",
          creator_id: user.id,
          is_active: true
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Erro ao criar laboratório de prática" }, { status: 500 })
      }
      competition = newComp
    }

    // 3. Find or join participant
    let { data: participant } = await supabase
      .from("participants")
      .select("id, points")
      .eq("competition_id", competition.id)
      .eq("user_id", user.id)
      .single()

    if (!participant) {
      const { data: newPart, error: joinError } = await supabase
        .from("participants")
        .insert({
          competition_id: competition.id,
          user_id: user.id,
          points: challenge.points
        })
        .select()
        .single()

      if (joinError) {
        return NextResponse.json({ error: "Erro ao registrar participação" }, { status: 500 })
      }
      participant = newPart
    } else {
      // Add points
      const newPoints = participant.points + challenge.points
      const { error: updateError } = await supabase
        .from("participants")
        .update({ points: newPoints })
        .eq("id", participant.id)

      if (updateError) {
        return NextResponse.json({ error: "Erro ao atualizar pontuação" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, pointsAdded: challenge.points })
  } catch (error) {
    console.error("Error submitting flag:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
