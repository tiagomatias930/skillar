import { type NextRequest, NextResponse } from "next/server"
import { updateExpiredCompetitions } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    await updateExpiredCompetitions()
    return NextResponse.json({ success: true, message: "Competições encerradas com sucesso" })
  } catch (error) {
    console.error("Error closing competitions:", error)
    return NextResponse.json({ error: "Erro ao encerrar competições" }, { status: 500 })
  }
}
