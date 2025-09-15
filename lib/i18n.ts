import { createContext, useContext } from "react"

export type Language = "pt" | "en"

export const translations = {
  pt: {
    join: "Participar",
    join_loading: "Participando...",
    created_by: "Criado por",
    ends_at: "Termina em",
    duration: "Duração",
    active: "Ativa",
    closed: "Encerrada",
    manage: "Gerenciar",
    ranking: "Ranking em Tempo Real",
    no_participants: "Nenhum participante ainda",
    points: "pontos",
    // ...adicione mais chaves conforme necessário
  },
  en: {
    join: "Join",
    join_loading: "Joining...",
    created_by: "Created by",
    ends_at: "Ends at",
    duration: "Duration",
    active: "Active",
    closed: "Closed",
    manage: "Manage",
    ranking: "Live Ranking",
    no_participants: "No participants yet",
    points: "points",
    // ...add more keys as needed
  },
}

export const I18nContext = createContext<{ lang: Language; setLang: (l: Language) => void }>({ lang: "pt", setLang: () => {} })

export function useI18n() {
  return useContext(I18nContext)
}
