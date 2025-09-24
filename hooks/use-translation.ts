"use client"

import { useState, useEffect } from 'react'

// Traduções
const translations = {
  pt: {
    navigation: {
      competitions: "Competições",
      ranking: "Ranking", 
      teams: "Equipas",
      history: "Histórico",
      reports: "Relatórios",
      admin: "Admin",
      blacklist: "Lista Negra",
      createCompetition: "Criar Competição",
      evaluationCriteria: "Critérios de Avaliação",
      login: "Entrar",
      logout: "Sair"
    },
    teams: {
      title: "Equipas",
      myTeam: "Minha Equipa",
      searchTeams: "Procurar equipas...",
      createTeam: "Criar Equipa",
      joinTeam: "Entrar na Equipa",
      leaveTeam: "Sair da Equipa",
      teamName: "Nome da Equipa",
      teamDescription: "Descrição da Equipa",
      members: "Membros",
      totalPoints: "Pontos Totais",
      leader: "Líder",
      member: "Membro",
      maxMembers: "Máximo de {{count}} membros",
      teamFull: "Equipa cheia",
      alreadyInTeam: "Já estás numa equipa",
      cancel: "Cancelar",
      create: "Criar",
      comingSoon: "Brevemente...",
      loading: "A carregar...",
      noTeamsFound: "Nenhuma equipa encontrada",
      createFirstTeam: "Criar primeira equipa",
      errors: {
        createTeam: "Erro ao criar equipa",
        joinTeam: "Erro ao entrar na equipa",
        leaveTeam: "Erro ao sair da equipa",
        loadTeams: "Erro ao carregar equipas",
        teamNameRequired: "Nome da equipa é obrigatório",
        tryAgain: "Tente novamente."
      }
    },
    competitions: {
      title: "Competições",
      participate: "Participar",
      details: "Detalhes",
      startDate: "Data de Início",
      endDate: "Data de Fim",
      participants: "Participantes",
      status: "Estado",
      active: "Ativa",
      ended: "Terminada",
      upcoming: "Próxima"
    },
    common: {
      search: "Procurar",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Adicionar",
      close: "Fechar",
      confirm: "Confirmar",
      yes: "Sim",
      no: "Não",
      loading: "A carregar...",
      error: "Erro",
      success: "Sucesso",
      language: "Idioma",
      selectLanguage: "Selecionar Idioma"
    }
  },
  en: {
    navigation: {
      competitions: "Competitions",
      ranking: "Ranking", 
      teams: "Teams",
      history: "History",
      reports: "Reports",
      admin: "Admin",
      blacklist: "Blacklist",
      createCompetition: "Create Competition",
      evaluationCriteria: "Evaluation Criteria",
      login: "Login",
      logout: "Logout"
    },
    teams: {
      title: "Teams",
      myTeam: "My Team",
      searchTeams: "Search teams...",
      createTeam: "Create Team",
      joinTeam: "Join Team",
      leaveTeam: "Leave Team",
      teamName: "Team Name",
      teamDescription: "Team Description",
      members: "Members",
      totalPoints: "Total Points",
      leader: "Leader",
      member: "Member",
      maxMembers: "Max {{count}} members",
      teamFull: "Team full",
      alreadyInTeam: "Already in a team",
      cancel: "Cancel",
      create: "Create",
      comingSoon: "Coming Soon...",
      loading: "Loading...",
      noTeamsFound: "No teams found",
      createFirstTeam: "Create first team",
      errors: {
        createTeam: "Error creating team",
        joinTeam: "Error joining team",
        leaveTeam: "Error leaving team",
        loadTeams: "Error loading teams",
        teamNameRequired: "Team name is required",
        tryAgain: "Please try again."
      }
    },
    competitions: {
      title: "Competitions",
      participate: "Participate",
      details: "Details",
      startDate: "Start Date",
      endDate: "End Date",
      participants: "Participants",
      status: "Status",
      active: "Active",
      ended: "Ended",
      upcoming: "Upcoming"
    },
    common: {
      search: "Search",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      language: "Language",
      selectLanguage: "Select Language"
    }
  },
  fr: {
    navigation: {
      competitions: "Compétitions",
      ranking: "Classement", 
      teams: "Équipes",
      history: "Historique",
      reports: "Rapports",
      admin: "Admin",
      blacklist: "Liste Noire",
      createCompetition: "Créer une Compétition",
      evaluationCriteria: "Critères d'Évaluation",
      login: "Connexion",
      logout: "Déconnexion"
    },
    teams: {
      title: "Équipes",
      myTeam: "Mon Équipe",
      searchTeams: "Rechercher des équipes...",
      createTeam: "Créer une Équipe",
      joinTeam: "Rejoindre l'Équipe",
      leaveTeam: "Quitter l'Équipe",
      teamName: "Nom de l'Équipe",
      teamDescription: "Description de l'Équipe",
      members: "Membres",
      totalPoints: "Points Totaux",
      leader: "Chef",
      member: "Membre",
      maxMembers: "Maximum {{count}} membres",
      teamFull: "Équipe complète",
      alreadyInTeam: "Déjà dans une équipe",
      cancel: "Annuler",
      create: "Créer",
      comingSoon: "Bientôt disponible...",
      loading: "Chargement...",
      noTeamsFound: "Aucune équipe trouvée",
      createFirstTeam: "Créer la première équipe",
      errors: {
        createTeam: "Erreur lors de la création de l'équipe",
        joinTeam: "Erreur lors de l'adhésion à l'équipe",
        leaveTeam: "Erreur en quittant l'équipe",
        loadTeams: "Erreur lors du chargement des équipes",
        teamNameRequired: "Le nom de l'équipe est requis",
        tryAgain: "Veuillez réessayer."
      }
    },
    competitions: {
      title: "Compétitions",
      participate: "Participer",
      details: "Détails",
      startDate: "Date de Début",
      endDate: "Date de Fin",
      participants: "Participants",
      status: "Statut",
      active: "Active",
      ended: "Terminée",
      upcoming: "Prochaine"
    },
    common: {
      search: "Rechercher",
      cancel: "Annuler",
      save: "Sauvegarder",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      close: "Fermer",
      confirm: "Confirmer",
      yes: "Oui",
      no: "Non",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      language: "Langue",
      selectLanguage: "Sélectionner la Langue"
    }
  }
}

type TranslationKey = string
type Language = 'pt' | 'en' | 'fr'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('pt')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && ['pt', 'en', 'fr'].includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  const t = (key: TranslationKey, options?: { count?: number }): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value === 'string') {
      // Substituir placeholders como {{count}}
      if (options?.count !== undefined) {
        return value.replace('{{count}}', options.count.toString())
      }
      return value
    }
    
    return key // Retorna a chave se não encontrar a tradução
  }

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  return { t, language, changeLanguage }
}