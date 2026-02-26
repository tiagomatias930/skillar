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
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 tracking-tight">Competições Ativas</h1>
            <p className="text-sm sm:text-base text-[var(--md3-on-surface-variant)]">Participe das competições em andamento ou crie a sua própria</p>
          </div>
          <Link href="/create-competition">
            <Button className="rounded-full w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Competição
            </Button>
          </Link>
        </div>

        {competitions.length === 0 ? (
          <Card className="text-center py-16 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
            <CardContent>
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma competição ativa</h3>
              <p className="text-[var(--md3-on-surface-variant)] mb-8">Seja o primeiro a criar uma competição!</p>
              <Link href="/create-competition">
                <Button className="rounded-full">Criar Competição</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="group hover:shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 bg-[var(--md3-surface-container)] border-[var(--md3-outline-variant)]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2 text-foreground truncate">{competition.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2">{competition.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--md3-on-surface-variant)]">
                      <Users className="h-4 w-4 shrink-0 text-primary/70" />
                      <span className="truncate">Criado por {competition.creator?.username}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-[var(--md3-on-surface-variant)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                        <span>Começa: {new Date(competition.start_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 opacity-0" />
                        <span>Termina: {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-3">
                      <Link href={`/competitions/${competition.id}`} className="flex-1">
                        <Button variant="tonal" className="w-full rounded-full text-xs sm:text-sm">
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
