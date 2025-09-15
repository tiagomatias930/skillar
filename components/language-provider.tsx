"use client"

import { useState } from "react"
import { I18nContext, Language } from "@/lib/i18n"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("pt")
  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      <header className="w-full flex justify-end p-2">
        <button
          className="px-2 py-1 rounded border text-xs mr-2"
          onClick={() => setLang(lang === "pt" ? "en" : "pt")}
        >
          {lang === "pt" ? "EN" : "PT"}
        </button>
      </header>
      {children}
    </I18nContext.Provider>
  )
}
