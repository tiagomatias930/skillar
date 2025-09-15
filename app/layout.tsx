import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense, useState } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"
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
    return (
      <html lang="pt">
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
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <LanguageProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <Analytics />
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    )
}
