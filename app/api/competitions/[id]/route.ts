import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: competition, error } = await supabase
      .from("competitions")
      .select(`
        *,
        creator:users!competitions_creator_id_fkey(*)
      `)
      .eq("id", id)
      .single()

    if (error || !competition) {
      return NextResponse.json({ error: "Competição não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error("Get competition error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
