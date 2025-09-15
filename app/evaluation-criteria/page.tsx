"use client";
import AiEvaluationForm from "@/components/ai-evaluation-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AvaliacaoForm() {
	const [candidate, setCandidate] = useState("");
	const [challengeName, setChallengeName] = useState("");
	const [totalPoints, setTotalPoints] = useState(0);

	function exportCertificate() {
		if (!candidate || !challengeName || totalPoints <= 0) return;
		// ...lógica de exportação do certificado (pode ser adaptada do original)...
	}

	return (
		<div className="max-w-xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 text-center">Avaliação Automática por IA</h1>
			<p className="mb-6 text-gray-600 text-center">
				Submeta o link do repositório, commit e informações do desafio para receber uma avaliação automática do seu projeto por IA.
			</p>
			<AiEvaluationForm />
		</div>
	);
}



