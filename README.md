# SkillarCode

<p align="center">
  <strong>Plataforma de competições de programação com IA integrada</strong>
</p>

<p align="center">
  <a href="https://vercel.com/tiago-matias-projects/v0-skillar-competition-app">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel" alt="Deployed on Vercel" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Sobre o Projeto

O **SkillarCode** é uma plataforma web de competições de programação que permite criar, participar e competir em desafios de código em tempo real. Integra inteligência artificial para geração automática de desafios, avaliação de submissões e quizzes de pré-avaliação, oferecendo uma experiência completa e gamificada para programadores de todos os níveis.

O projecto nasceu no contexto da comunidade **42** e visa promover a aprendizagem colaborativa e a prática de programação através de competição saudável.

## Funcionalidades Principais

### Competições
- **Criar competições** com duração personalizada (dias, horas ou data de fim customizada)
- **Participar** em competições ativas e acompanhar o ranking em tempo real
- **Ranking global** com pontuação acumulada entre todas as competições
- **Histórico** completo de competições passadas e vencedores
- **Encerramento automático** de competições expiradas

### Equipas
- Criar e gerir equipas com até **10 membros**
- Sistema de **roles** (líder / membro)
- Agregação automática de pontos da equipa
- Participação em competições como equipa

### Inteligência Artificial
- **Geração de desafios** com Google Gemini — configurável por tema, dificuldade, tecnologia e tipo
- **Avaliação automática** de submissões com pontuação e classificação
- **Quiz de pré-avaliação** para testar conhecimentos antes da submissão

### Gamificação
- Sistema de **ranking global** com títulos especiais:
  - ⭐ 1.º — *General President*
  - 🥈 2.º — *General Vice President*
  - 🥉 3.º — *General Director*
- **Pontuação acumulativa** ao longo de múltiplas competições
- Perfil com histórico de desempenho

### Administração
- Painel de administração para gerir competições e utilizadores
- Sistema de **blacklist** para prevenir comportamentos inadequados
- Sistema de **denúncias** de utilizadores

### Internacionalização
- 🇵🇹 Português (padrão)
- 🇺🇸 English
- 🇫🇷 Français

## Tech Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Material Design 3 |
| **Componentes UI** | Radix UI, Phosphor Icons, Framer Motion, Recharts |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL + RLS) |
| **IA** | Google Gemini 3.1. Flash Lite |
| **Integrações** | 42 School API, GitHub API |
| **Deploy** | Vercel |
| **Package Manager** | pnpm |

## Estrutura do Projeto

```
app/                  # Páginas e rotas API (Next.js App Router)
├── api/              # Endpoints REST (auth, competitions, teams, AI, reports)
├── competitions/     # Páginas de competições
├── admin/            # Painel de administração
├── ranking/          # Ranking global
├── history/          # Histórico de competições
└── ...
components/           # Componentes React reutilizáveis
hooks/                # Custom hooks (traduções, localStorage)
lib/                  # Utilitários, cliente Supabase, avaliação IA
scripts/              # Migrações SQL e scripts de base de dados
docs/                 # Documentação técnica
styles/               # Estilos globais e templates CSS
```

## Começar

### Pré-requisitos

- **Node.js** 18+
- **pnpm** instalado globalmente
- Conta no **Supabase** com projeto configurado
- Chave de API do **Google Gemini**

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/tiagomatias930/skillar.git
cd skillar

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

Preencher o ficheiro `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### Executar

```bash
# Modo de desenvolvimento
pnpm dev

# Build de produção
pnpm build && pnpm start
```

### Base de Dados

Os scripts de migração estão na pasta `scripts/`. Executar por ordem numérica no Supabase SQL Editor:

1. `001_create_skillar_tables.sql` — Tabelas principais
2. `002_add_rls_function.sql` — Funções RLS
3. `006_create_teams_tables.sql` — Tabelas de equipas
4. ... (restantes migrações)

## Deploy

O projeto está deployado no **Vercel**:

**[https://vercel.com/tiago-matias-projects/v0-skillar-competition-app](https://vercel.com/tiago-matias-projects/v0-skillar-competition-app)**

---

## Contribuir

O **SkillarCode** é um projeto open-source e estamos sempre à procura de colaboradores!

Se tens interesse em programação competitiva, inteligência artificial, desenvolvimento web ou simplesmente queres contribuir para uma plataforma que ajuda programadores a evoluírem — **este projeto é para ti**.

### Como contribuir

1. Faz **fork** do repositório
2. Cria uma **branch** para a tua feature (`git checkout -b feature/minha-feature`)
3. Faz **commit** das tuas alterações (`git commit -m 'Adicionar minha feature'`)
4. Faz **push** para a branch (`git push origin feature/minha-feature`)
5. Abre um **Pull Request**

Todas as contribuições são bem-vindas — desde correções de bugs e melhorias de UI, até novas funcionalidades, traduções ou documentação. Não hesites em abrir uma **issue** para discutir ideias ou reportar problemas.

**Vamos construir juntos a melhor plataforma de competições de código!** 🚀

---

<p align="center">
  Feito com ❤️ pela comunidade SkillarCode
</p>
