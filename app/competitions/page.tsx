import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, UsersThree, CalendarBlank, Plus } from "@/components/icons"
import Link from "next/link"
import { getActiveCompetitions } from "@/lib/database"
import { JoinCompetitionButton } from "@/components/join-competition-button"
import { Navigation } from "@/components/navigation"

export default async function CompetitionsPage() {
  const competitions = await getActiveCompetitions()

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight uppercase">Laboratórios Ativos</h1>
            <p className="text-xs sm:text-sm text-zinc-400">Infiltre-se em laboratórios ativos ou implante o seu próprio ambiente vulnerável</p>
          </div>
          <Link href="/create-competition">
            <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold">
              <Plus className="h-4 w-4 mr-2" weight="bold" />
              Implantar Lab
            </Button>
          </Link>
        </div>

        {competitions.length === 0 ? (
          <Card className="text-center py-16 rounded-none border border-border bg-zinc-950/40">
            <CardContent>
              <div className="h-20 w-20 border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-primary" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase font-mono">Nenhum laboratório vulnerável online</h3>
              <p className="text-xs text-zinc-500 mb-8 font-mono">Seja o primeiro a implantar um laboratório na rede!</p>
              <Link href="/create-competition">
                <Button className="rounded-none border border-primary bg-primary text-black hover:bg-black hover:text-primary transition-all font-bold">Implantar Lab</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="rounded-none border border-border bg-zinc-950/80 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-3 border-b border-border mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold text-white uppercase tracking-wider truncate mb-1">{competition.title}</CardTitle>
                      <CardDescription className="text-[11px] text-zinc-500 line-clamp-2 font-mono leading-relaxed">{competition.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] rounded-none border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      ONLINE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <UsersThree className="h-4 w-4 shrink-0 text-primary/70" weight="duotone" />
                      <span className="truncate">Deployer: <strong className="text-white">{competition.creator?.username}</strong></span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <CalendarBlank className="h-4 w-4 shrink-0 text-primary/70" weight="duotone" />
                        <span>Acesso em: {new Date(competition.start_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarBlank className="h-4 w-4 shrink-0 opacity-0" />
                        <span>Expira em: {new Date(competition.custom_end_date || competition.end_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border mt-3">
                      <Link href={`/competitions/${competition.id}`} className="flex-1">
                        <Button variant="outline" className="w-full rounded-none border-border hover:border-primary text-xs">
                          Dossiê
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
