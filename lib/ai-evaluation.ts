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
  prompts_aceitos: string;
};

export type ChallengeGenerationError = {
  error: string;
};

const BASE_URL = "https://42skillar-aval.vercel.app/api";

// Função para gerar desafios usando Google Gemini AI

// Função para gerar desafios usando Google Gemini AI
export async function generateChallengeAI(request: ChallengeGenerationRequest): Promise<ChallengeGenerationResponse | ChallengeGenerationError> {
  try {
    // This function runs on the client; call the server-side endpoint which has access to env vars
    const res = await fetch('/api/ai/generate-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const text = await res.text()
      return { error: `Erro ao gerar desafio: ${res.status} - ${text}` }
    }

    const data = await res.json()
    return data as ChallengeGenerationResponse
  } catch (err: any) {
    return { error: `Erro ao conectar ao servidor: ${err.message}` }
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
