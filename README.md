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
