import { type NextRequest, NextResponse } from "next/server"
import { getCompetitionRanking } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const participants = await getCompetitionRanking(id)

    return NextResponse.json({ participants })
  } catch (error) {
    console.error("Get participants error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
