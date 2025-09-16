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
	}

	return (
		<div style={{ backgroundImage: "url('/AI(1).gif')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' }} className="p-2">
			<div className="max-w-xl mx-auto">
				<h1 className="text-2xl font-bold mb-4 text-center text-white">Avaliação</h1>
				<p className="mb-6 text-gray-600 text-center text-white">
					Submeta o link do repositório, commit e informações do desafio para receber uma avaliação automática do seu projeto por IA.
				</p>
				<AiEvaluationForm />
			</div>
		</div>
	);
}
