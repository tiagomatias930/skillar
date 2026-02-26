"use client"

import { useState } from "react";
import { CheckCircle, XCircle, MedalMilitary } from "@phosphor-icons/react";

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // index of correct option
};

export type QuizProps = {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
};

export default function PreEvaluationQuiz({ questions, onComplete }: QuizProps) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  function handleAnswer(idx: number) {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === questions[current].answer) {
      setScore((s) => s + 1);
    } else {
      setScore((s) => s - 1);
    }
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        onComplete(score + (idx === questions[current].answer ? 1 : -1));
      }
    }, 1200);
  }

  if (finished) {
    return (
      <div className="mb-6 rounded-3xl bg-[var(--md3-surface-container)] border border-[var(--md3-outline-variant)]/50 md3-elevation-2 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
        {/* MD3 filled top accent */}
        <div className="h-1 bg-primary" />
        <div className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--md3-primary-container)]">
            <MedalMilitary className="w-10 h-10 text-[var(--md3-on-primary-container)]" weight="duotone" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--md3-on-surface)]">Pré-avaliação Concluída!</h3>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--md3-primary-container)]">
            <span className="text-3xl font-bold text-[var(--md3-on-primary-container)]">{score}</span>
            <span className="text-sm font-medium text-[var(--md3-on-primary-container)]">pontos</span>
          </div>
          <p className="text-[var(--md3-on-surface-variant)] text-sm">Pode agora submeter o seu projeto para avaliação.</p>
        </div>
      </div>
    );
  }

  const progress = ((current / questions.length) * 100);
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="mb-6 overflow-hidden rounded-3xl bg-[var(--md3-surface-container)] border border-[var(--md3-outline-variant)]/50 md3-elevation-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header — MD3 surface-container-high */}
      <div className="bg-[var(--md3-surface-container-high)] p-5 border-b border-[var(--md3-outline-variant)]/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--md3-on-surface)] text-lg tracking-tight">Quem sabe, sabe.</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md3-primary-container)]">
            <span className="text-sm font-semibold text-[var(--md3-on-primary-container)]">{score} pts</span>
          </div>
        </div>

        {/* Barra de progresso — MD3 linear indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[var(--md3-on-surface-variant)]">Questão {current + 1} de {questions.length}</span>
            <span className="text-[var(--md3-on-surface-variant)]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--md3-surface-container-highest)] overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo — MD3 surface */}
      <div className="p-5 space-y-5">
        {/* Pergunta — MD3 surface-container-low card */}
        <div className="p-4 rounded-2xl bg-[var(--md3-surface-container-low)] border border-[var(--md3-outline-variant)]/20">
          <p className="text-base text-[var(--md3-on-surface)] leading-relaxed">{questions[current].question}</p>
        </div>

        {/* Opções — MD3 outlined/filled cards */}
        <div className="grid gap-3">
          {questions[current].options.map((opt, idx) => {
            const isSelected = answered === idx;
            const isCorrect = idx === questions[current].answer;
            const showFeedback = answered !== null;

            let buttonClass =
              "group relative p-4 rounded-2xl border transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] text-left md3-state-layer ";

            if (showFeedback) {
              if (isSelected && isCorrect) {
                buttonClass += "bg-[#1b5e20]/20 border-[#4caf50] md3-elevation-1";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-[var(--destructive)]/10 border-[var(--destructive)] md3-elevation-1";
              } else if (!isSelected && isCorrect) {
                buttonClass += "bg-[#1b5e20]/10 border-[#4caf50]/40";
              } else {
                buttonClass += "bg-[var(--md3-surface-container-low)] border-[var(--md3-outline-variant)]/30 opacity-50";
              }
            } else {
              buttonClass +=
                "bg-[var(--md3-surface-container-low)] border-[var(--md3-outline-variant)]/40 hover:md3-elevation-1 hover:border-[var(--md3-outline)]/60 active:scale-[0.99]";
            }

            return (
              <button
                key={idx}
                className={buttonClass}
                onClick={() => handleAnswer(idx)}
                disabled={answered !== null}
              >
                <div className="flex items-center gap-3">
                  {/* Label da opção — MD3 small FAB style circle */}
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                      showFeedback && isSelected && isCorrect
                        ? "bg-[#4caf50] text-white"
                        : showFeedback && isSelected && !isCorrect
                          ? "bg-[var(--destructive)] text-[var(--destructive-foreground)]"
                          : showFeedback && isCorrect
                            ? "bg-[#4caf50]/40 text-[var(--md3-on-surface)]"
                            : "bg-[var(--md3-surface-container-highest)] text-[var(--md3-on-surface)] group-hover:bg-primary/20"
                    }`}
                  >
                    {optionLabels[idx]}
                  </div>

                  {/* Texto da opção */}
                  <span className="flex-1 text-[var(--md3-on-surface)] text-sm font-medium leading-snug">{opt}</span>

                  {/* Ícone de feedback */}
                  {showFeedback && isSelected && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-[#4caf50] animate-in zoom-in duration-300" weight="duotone" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--destructive)] animate-in zoom-in duration-300" weight="duotone" />
                      )}
                    </div>
                  )}
                  {showFeedback && !isSelected && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-[#4caf50]/60" weight="duotone" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback — MD3 tonal banner */}
        {answered !== null && (
          <div
            className={`p-4 rounded-2xl animate-in slide-in-from-bottom-2 duration-300 ${
              answered === questions[current].answer
                ? "bg-[#1b5e20]/15 border border-[#4caf50]/30"
                : "bg-[var(--destructive)]/10 border border-[var(--destructive)]/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {answered === questions[current].answer ? (
                <>
                  <CheckCircle className="w-5 h-5 text-[#4caf50]" weight="duotone" />
                  <span className="text-[#81c784] text-sm font-semibold">Correto! +1 ponto</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-[var(--destructive)]" weight="duotone" />
                  <span className="text-[var(--destructive)] text-sm font-semibold">Incorreto! -1 ponto</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
