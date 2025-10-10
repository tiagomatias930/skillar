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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: [] });
    }
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
