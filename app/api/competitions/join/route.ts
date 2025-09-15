import { type NextRequest, NextResponse } from "next/server"
import { joinCompetition } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Join competition API called")
    const { competitionId, username } = await request.json()
    console.log("[v0] Request data:", { competitionId, username })

    if (!competitionId || !username) {
      console.log("[v0] Missing required data")
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    console.log("[v0] Calling joinCompetition function")
    const { success, supabaseError } = await joinCompetition(competitionId, username)
    console.log("[v0] joinCompetition result:", success, supabaseError)

    if (!success) {
      console.log("[v0] joinCompetition returned false")
      return NextResponse.json({ error: supabaseError || "Erro ao participar da competição" }, { status: 500 })
    }

    console.log("[v0] Successfully joined competition")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Join competition API error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
