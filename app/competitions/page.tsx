import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { getActiveCompetitions } from "@/lib/database"
import { JoinCompetitionButton } from "@/components/join-competition-button"
import { Navigation } from "@/components/navigation"

export default async function CompetitionsPage() {
  const competitions = await getActiveCompetitions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Competições Ativas</h1>
            <p className="text-gray-300">Participe das competições em andamento ou crie a sua própria</p>
          </div>
          <Link href="/create-competition">
            <Button className="bg-[#052A5F] hover:bg-[#073266] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Competição
            </Button>
          </Link>
        </div>

        {competitions.length === 0 ? (
          <Card className="text-center py-12 bg-[#073266] border-[#052A5F]">
            <CardContent>
              <Trophy className="h-16 w-16 text-[#052A5F] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma competição ativa</h3>
              <p className="text-gray-300 mb-6">Seja o primeiro a criar uma competição!</p>
              <Link href="/create-competition">
                <Button className="bg-[#052A5F] hover:bg-[#073266] text-white">Criar Competição</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow bg-[#073266] border-[#052A5F]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-white">{competition.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-300">{competition.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 bg-[#052A5F] text-white">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="h-4 w-4" />
                      <span>Criado por {competition.creator?.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <p className="text-sm">Começa em {new Date(competition.start_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>

                      <p className="text-sm">Termina em {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/competitions/${competition.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent border-[#052A5F] text-white hover:bg-[#052A5F]">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <JoinCompetitionButton 
                        competitionId={competition.id} 
                        competitionTitle={competition.title}
                        disabled={new Date() > new Date(competition.end_date)} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
