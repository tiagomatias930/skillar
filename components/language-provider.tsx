"use client"

import { useState } from "react"
import { useTheme } from "@/components/use-theme"
import { I18nContext, Language } from "@/lib/i18n"

  const [lang, setLang] = useState<Language>("pt")
  const { theme, setTheme } = useTheme()
  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      <header className="w-full flex justify-end p-2 gap-2">
        <button
          className="px-2 py-1 rounded border text-xs"
          onClick={() => setLang(lang === "pt" ? "en" : "pt")}
        >
          {lang === "pt" ? "EN" : "PT"}
        </button>
        <button
          className="px-2 py-1 rounded border text-xs"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "escuro" : "claro"}
        </button>
      </header>
      {children}
    </I18nContext.Provider>
  )
}
