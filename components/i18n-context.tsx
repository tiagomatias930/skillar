"use client"

import { createContext, useContext } from "react"
import type { Language } from "@/lib/i18n"

export const I18nContext = createContext<{ lang: Language; setLang: (l: Language) => void }>({ lang: "pt", setLang: () => {} })

export function useI18n() {
  return useContext(I18nContext)
}
