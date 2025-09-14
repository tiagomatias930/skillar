import { type NextRequest, NextResponse } from "next/server"
import { addToBlacklist } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { username, reason } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 })
    }

    const success = await addToBlacklist(username, reason)

    if (!success) {
      return NextResponse.json({ error: "Erro ao adicionar usuário à lista negra" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blacklist user error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
