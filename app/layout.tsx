import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense, useState } from "react"
import { I18nContext, Language } from "@/lib/i18n"
import "./globals.css"

export const metadata: Metadata = {
  title: "42Skillar - Arena dos Campeões ",
  description: "Plataforma para criar e gerenciar competições com rankings em tempo real",
  generator: "42Skillar App",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const [lang, setLang] = useState<Language>("pt")
    return (
      <html lang={lang}>
        <head>
          <style>{`
            #v0-built-with-button-5410611f-1f24-4da0-88e0-05df78040d97 {
              display: none;
            }
            [id^="v0-built-with-button-"] {
              display: none;
            }
          `}</style>
        </head>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <I18nContext.Provider value={{ lang, setLang }}>
            <header className="w-full flex justify-end p-2">
              <button
                className="px-2 py-1 rounded border text-xs mr-2"
                onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              >
                {lang === "pt" ? "EN" : "PT"}
              </button>
            </header>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
          </I18nContext.Provider>
        </body>
      </html>
    )
}
