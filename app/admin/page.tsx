import { Navigation } from "@/components/navigation"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[var(--md3-surface-container-lowest)]">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">Administração</h1>
          <p className="text-sm sm:text-base text-[var(--md3-on-surface-variant)]">Ferramentas administrativas para gerenciar a plataforma</p>
        </div>

        <AdminPanel />
      </main>
    </div>
  )
}
