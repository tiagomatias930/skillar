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

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">Competições Ativas</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300">Participe das competições em andamento ou crie a sua própria</p>
          </div>
          <Link href="/create-competition">
            <Button className="bg-[#052A5F] hover:bg-[#073266] text-white w-full sm:w-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow bg-[#073266] border-[#052A5F]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2 text-white truncate">{competition.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-300 line-clamp-2">{competition.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 bg-[#052A5F] text-white text-xs">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="truncate">Criado por {competition.creator?.username}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>Começa: {new Date(competition.start_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 opacity-0" />
                        <span>Termina: {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Link href={`/competitions/${competition.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent border-[#052A5F] text-white hover:bg-[#052A5F] text-xs sm:text-sm">
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
