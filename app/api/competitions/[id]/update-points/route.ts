import { type NextRequest, NextResponse } from "next/server"
import { updateParticipantPoints } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { updates, creatorUsername } = await request.json()

    console.log("[v0] Update points API called with:", { updates, creatorUsername })

    if (!updates || !Array.isArray(updates) || !creatorUsername) {
      console.log("[v0] Invalid data provided")
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Update each participant's points
    const results = await Promise.all(
      updates.map(async ({ participantId, points }: { participantId: string; points: number }) => {
        console.log("[v0] Updating participant:", { participantId, points })
        const result = await updateParticipantPoints(participantId, points, creatorUsername)
        console.log("[v0] Update result:", result)
        return result
      }),
    )

    console.log("[v0] All update results:", results)
    const allSuccessful = results.every((result) => result === true)

    if (!allSuccessful) {
      console.log("[v0] Some updates failed")
      return NextResponse.json({ error: "Erro ao atualizar alguns pontos" }, { status: 500 })
    }

    revalidatePath(`/competitions/${id}`)
    revalidatePath("/competitions")
    revalidatePath("/ranking")
    revalidatePath(`/competitions/${id}/manage`)

    console.log("[v0] All points updated successfully and cache revalidated")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update points error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
