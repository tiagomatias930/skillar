import { type NextRequest, NextResponse } from "next/server"
import { createCompetition } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { title, description, creatorUsername, durationType, durationValue, durationMinutes, customEndDate } = await request.json()

    if (!title || !description || !creatorUsername) {
      return NextResponse.json({ error: "Título, descrição e criador são obrigatórios" }, { status: 400 })
    }

    let endDate = undefined;
    if (customEndDate) {
      endDate = new Date(customEndDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json({ error: "Data de término inválida" }, { status: 400 })
      }
    }

    // Se customEndDate não está presente, exigir durationType e durationValue
    if (!customEndDate) {
      if (!durationType || !durationValue) {
        return NextResponse.json({ error: "Tipo e valor de duração são obrigatórios se não houver data de término personalizada" }, { status: 400 })
      }
      if (!["dias", "horas"].includes(durationType)) {
        return NextResponse.json({ error: "Tipo de duração inválido" }, { status: 400 })
      }
      if (typeof durationValue !== "number" || durationValue < 1) {
        return NextResponse.json({ error: "Valor de duração inválido" }, { status: 400 })
      }
      if (typeof durationMinutes !== "number" || durationMinutes < 0 || durationMinutes > 59) {
        return NextResponse.json({ error: "Minutos inválidos" }, { status: 400 })
      }
    }

    const competition = await createCompetition(title, description, creatorUsername, durationType, durationValue, durationMinutes, endDate)

    if (!competition) {
      return NextResponse.json({ error: "Erro ao criar competição" }, { status: 500 })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error("Create competition error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
