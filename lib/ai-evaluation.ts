// Atualiza os pontos do usuário na competição após avaliação IA
export async function atribuirNotaAoUsuario(competitionId: string, username: string, points: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/competitions/${competitionId}/update-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, points }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Status: ${res.status} - ${text}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
// Utilitário para integração com a API de avaliação por IA

export type EvaluationRequest = {
  url: string;
  commit: string;
  user: string;
  desafio: string;
  desc_desafio: string;
};

export type EvaluationResponse = {
  commit: string;
  repo: string;
  user: string;
  desafio: string;
  nota_final: number;
  classificacao: string;
  descricao: string;
};

export type EvaluationError = {
  error: string;
};

export type ChallengeGenerationRequest = {
  tema?: string;
  dificuldade?: "facil" | "medio" | "dificil";
  tecnologia?: string;
  tipo?: "programacao" | "design" | "analise" | "outro";
};

export type ChallengeGenerationResponse = {
  titulo: string;
  descricao: string;
  criterios_avaliacao: string[];
  dificuldade: string;
  tecnologias_sugeridas: string[];
  tempo_estimado: string;
};

export type ChallengeGenerationError = {
  error: string;
};

const BASE_URL = "https://42skillar-aval.vercel.app/api";

// Função para gerar desafios usando Google Gemini AI

// Função para gerar desafios usando Google Gemini AI
export async function generateChallengeAI(request: ChallengeGenerationRequest): Promise<ChallengeGenerationResponse | ChallengeGenerationError> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return { error: "Chave da API do Google Gemini não configurada" };
    }

    // Construir o prompt baseado nos parâmetros
    const prompt = `Gere um desafio de programação completo com as seguintes especificações:

Tema: ${request.tema || "Tecnologia em geral"}
Dificuldade: ${request.dificuldade || "médio"}
Tecnologia: ${request.tecnologia || "qualquer tecnologia"}
Tipo: ${request.tipo || "programação"}

Por favor, retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "titulo": "Título criativo e atrativo do desafio",
  "descricao": "Descrição detalhada do desafio, explicando o objetivo e requisitos",
  "criterios_avaliacao": ["Critério 1", "Critério 2", "Critério 3", "Critério 4", "Critério 5"],
  "dificuldade": "${request.dificuldade || "medio"}",
  "tecnologias_sugeridas": ["Tecnologia 1", "Tecnologia 2", "Tecnologia 3"],
  "tempo_estimado": "X horas/dias"
}

IMPORTANTE:
- O título deve ser criativo e motivador
- A descrição deve ser clara e detalhada
- Os critérios devem cobrir aspectos técnicos, criatividade, documentação, etc.
- As tecnologias sugeridas devem ser relevantes para o desafio
- O tempo estimado deve ser realista baseado na dificuldade`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API do Gemini: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Resposta inválida da API do Gemini");
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Tentar extrair o JSON da resposta
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair JSON válido da resposta");
    }

    const challengeData = JSON.parse(jsonMatch[0]);

    // Validar se tem todos os campos necessários
    if (!challengeData.titulo || !challengeData.descricao || !challengeData.criterios_avaliacao) {
      throw new Error("Resposta incompleta da IA");
    }

    return {
      titulo: challengeData.titulo,
      descricao: challengeData.descricao,
      criterios_avaliacao: Array.isArray(challengeData.criterios_avaliacao) ? challengeData.criterios_avaliacao : [],
      dificuldade: challengeData.dificuldade || request.dificuldade || "medio",
      tecnologias_sugeridas: Array.isArray(challengeData.tecnologias_sugeridas) ? challengeData.tecnologias_sugeridas : [],
      tempo_estimado: challengeData.tempo_estimado || "Não especificado"
    };

  } catch (err: any) {
    console.error("Erro ao gerar desafio com Gemini:", err);
    return { error: `Erro ao gerar desafio: ${err.message}` };
  }
}

// Função utilitária para chamada GET estilo formulário HTML, exibindo resultado em nova janela
export async function doApi(form: HTMLFormElement) {
  const params = new URLSearchParams(new FormData(form) as any);
  try {
    const res = await fetch(BASE_URL + "?" + params.toString());
    const json = await res.json();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write('<pre>' + JSON.stringify(json, null, 2) + '</pre>');
    }
  } catch (e: any) {
    alert('Erro: ' + e.message);
  }
}

export async function evaluateProjectGET(params: EvaluationRequest): Promise<EvaluationResponse | EvaluationError> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${BASE_URL}?${query}`);
  return res.json();
}

export async function evaluateProjectPOST(body: EvaluationRequest): Promise<EvaluationResponse | EvaluationError> {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status: ${res.status} - ${text}`);
    }
    return res.json();
  } catch (err: any) {
    return { error: `Erro ao conectar à API: ${err.message}` };
  }
}
