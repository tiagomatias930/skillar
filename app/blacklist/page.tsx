import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Prohibit, ShieldCheck, CalendarBlank, Warning } from "@/components/icons"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/server"

interface BlacklistEntry {
  id: string
  user_id: string
  reason: string
  blacklisted_at: string
  user?: {
    username: string
  }
}

export default async function BlacklistPage() {
  const supabase = await createClient()

  const { data: blacklistEntries } = await supabase
    .from("blacklist")
    .select(`
      *,
      user:users!blacklist_user_id_fkey(*)
    `)
    .order("blacklisted_at", { ascending: false })

  const blacklist: BlacklistEntry[] = blacklistEntries || []

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 uppercase">Banlist</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Operadores banidos por violação das regras da arena</p>
        </div>

        <Card className="rounded-none border border-border bg-zinc-950">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <Prohibit className="h-4 w-4 text-red-500 animate-pulse" />
              Operadores Banidos
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-mono">
              {blacklist.length === 0
                ? "Nenhum usuário na banlist"
                : `${blacklist.length} operador${blacklist.length > 1 ? "es" : ""} na banlist`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blacklist.length === 0 ? (
              <div className="text-center py-12">
                <Warning className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Banlist limpa</h3>
                <p className="text-xs text-zinc-500">Todos os operadores estão em conformidade com as regras.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blacklist.map((entry) => (
                  <div key={entry.id} className="border border-border p-4 bg-zinc-950 rounded-none hover:border-red-500/30 transition-all font-mono">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-red-500/20 bg-red-500/5 flex items-center justify-center shrink-0">
                          <Prohibit className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white text-sm sm:text-base">{entry.user?.username}</h3>
                            <Badge variant="destructive" className="rounded-none border border-red-500/30 bg-red-500/10 text-red-400 text-[10px]">BANIDO</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-2">
                            <div className="flex items-center gap-1">
                              <CalendarBlank className="h-3.5 w-3.5" />
                              <span>Banido em {new Date(entry.blacklisted_at).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-zinc-400 bg-black p-2 border border-border">
                              <strong className="text-red-400">Motivo:</strong> {entry.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning Notice */}
        <Card className="mt-8 rounded-none border border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-wider">
              <Warning className="h-4 w-4" />
              Aviso Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-400/80 leading-relaxed">
              Agentes e operadores na banlist são desconectados da VPN da arena e perdem todas as credenciais de infiltração nos laboratórios virtuais.
              Se você acredita que sua assinatura foi bloqueada indevidamente, submeta uma contestação com sua assinatura digital PGP para os SysAdmins.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
