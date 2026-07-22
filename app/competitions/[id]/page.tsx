
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { getCompetitionRanking } from "@/lib/database"
import { createClient } from "@/lib/supabase/server"
import CompetitionDetailsClient from "@/components/competition-details-client"

interface CompetitionPageProps {
  params: Promise<{ id: string }>
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get competition details
  const { data: competition } = await supabase
    .from("competitions")
    .select(`*, creator:users!competitions_creator_id_fkey(*)`)
    .eq("id", id)
    .single()

  // Get participants
  const { data: participants } = await supabase
    .from("participants")
    .select(`
      *,
      user:users!participants_user_id_fkey(*)
    `)
    .eq("competition_id", id)
    .order("points", { ascending: false })

  if (!competition) {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Laboratório não encontrado</h3>
            <Link href="/competitions">
              <button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider">Voltar aos Labs / CTFs</button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const participantsRanking = await getCompetitionRanking(id)

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />
      <CompetitionDetailsClient 
        competition={competition} 
        participants={participantsRanking}
      />
    </div>
  )
}