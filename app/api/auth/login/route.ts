import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByUsername } from "@/lib/database"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 })
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      return NextResponse.json({ error: "Username deve ter entre 3 e 50 caracteres" }, { status: 400 })
    }

    // Check if user exists
    let user = await getUserByUsername(trimmedUsername)

    // If user doesn't exist, create them
    if (!user) {
      user = await createUser(trimmedUsername)
      if (!user) {
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
