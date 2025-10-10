"use client";

import AiEvaluationForm from "@/components/ai-evaluation-form";
import PreEvaluationQuiz, { QuizQuestion } from "@/components/pre-evaluation-quiz";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";


export default function AvaliacaoForm() {
	const [quizDone, setQuizDone] = useState(false);
	const [quizScore, setQuizScore] = useState<number | null>(null);
	const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// TODO: obter competitionId real do contexto/rota
	const competitionId = "1";

	useEffect(() => {
		async function fetchQuestions() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/competitions/${competitionId}/pre-evaluation-questions`);
				const data = await res.json();
				if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
					setQuestions(data.questions);
				} else {
					setQuestions([]);
				}
			} catch (e) {
				setError("Erro ao buscar questões de pré-avaliação.");
				setQuestions([]);
			} finally {
				setLoading(false);
			}
		}
		fetchQuestions();
	}, [competitionId]);

	return (
		<div style={{ backgroundImage: "url('/AI(1).gif')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' }} className="p-2">
			<div className="max-w-xl mx-auto">
				<h1 className="text-2xl font-bold mb-4 text-center text-white">Avaliação</h1>
				<p className="mb-6 text-gray-600 text-center text-white">
					Submeta o link do repositório, commit e informações do desafio para receber uma avaliação automática do seu projeto por IA.
				</p>
				{loading && <div className="text-center text-white">Carregando pré-avaliação...</div>}
				{error && <div className="text-center text-red-300">{error}</div>}
				{!loading && !error && questions && questions.length > 0 && !quizDone && (
					<PreEvaluationQuiz
						questions={questions}
						onComplete={(score) => {
							setQuizDone(true);
							setQuizScore(score);
						}}
					/>
				)}
				{!loading && !error && questions && questions.length === 0 && (
					<div className="text-center text-white">Nenhuma questão de pré-avaliação disponível para esta competição.</div>
				)}
				{quizDone && (
					<>
						<div className="mb-4 text-center text-white">
							Pré-avaliação concluída! Sua pontuação: <b>{quizScore}</b>
						</div>
						<AiEvaluationForm />
					</>
				)}
			</div>
		</div>
	);
}
