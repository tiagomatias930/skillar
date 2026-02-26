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
	const [generatingWithAI, setGeneratingWithAI] = useState(false);
	const [pointsAdded, setPointsAdded] = useState(false);
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
					// No questions found: attempt to generate with AI
					setQuestions([]);
					try {
						setGeneratingWithAI(true);
						const aiRes = await fetch('/api/ai/generate-quiz', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ competitionId: selectedCompetition.id, title: selectedCompetition.title, description: selectedCompetition.description }),
						});
						const aiData = await aiRes.json();
						if (aiData.success && Array.isArray(aiData.questions) && aiData.questions.length > 0) {
							setQuestions(aiData.questions);
						} else {
							setQuestions([]);
							const msg = aiData.error || (aiData.debug && (aiData.debug.parseError || aiData.debug.outputSnippet)) || 'Nenhuma questão disponível e geração por IA falhou.'
							setQuizError(String(msg));
						}
					} catch (e) {
						setQuizError('Erro ao gerar questões por IA.');
						setQuestions([]);
					} finally {
						setGeneratingWithAI(false);
					}
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
		<div style={{ backgroundImage: "url('/AI(1).gif')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' }} className="p-2 sm:p-4">
			<div className="max-w-xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-foreground">Avaliação</h1>
				<p className="mb-4 sm:mb-6 text-sm sm:text-base text-[var(--md3-on-surface-variant)] text-center text-foreground px-2">
					Selecione o desafio que está participando, responda o quiz e submeta seu projeto para avaliação automática por IA.
				</p>
				<div className="mb-4 sm:mb-6 px-2 sm:px-0">
					<Label htmlFor="competition-select" className="text-foreground text-sm sm:text-base">Escolha o desafio:</Label>
					<select
						id="competition-select"
						className="w-full p-2 rounded border mt-1 text-black text-sm sm:text-base"
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
					<div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded mx-2 sm:mx-0">
						<div className="mb-2 text-foreground text-sm sm:text-base"><b>Descrição:</b> {selectedCompetition.description}</div>
					</div>
				)}
				{selectedCompetition && loadingQuiz && <div className="text-center text-foreground">Carregando pré-avaliação...</div>}
				{selectedCompetition && quizError && <div className="text-center text-red-300">{quizError}</div>}
				{selectedCompetition && !loadingQuiz && !quizError && questions && questions.length > 0 && !quizDone && (
					<PreEvaluationQuiz
						questions={questions}
						onComplete={async (score) => {
							setQuizDone(true);
							setQuizScore(score);
							
							// Add quiz points to participant
							try {
								const res = await fetch(`/api/competitions/${selectedCompetition.id}/add-quiz-points`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ 
										username: formData.user, 
										quizScore: score 
									})
								});
								const data = await res.json();
								if (data.success) {
									console.log('Quiz points added successfully:', data.points);
									setPointsAdded(true);
								} else {
									console.error('Failed to add quiz points:', data.error);
								}
							} catch (err) {
								console.error('Error adding quiz points:', err);
							}
						}}
					/>
				)}
				{selectedCompetition && generatingWithAI && (
					<div className="text-center text-foreground">Gerando pré-avaliação com IA...</div>
				)}
				{selectedCompetition && !loadingQuiz && !quizError && !generatingWithAI && questions && questions.length === 0 && (
					<div className="text-center text-foreground">Nenhuma questão de pré-avaliação disponível para esta competição.</div>
				)}
				{selectedCompetition && quizDone && (
					<>
						{pointsAdded && (
							<div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 animate-in fade-in slide-in-from-top-2 duration-500">
								<div className="text-center text-green-300">
									✅ <b>{quizScore} pontos</b> foram adicionados à sua participação!
								</div>
							</div>
						)}
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
