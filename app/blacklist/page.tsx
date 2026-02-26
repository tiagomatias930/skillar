import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Prohibit, ShieldCheck, CalendarBlank } from "@/components/icons"
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
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 xl:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground-900 mb-2">Lista Negra</h1>
          <p className="text-sm sm:text-base lg:text-lg text-foreground-600">Usuários que violaram as regras da comunidade</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Prohibit className="h-5 w-5 text-red-600" weight="duotone" />
              Usuários na Lista Negra
            </CardTitle>
            <CardDescription>
              {blacklist.length === 0
                ? "Nenhum usuário na lista negra"
                : `${blacklist.length} usuário${blacklist.length > 1 ? "s" : ""} na lista negra`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blacklist.length === 0 ? (
              <div className="text-center py-12">
                <img className="h-16 w-16 text-foreground-400 mx-auto mb-4" src="caution.png" />
                <h3 className="text-lg font-semibold text-foreground-900 mb-2">Lista negra vazia</h3>
                <p className="text-foreground-600">Todos os usuários estão seguindo as regras da comunidade!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blacklist.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <Prohibit className="h-6 w-6 text-red-600" weight="duotone" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground-900">{entry.user?.username}</h3>
                            <Badge variant="destructive">Banido</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground-600 mb-2">
                            <div className="flex items-center gap-1">
                              <CalendarBlank className="h-4 w-4" weight="duotone" />
                              <span>Banido em {new Date(entry.blacklisted_at).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          {entry.reason && (
                            <p className="text-sm text-foreground-700 bg-gray-50 p-2 rounded">
                              <strong>Motivo:</strong> {entry.reason}
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
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <img className="h-5 w-5" src="caution.png" alt="Warning" />
              Aviso Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              Usuários na lista negra não podem participar de competições ou interagir com a comunidade. Se você
              acredita que foi banido injustamente, entre em contato com os administradores.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
