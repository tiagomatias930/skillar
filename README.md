# Skillar competition app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tiago-matias-projects/v0-skillar-competition-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/ISbWrUFd90B)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/tiago-matias-projects/v0-skillar-competition-app](https://vercel.com/tiago-matias-projects/v0-skillar-competition-app)**

## Configuração da API do Google Gemini

Para usar a funcionalidade de geração de desafios com IA, você precisa configurar uma chave da API do Google Gemini:

### 1. Obter a Chave da API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar no Projeto

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a seguinte linha:

```env
GOOGLE_GEMINI_API_KEY=sua_chave_aqui
```

### 3. Funcionalidades Disponíveis

- **Geração de Desafios**: Na página de criação de competição, use o botão "Gerar Desafio com IA"
- **Parâmetros Personalizáveis**:
  - Tema do desafio
  - Nível de dificuldade (Fácil, Médio, Difícil)
  - Tecnologia principal
  - Tipo de desafio (Programação, Design, Análise, Outro)

### 4. Como Usar

1. Acesse `/create-competition`
2. Preencha os parâmetros opcionais para personalizar o desafio
3. Clique em "Gerar Desafio com IA"
4. O desafio gerado será automaticamente preenchido nos campos de título e descrição
5. Edite conforme necessário e crie a competição

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/ISbWrUFd90B](https://v0.app/chat/projects/ISbWrUFd90B)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Environment variables

This project uses a server-side token to authenticate requests to the 42 Intra API. Add the token to your local environment and to your production provider (for example, Vercel).

Local (development)

1. Copy `.env.local.example` to `.env.local` in the project root.
2. Replace the placeholder with your real token:

```env
INTRA_API_TOKEN=s-your_real_token_here
```

3. Restart the dev server so Next.js picks up the new env var:

```bash
npm run dev
```

Production (Vercel)

1. Go to your project settings on Vercel.
2. Under Environment Variables, add a new variable named `INTRA_API_TOKEN` and paste the token value.
3. Redeploy the project.

Security notes:

- Never commit `.env.local` or any secret values to git. `.env.local.example` is safe to commit and contains placeholders.
- If you suspect a token has been exposed, rotate it immediately.

## GitHub Repository Integration

When a user joins a competition, a GitHub repository is automatically created for them to host their project code.

### Setup GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Skillar App"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token" and copy it

### Local Setup

Add to `.env.local`:
```env
GITHUB_TOKEN=ghp_your_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel)

1. Go to your Vercel project settings
2. Add environment variables:
   - `GITHUB_TOKEN`: your GitHub token
   - `NEXT_PUBLIC_APP_URL`: your production URL (e.g., `https://42skillar.vercel.app`)
3. Redeploy

### Features

- Automatic repo creation when joining a competition
- Repository naming: `skillar-{competition-title}-{username}-{id}`
- Includes README with competition info and quick start guide
- Repository link displayed to user after joining
- Link saved in participant record for future reference

### Database Migration

Run the migration to add the `repository_url` column:
```sql
-- Run this in your Supabase SQL editor
ALTER TABLE participants ADD COLUMN IF NOT EXISTS repository_url TEXT;
CREATE INDEX IF NOT EXISTS idx_participants_repository_url ON participants(repository_url);
```

Or use the migration file: `scripts/008_add_repository_url_to_participants.sql`
