"use client";

import AiEvaluationForm from "@/components/ai-evaluation-form";
import PreEvaluationQuiz, { QuizQuestion } from "@/components/pre-evaluation-quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";


export default function AvaliacaoForm() {
	const [competitions, setCompetitions] = useState<any[]>([]);
	const [selectedCompetition, setSelectedCompetition] = useState<any | null>(null);
	const [quizDone, setQuizDone] = useState(false);
	const [quizScore, setQuizScore] = useState<number | null>(null);
	const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
	const [loadingQuiz, setLoadingQuiz] = useState(false);
	const [quizError, setQuizError] = useState<string | null>(null);
	const [formData, setFormData] = useState({ user: '', desafio: '', desc_desafio: '' });

	// Buscar competições ativas ao carregar
	useEffect(() => {
		async function fetchCompetitions() {
			const res = await fetch('/api/competitions');
			const data = await res.json();
			setCompetitions(data.competitions || data || []);
		}
		fetchCompetitions();
		// Preencher usuário
		const username = typeof window !== 'undefined' ? localStorage.getItem("skillar_username") || "" : "";
		setFormData(f => ({ ...f, user: username }));
	}, []);

	// Buscar perguntas e preencher dados ao selecionar competição
	useEffect(() => {
		if (!selectedCompetition) return;
		setLoadingQuiz(true);
		setQuizError(null);
		setQuestions(null);
		setQuizDone(false);
		setQuizScore(null);
		setFormData(f => ({
			...f,
			desafio: selectedCompetition.id,
			desc_desafio: selectedCompetition.description || '',
		}));
		async function fetchQuestions() {
			try {
				const res = await fetch(`/api/competitions/${selectedCompetition.id}/pre-evaluation-questions`);
				const data = await res.json();
				if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
					setQuestions(data.questions);
				} else {
					setQuestions([]);
				}
			} catch (e) {
				setQuizError("Erro ao buscar questões de pré-avaliação.");
				setQuestions([]);
			} finally {
				setLoadingQuiz(false);
			}
		}
		fetchQuestions();
	}, [selectedCompetition]);

	return (
		<div style={{ backgroundImage: "url('/AI(1).gif')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' }} className="p-2">
			<div className="max-w-xl mx-auto">
				<h1 className="text-2xl font-bold mb-4 text-center text-white">Avaliação</h1>
				<p className="mb-6 text-gray-600 text-center text-white">
					Selecione o desafio que está participando, responda o quiz e submeta seu projeto para avaliação automática por IA.
				</p>
				<div className="mb-6">
					<Label htmlFor="competition-select" className="text-white">Escolha o desafio:</Label>
					<select
						id="competition-select"
						className="w-full p-2 rounded border mt-1"
						value={selectedCompetition?.id || ''}
						onChange={e => {
							const comp = competitions.find(c => c.id === e.target.value);
							setSelectedCompetition(comp || null);
						}}
					>
						<option value="">Selecione...</option>
						{competitions.map((c) => (
							<option key={c.id} value={c.id}>{c.title}</option>
						))}
					</select>
				</div>
				{selectedCompetition && (
					<div className="mb-6 p-4 rounded bg-white/10 border border-white/20">
						<div className="mb-2 text-white"><b>Descrição:</b> {selectedCompetition.description}</div>
					</div>
				)}
				{selectedCompetition && loadingQuiz && <div className="text-center text-white">Carregando pré-avaliação...</div>}
				{selectedCompetition && quizError && <div className="text-center text-red-300">{quizError}</div>}
				{selectedCompetition && !loadingQuiz && !quizError && questions && questions.length > 0 && !quizDone && (
					<PreEvaluationQuiz
						questions={questions}
						onComplete={(score) => {
							setQuizDone(true);
							setQuizScore(score);
						}}
					/>
				)}
				{selectedCompetition && !loadingQuiz && !quizError && questions && questions.length === 0 && (
					<div className="text-center text-white">Nenhuma questão de pré-avaliação disponível para esta competição.</div>
				)}
				{selectedCompetition && quizDone && (
					<>
						<div className="mb-4 text-center text-white">
							Pré-avaliação concluída! Sua pontuação: <b>{quizScore}</b>
						</div>
						<AiEvaluationForm
							initialUser={formData.user}
							initialDesafio={formData.desafio}
							initialDescDesafio={formData.desc_desafio}
						/>
					</>
				)}
			</div>
		</div>
	);
}
