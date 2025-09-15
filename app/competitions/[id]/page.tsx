
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

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Competição não encontrada</h3>
            <Link href="/competitions">
              <button className="btn btn-primary">Voltar às Competições</button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const participants = await getCompetitionRanking(id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <CompetitionDetailsClient competition={competition} participants={participants} />
    </div>
  )
}