"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Trophy, History, BarChart3, Gamepad2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <img
                className="h-10 w-10 object-contain"
                src="/42skillar.png"
                alt="skiller"
              />
              <h1 className="text-lg font-bold text-gray-900">Skillar</h1>
              <h4></h4>
              <p className="hidden sm:block text-center text-sm font-italic text-gray-300">Arena dos Campeões</p>
            </div>
            <nav className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
              <Link href="/competitions">
                <Button variant="ghost" className="flex items-center gap-2 text-sm sm:text-base">
                  <Trophy className="h-4 w-4" />
                  <span>Competições</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Ranking</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>Histórico</span>
                </Button>
              </Link>
              <Link href="/jogo">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Jogo</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance">
              Compete, Evolua e Conquiste
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 text-pretty px-2">
              Participe de competições semanais, desafie outros usuários e prove suas habilidades no 42Skillar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/competitions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  Ver Competições
                </Button>
              </Link>
              <Link href="/create-competition" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Criar Competição
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
            Veja Como Funciona
          </h3>
          <div className="max-w-4xl mx-auto aspect-video px-2 sm:px-4">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/watch?v=xXeZ3b5Nb08"
              title="Skillar - Demonstração"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-lg w-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Como Funciona
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-4">
                <Target className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Crie ou Participe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Qualquer usuário pode criar uma competição ou participar das existentes. Basta escolher um username único.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold">
                  Compete e Pontue
                </CardTitle>
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
                <CardTitle className="text-xl font-semibold">
                  Conquiste Posições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Torne-se Presidente (1º lugar), Vice-presidente (2º lugar) ou Diretor (3º lugar) e entre para o histórico.
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
          <h3 className="text-3xl font-bold mb-4 text-white">
            Pronto para Começar?
          </h3>
          <p className="text-xl mb-8 text-white">
            Entre no 42Skillar agora e mostre suas habilidades!
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
              <img
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                src="/42skillar.png"
                alt="skiller"
              />
            <p className="text-base sm:text-lg font-semibold">Skillar</p>
            <p className="hidden sm:block text-center text-sm text-italic text-gray-300">Arena dos Campeões</p>
          </div>
          <p className="text-sm sm:text-base text-gray-400 px-2">
            Plataforma de competições semanais - Mostre suas habilidades
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-4 max-w-2xl mx-auto">
            &copy; 2025 42Skillar lda. Todos os direitos reservados a: Tiago Matias, Liédson Habacuc & Nádia Cristovão
          </p>
        </div>
      </footer>
    </div>
  )
}
