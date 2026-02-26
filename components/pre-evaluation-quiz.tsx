"use client"

import { useState } from "react";
import { CheckCircle, XCircle, MedalMilitary, Lightning } from "@phosphor-icons/react";

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
      <div className="mb-6 p-8 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <MedalMilitary className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" weight="duotone" />
          <h3 className="text-2xl font-bold text-foreground">Pré-avaliação Concluída! </h3>
          <div className="text-4xl font-bold text-foreground">{score} pontos</div>
          <p className="text-[var(--md3-on-surface-variant)]">Pode agora submeter o seu projeto para avaliação.</p>
        </div>
      </div>
    );
  }

  const progress = ((current / questions.length) * 100);
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header com progresso */}
      <div className="bg-black/30 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground text-lg">Quem sabe, sabe.</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            {/*<img src="/42skillar.png" className="w-6 h-6 text-yellow-400" />*/}
            <span className="text-foreground font-semibold">{score} pts</span>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--md3-on-surface-variant)]">Questão {current + 1} de {questions.length}</span>
            <span className="text-[var(--md3-on-surface-variant)]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo da questão */}
      <div className="p-6 space-y-6">
        {/* Pergunta */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-lg text-foreground leading-relaxed">{questions[current].question}</p>
        </div>

        {/* Opções */}
        <div className="grid gap-3">
          {questions[current].options.map((opt, idx) => {
            const isSelected = answered === idx;
            const isCorrect = idx === questions[current].answer;
            const showFeedback = answered !== null;
            
            let buttonClass = "group relative p-4 rounded-lg border-2 transition-all duration-300 text-left ";
            
            if (showFeedback) {
              if (isSelected && isCorrect) {
                buttonClass += "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20";
              } else if (!isSelected && isCorrect) {
                buttonClass += "bg-green-500/10 border-green-500/50";
              } else {
                buttonClass += "bg-white/5 border-white/10 opacity-50";
              }
            } else {
              buttonClass += "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]";
            }

            return (
              <button
                key={idx}
                className={buttonClass}
                onClick={() => handleAnswer(idx)}
                disabled={answered !== null}
              >
                <div className="flex items-center gap-3">
                  {/* Label da opção */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                    showFeedback && isSelected && isCorrect ? 'bg-green-500 text-foreground' :
                    showFeedback && isSelected && !isCorrect ? 'bg-red-500 text-foreground' :
                    showFeedback && isCorrect ? 'bg-green-500/50 text-foreground' :
                    'bg-white/10 text-foreground group-hover:bg-white/20'
                  }`}>
                    {optionLabels[idx]}
                  </div>
                  
                  {/* Texto da opção */}
                  <span className="flex-1 text-foreground font-medium">{opt}</span>
                  
                  {/* Ícone de feedback */}
                  {showFeedback && isSelected && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400 animate-in zoom-in duration-300" weight="duotone" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 animate-in zoom-in duration-300" weight="duotone" />
                      )}
                    </div>
                  )}
                  {showFeedback && !isSelected && isCorrect && (
                    <CheckCircle className="w-6 h-6 text-green-400/50" weight="duotone" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered !== null && (
          <div className={`p-4 rounded-lg border-2 animate-in slide-in-from-bottom-2 duration-300 ${
            answered === questions[current].answer
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <div className="flex items-center gap-2">
              {answered === questions[current].answer ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" weight="duotone" />
                  <span className="text-green-300 font-semibold">Correto! +1 ponto</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">Incorreto! -1 ponto</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
