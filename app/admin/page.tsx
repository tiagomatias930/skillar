import { Navigation } from "@/components/navigation"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-widest mb-2">SysAdmin Core</h1>
          <p className="text-xs text-zinc-400">Painel de controle central de telemetria e gerenciamento da infraestrutura</p>
        </div>

        <AdminPanel />
      </main>
    </div>
  )
}
