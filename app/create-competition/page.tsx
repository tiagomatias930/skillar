"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Trophy, History, BarChart3, Gamepad2, Menu, X } from "lucide-react"
import Link from "next/link"
import { LanguageSelector } from "@/components/language-selector"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      {/* Header */}
      <header className="border-b bg-black/80 backdrop-blur-sm border-[#073266]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                className="h-12 w-12 object-contain"
                src="/42skillar.png"
                alt="skiller"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Skillar</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/competitions">
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>Competições</span>
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>Ranking</span>
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>Histórico</span>
                </Button>
              </Link>
              <Link href="/jogo">
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>Jogo</span>
                </Button>
              </Link>
              <LanguageSelector />
              <Link href="/login">
                <Button className="flex items-center gap-2">               
                  <span>Entrar</span>
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-2">
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <span>Competições</span>
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <span>Ranking</span>
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <span>Histórico</span>
                  </Button>
                </Link>
                <Link href="/jogo" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <span>Jogo</span>
                  </Button>
                </Link>
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">               
                    <span>Entrar</span>
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 text-balance">
              Compete, Evolua e Conquiste
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 text-pretty px-2">
              Participe de competições semanais, desafie outros usuários e prove suas habilidades no 42Skillar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/competitions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#052A5F] hover:bg-[#073266] text-white">
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

      {/* Features */}
      <section className="py-10 sm:py-16 bg-[#06224A]">
        <div className="container mx-4 px-4">

          {/*<div className="container mx-4 px-4">
          <div className="flex justify-center items-center min-h-screen bg-[#06224A] dark:bg-[#06224A] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mx-5 aspect-video rounded-lg overflow-hidden shadow-xl bg-[#06224A] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/xXeZ3b5Nb08?si=vASGsJO20wTg82zI"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="w-full max-w-4xl mx-5 aspect-video rounded-lg overflow-hidden shadow-xl bg-[#06224A] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/8QpxUibAz8I?si=BoKZr97mn5IdySgk"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full mr-6"
              />
            </div>
          </div>
        </div>*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow bg-[#073266] border-[#052A5F]">
              <CardHeader className="pb-2 sm:pb-4">
                <Target className="h-8 w-8 sm:h-7 sm:w-7 text-white mx-auto mb-2 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Crie ou Participe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Qualquer usuário pode criar uma competição ou participar das existentes. Basta escolher um username único.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-[#073266] border-[#052A5F]">
              <CardHeader className="pb-4">
                <Users className="h-8 w-8 text-white mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-white">
                  Compete e Pontue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 leading-relaxed">
                  O criador da competição atribui pontos aos participantes. Acompanhe o ranking em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-[#073266] border-[#052A5F]">
              <CardHeader className="pb-4">
                <Award className="h-8 w-8 text-white mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-white">
                  Conquiste Posições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Torne-se Presidente (1º lugar), Vice-presidente (2º lugar) ou Diretor (3º lugar) e entre para o histórico.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white bg-gradient-to-r from-[#052A5F] to-[#073266]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Pronto para Começar?
          </h3>
          <p className="text-xl mb-8 text-white">
            Entre no 42Skillar agora e mostre suas habilidades!
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-[#052A5F] hover:bg-gray-100">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#041a3a] text-white py-6 sm:py-8">
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
