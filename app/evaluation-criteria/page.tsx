"use client";

import AiEvaluationForm from "@/components/ai-evaluation-form";
import PreEvaluationQuiz, { QuizQuestion } from "@/components/pre-evaluation-quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";

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
		<div className="min-h-screen bg-black text-white font-mono flex flex-col">
			<Navigation />

			<div className="flex-grow container mx-auto px-4 py-8 max-w-xl">
				<h1 className="text-2xl font-bold mb-2 text-center text-white uppercase tracking-widest">Auditoria e Verificação</h1>
				<p className="mb-6 text-xs text-zinc-400 text-center leading-relaxed">
					Selecione o laboratório ou CTF target, responda ao questionário de pré-avaliação e envie seu relatório de exploração (POC) para auditoria automatizada por IA.
				</p>

				<div className="mb-6 bg-zinc-950 p-4 border border-border">
					<Label htmlFor="competition-select" className="text-zinc-500 font-bold uppercase text-[10px]">Selecione o Lab / CTF Target:</Label>
					<select
						id="competition-select"
						className="w-full mt-1 bg-black border border-border text-white text-xs rounded-none px-3 py-2 outline-none focus:border-primary transition-all font-mono"
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
					<div className="mb-6 p-4 border border-border bg-zinc-950 text-xs leading-relaxed">
						<div className="text-zinc-500 font-bold uppercase text-[10px] mb-1">Briefing do Target:</div>
						<div className="text-zinc-300">{selectedCompetition.description}</div>
					</div>
				)}

				{selectedCompetition && loadingQuiz && <div className="text-center text-xs text-zinc-500 animate-pulse">Acessando banco de questões de pré-avaliação...</div>}
				{selectedCompetition && quizError && <div className="text-center text-xs text-red-400 font-bold">{quizError}</div>}

				{selectedCompetition && !loadingQuiz && !quizError && questions && questions.length > 0 && !quizDone && (
					<div className="border border-border p-4 bg-zinc-950 mb-6">
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
					</div>
				)}

				{selectedCompetition && generatingWithAI && (
					<div className="text-center text-xs text-zinc-500 animate-pulse">Gerando questionário de segurança por IA...</div>
				)}
				{selectedCompetition && !loadingQuiz && !quizError && !generatingWithAI && questions && questions.length === 0 && (
					<div className="text-center text-xs text-zinc-500 p-4 border border-border bg-zinc-950">Sem questionários de pré-avaliação disponíveis para este target.</div>
				)}

				{selectedCompetition && quizDone && (
					<div className="space-y-4">
						{pointsAdded && (
							<div className="p-4 rounded-none bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-500">
								<div className="text-center text-xs text-emerald-400 font-bold">
									✅ {quizScore} flags / pontos adicionados ao seu scoreboard!
								</div>
							</div>
						)}
						<div className="border border-border p-4 bg-zinc-950">
							<AiEvaluationForm
								initialUser={formData.user}
								initialDesafio={formData.desafio}
								initialDescDesafio={formData.desc_desafio}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
