# Integração com Google Gemini API

Este documento explica como a aplicação Skillar integra com a API do Google Gemini para geração automática de desafios.

## Visão Geral

A integração permite que usuários criem desafios de programação de forma assistida por IA, utilizando o modelo Gemini 1.5 Flash do Google.

## Configuração

### 1. Pré-requisitos

- Conta Google válida
- Chave da API do Google Gemini
- Node.js e npm/pnpm instalados

### 2. Obtenção da Chave da API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (formato: `AIza...`)

### 3. Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GOOGLE_GEMINI_API_KEY=sua_chave_da_api_aqui
```

## Funcionalidades

### Geração de Desafios

A função `generateChallengeAI()` localizada em `/lib/ai-evaluation.ts` é responsável por:

1. **Receber parâmetros** do usuário (tema, dificuldade, tecnologia, tipo)
2. **Construir um prompt estruturado** para o modelo Gemini
3. **Fazer requisição** para a API do Google Gemini
4. **Processar a resposta** e retornar um desafio formatado

#### Parâmetros Aceitos

```typescript
interface ChallengeGenerationRequest {
  tema?: string;              // Tema do desafio (ex: "E-commerce", "Jogos")
  dificuldade?: "facil" | "medio" | "dificil";  // Nível de dificuldade
  tecnologia?: string;        // Tecnologia principal (ex: "React", "Node.js")
  tipo?: "programacao" | "design" | "analise" | "outro";  // Tipo do desafio
}
```

#### Resposta Gerada

```typescript
interface ChallengeGenerationResponse {
  titulo: string;                    // Título criativo do desafio
  descricao: string;                 // Descrição detalhada
  criterios_avaliacao: string[];     // Lista de critérios para avaliação
  dificuldade: string;               // Nível de dificuldade
  tecnologias_sugeridas: string[];   // Tecnologias recomendadas
  tempo_estimado: string;            // Tempo estimado para conclusão
}
```

## Como Usar

### Interface do Usuário

1. Acesse a página de criação de competição (`/create-competition`)
2. Localize a seção "Gerar Desafio com IA"
3. Preencha os campos opcionais:
   - Tema do desafio
   - Tecnologia
   - Dificuldade
   - Tipo
4. Clique em "Gerar Desafio com IA"
5. Aguarde a geração (pode levar alguns segundos)
6. O desafio gerado será exibido e os campos preenchidos automaticamente

### Tratamento de Erros

A aplicação trata os seguintes cenários de erro:

- **Chave da API não configurada**: Mensagem clara solicitando configuração
- **Erro na API do Gemini**: Detalhes do erro retornados pela API
- **Resposta inválida**: Validação da estrutura JSON retornada
- **Timeout**: Limitação de tempo para resposta da API

## Limitações e Considerações

### Rate Limits
- A API do Google Gemini tem limites de uso
- Considere implementar cache para evitar requisições desnecessárias
- Monitore o uso para evitar exceder limites

### Custos
- A API do Gemini tem custos associados ao uso
- Consulte a [documentação de preços](https://ai.google.dev/pricing) do Google AI

### Segurança
- Nunca exponha a chave da API no código fonte
- Use variáveis de ambiente para configuração
- Implemente validação de entrada para prevenir ataques

## Desenvolvimento

### Testando Localmente

1. Configure a chave da API no `.env.local`
2. Execute o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```
3. Acesse `http://localhost:3001/create-competition`
4. Teste a funcionalidade de geração de desafios

### Debug

Para debugar problemas com a API:

1. Verifique os logs do console do navegador
2. Confirme se a chave da API está correta
3. Teste a conectividade com a API do Gemini
4. Verifique se não excedeu os limites de uso

## Suporte

Para problemas relacionados à API do Google Gemini:

- [Documentação Oficial](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Console de APIs do Google](https://console.cloud.google.com/)

Para problemas específicos da aplicação Skillar, consulte a documentação principal do projeto.