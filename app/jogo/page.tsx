"use client"

export default function JogoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Jogo e Diversão</h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <iframe
            src="https://sega-play.online/"
            className="w-full h-[80vh] border-0 rounded"
            title="SEGA Play"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}