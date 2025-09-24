# Guia de Internacionalização - Skillar App

## Visão Geral

O sistema de internacionalização foi implementado com suporte para três idiomas:
- 🇵🇹 **Português** (pt) - idioma padrão
- 🇺🇸 **Inglês** (en)
- 🇫🇷 **Francês** (fr)

## Estrutura dos Arquivos

### Hook de Tradução
- **Arquivo**: `/hooks/use-translation.ts`
- **Função**: Hook personalizado que gerencia traduções e mudança de idioma
- **Armazenamento**: localStorage para persistir a escolha do usuário

### Componente Seletor de Idioma
- **Arquivo**: `/components/language-selector.tsx`
- **Função**: Dropdown para seleção de idioma com bandeiras e nomes
- **Localização**: Integrado na barra de navegação

### Traduções
As traduções estão organizadas no hook `use-translation.ts` em categorias:

#### Navegação (`navigation`)
- competitions, ranking, teams, history, reports, etc.

#### Equipas (`teams`)
- title, createTeam, joinTeam, members, errors, etc.

#### Competições (`competitions`)
- title, participate, details, status, etc.

#### Comum (`common`)
- search, cancel, save, delete, loading, etc.

## Como Usar

### 1. Importar o Hook
```typescript
import { useTranslation } from '@/hooks/use-translation'
```

### 2. Usar no Componente
```typescript
export function MeuComponente() {
  const { t, language, changeLanguage } = useTranslation()

  return (
    <div>
      <h1>{t('teams.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

### 3. Tradução com Parâmetros
Para textos com variáveis (como contadores):
```typescript
// Tradução: "Máximo de {{count}} membros"
<span>{t('teams.maxMembers', { count: 5 })}</span>
// Resultado: "Máximo de 5 membros"
```

### 4. Adicionar Novas Traduções

Para adicionar novas traduções, edite o arquivo `/hooks/use-translation.ts`:

```typescript
const translations = {
  pt: {
    // Categoria existente
    teams: {
      // Tradução existente
      title: "Equipas",
      // Nova tradução
      newField: "Novo Campo"
    },
    // Nova categoria
    newSection: {
      title: "Nova Seção",
      description: "Descrição da nova seção"
    }
  },
  en: {
    teams: {
      title: "Teams",
      newField: "New Field"
    },
    newSection: {
      title: "New Section", 
      description: "Description of the new section"
    }
  },
  fr: {
    teams: {
      title: "Équipes",
      newField: "Nouveau Champ"
    },
    newSection: {
      title: "Nouvelle Section",
      description: "Description de la nouvelle section"
    }
  }
}
```

### 5. Usar nas Páginas

#### Exemplo prático - Página de Equipas:
```typescript
"use client"

import { useTranslation } from '@/hooks/use-translation'

export default function EquipasPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('teams.title')}</h1>
      <button>{t('teams.createTeam')}</button>
      <input placeholder={t('teams.searchTeams')} />
    </div>
  )
}
```

## Funcionalidades Implementadas

### ✅ Componentes Traduzidos
- [x] Navegação principal (`components/navigation.tsx`)
- [x] Página de Equipas (`app/equipas/page.tsx`)
- [x] Seletor de idioma (`components/language-selector.tsx`)

### ✅ Recursos
- [x] Persistência da escolha do idioma no localStorage
- [x] Recarregamento automático da página ao trocar idioma
- [x] Suporte a parâmetros nas traduções (ex: contadores)
- [x] Sistema de fallback (retorna a chave se tradução não encontrada)
- [x] Interface visual com bandeiras dos países

## Próximos Passos

Para expandir a internacionalização:

1. **Traduzir outras páginas**:
   - Competições (`/app/competitions/page.tsx`)
   - Ranking (`/app/ranking/page.tsx`)
   - Histórico (`/app/history/page.tsx`)
   - etc.

2. **Adicionar mais idiomas**:
   - Editar o hook `use-translation.ts`
   - Adicionar ao array `languages` no `language-selector.tsx`

3. **Melhorar UX**:
   - Evitar recarregamento da página (implementar troca dinâmica)
   - Detectar idioma do browser automaticamente
   - Adicionar animações na troca de idioma

## Exemplo de Uso Completo

```typescript
"use client"

import { useTranslation } from '@/hooks/use-translation'
import { LanguageSelector } from '@/components/language-selector'

export default function ExemploPage() {
  const { t, language } = useTranslation()

  return (
    <div>
      {/* Seletor de idioma */}
      <LanguageSelector />
      
      {/* Conteúdo traduzido */}
      <h1>{t('competitions.title')}</h1>
      <p>{t('common.loading')}</p>
      <button>{t('common.save')}</button>
      
      {/* Com parâmetros */}
      <span>{t('teams.maxMembers', { count: 10 })}</span>
      
      {/* Idioma atual */}
      <p>Idioma atual: {language}</p>
    </div>
  )
}
```

## Estrutura de Tradução Recomendada

Organize as traduções por funcionalidade:

```
translations/
├── navigation/     # Navegação, menus
├── teams/         # Sistema de equipas
├── competitions/  # Competições
├── auth/          # Autenticação
├── common/        # Textos comuns
└── errors/        # Mensagens de erro
```

Este sistema fornece uma base sólida para internacionalização, sendo facilmente extensível para novas funcionalidades e idiomas.