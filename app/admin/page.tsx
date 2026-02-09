import { Navigation } from "@/components/navigation"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Administração</h1>
          <p className="text-sm sm:text-base text-gray-600">Ferramentas administrativas para gerenciar a plataforma</p>
        </div>

        <AdminPanel />
      </main>
    </div>
  )
}
