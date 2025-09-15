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

const BASE_URL = "https://42skillar-aval.vercel.app/api";

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
