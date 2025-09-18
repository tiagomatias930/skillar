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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Competições Ativas</h1>
            <p className="text-gray-600">Participe das competições em andamento ou crie a sua própria</p>
          </div>
          <Link href="/create-competition">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Competição
            </Button>
          </Link>
        </div>

        {competitions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma competição ativa</h3>
              <p className="text-gray-600 mb-6">Seja o primeiro a criar uma competição!</p>
              <Link href="/create-competition">
                <Button>Criar Competição</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{competition.title}</CardTitle>
                      <CardDescription className="text-sm">{competition.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Criado por {competition.creator?.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Começa em {new Date(competition.start_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      <br/>
                      <span>Termina em {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/competitions/${competition.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <JoinCompetitionButton competitionId={competition.id} disabled={new Date() > new Date(competition.end_date)} />
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
