import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Target, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://www.flaticon.com/br/icone-gratis/campeao_8037112?k=1757811754218&log-in=google"
                className="h-8 w-8 text-blue-600"
                alt="logo-skiller"
              />
              <h1 className="text-2xl font-bold text-gray-900">42Skillar</h1>
              <h4></h4>
              <p className="text-center-2xl font-italic text-gray-400"> Arena dos Campeões </p>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/competitions">
                <Button variant="ghost">Competições</Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost">Ranking</Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost">Histórico</Button>
              </Link>
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">Compete, Evolua e Conquiste</h2>
            <p className="text-xl text-gray-600 mb-8 text-pretty">
              Participe de competições semanais, desafie outros usuários e prove suas habilidades no 42Skillar.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/competitions">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Ver Competições
                </Button>
              </Link>
              <Link href="/create-competition">
                <Button size="lg" variant="outline">
                  Criar Competição
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold">Crie ou Participe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Qualquer usuário pode criar uma competição ou participar das existentes. Basta escolher um username
                  único.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold">Compete e Pontue</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  O criador da competição atribui pontos aos participantes. Acompanhe o ranking em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold">Conquiste Posições</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Torne-se Presidente (1º lugar), Vice-presidente (2º lugar) ou Diretor (3º lugar) e entre para o
                  histórico.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 text-white"
        style={{
          background: "linear-gradient(to right, #2563eb, #9333ea)",
          backgroundColor: "#2563eb", // fallback
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">Pronto para Começar?</h3>
          <p className="text-xl mb-8 text-white">Entre no 42Skillar agora e mostre suas habilidades!</p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-6 w-6" />
            <span className="text-lg font-semibold">42Skillar</span>
          </div>
          <p className="text-gray-400">Plataforma de competições semanais - Mostre suas habilidades</p>
          <p className="text-gray-500 text-sm mt-4">&copy; 2025 42Skillar lda. Todos os direitos reservados a: Tiago Matias, Liédson Habacuc & Nádia Cristovão</p>
          
        </div>
      </footer>
    </div>
  )
}
