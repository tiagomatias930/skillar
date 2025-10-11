import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

// Retorna perguntas de pré-avaliação para a competição
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Exemplo: busca perguntas de uma tabela competition_pre_eval_questions
    const { data: questions, error } = await supabase
      .from("competition_pre_eval_questions")
      .select("question, options, answer")
      .eq("competition_id", id);

    if (error) {
      // Log the DB error but return an empty questions array so the UI can fallback to AI generation
      console.error('[v0] Error fetching pre-eval questions for competition', id, error)
      return NextResponse.json({ questions: [] })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: [] })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('[v0] Unexpected error in pre-eval questions route:', error)
    // Return empty array instead of 500 to avoid breaking the client flow
    return NextResponse.json({ questions: [] })
  }
}
