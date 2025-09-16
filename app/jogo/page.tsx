"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function JogoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Jogo e Diversão</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Acesse jogos e diversão no SEGA Play
          </p>
          <Link href="https://sega-play.online/" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="h-5 w-5 mr-2" />
              Abrir SEGA Play
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            O site será aberto em uma nova aba para melhor compatibilidade
          </p>
        </div>
      </div>
    </div>
  )
}