import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Call the function to close expired competitions
    const { error } = await supabase.rpc("close_expired_competitions")

    if (error) {
      console.error("Error closing competitions:", error)
      return NextResponse.json({ error: "Erro ao fechar competições" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Competições expiradas fechadas com sucesso" })
  } catch (error) {
    console.error("Close competitions error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
