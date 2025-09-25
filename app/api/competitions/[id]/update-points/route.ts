import { type NextRequest, NextResponse } from "next/server"
import { updateParticipantPoints, getCompetitionRanking } from "@/lib/database"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Suporte batch antigo
    if (body.updates && Array.isArray(body.updates) && body.creatorUsername) {
      const { updates, creatorUsername } = body;
      console.log("[v0] Update points API called with batch:", { updates, creatorUsername });
      const results = await Promise.all(
        updates.map(async ({ participantId, points }: { participantId: string; points: number }) => {
          console.log("[v0] Updating participant:", { participantId, points });
          const result = await updateParticipantPoints(participantId, points, creatorUsername);
          console.log("[v0] Update result:", result);
          return result;
        })
      );
      const allSuccessful = results.every((result) => result === true);
      if (!allSuccessful) {
        return NextResponse.json({ error: "Erro ao atualizar alguns pontos" }, { status: 500 });
      }
      revalidatePath(`/competitions/${id}`);
      revalidatePath("/competitions");
      revalidatePath("/ranking");
      revalidatePath(`/competitions/${id}/manage`);
      return NextResponse.json({ success: true });
    }

    // Novo: atualizar pontos de um participante por username
    const { username, points } = body;
    if (username && typeof points === "number") {
      // Busca participante
      const ranking = await getCompetitionRanking(id);
      const participant = ranking.find(p => p.user?.username === username);
      if (!participant) {
        return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
      }
  // Buscar o username do criador da competição
  // participant.competition_id está disponível
  // Buscar competição ativa para obter o criador
  const competitions = await import('@/lib/database').then(m => m.getActiveCompetitions());
  const comp = competitions.find((c: any) => c.id === participant.competition_id);
   const creatorUsername = comp?.creator?.username || "";
  const ok = await updateParticipantPoints(participant.id, points, creatorUsername);
      if (!ok) {
        return NextResponse.json({ error: "Erro ao atualizar pontos" }, { status: 500 });
      }
      revalidatePath(`/competitions/${id}`);
      revalidatePath("/competitions");
      revalidatePath("/ranking");
      revalidatePath(`/competitions/${id}/manage`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  } catch (error) {
    console.error("[v0] Update points error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
