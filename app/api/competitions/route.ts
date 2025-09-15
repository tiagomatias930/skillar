import { type NextRequest, NextResponse } from "next/server"
import { createCompetition } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { title, description, creatorUsername, durationType, durationValue } = await request.json()

    if (!title || !description || !creatorUsername || !durationType || !durationValue) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }
    if (!["dias", "horas"].includes(durationType)) {
      return NextResponse.json({ error: "Tipo de duração inválido" }, { status: 400 })
    }
    if (typeof durationValue !== "number" || durationValue < 1) {
      return NextResponse.json({ error: "Valor de duração inválido" }, { status: 400 })
    }

    const competition = await createCompetition(title, description, creatorUsername, durationType, durationValue)

    if (!competition) {
      return NextResponse.json({ error: "Erro ao criar competição" }, { status: 500 })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error("Create competition error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
