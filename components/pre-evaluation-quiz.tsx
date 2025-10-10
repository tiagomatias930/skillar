import { useState } from "react";

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
    }, 800);
  }

  if (finished) {
    return <div className="text-center">Pré-avaliação concluída! Pontuação: <b>{score}</b></div>;
  }

  return (
    <div className="mb-6 p-4 border rounded bg-white/80">
      <h2 className="font-semibold mb-2">Pré-avaliação: Questão {current + 1} de {questions.length}</h2>
      <div className="mb-4">{questions[current].question}</div>
      <div className="flex flex-col gap-2">
        {questions[current].options.map((opt, idx) => (
          <button
            key={idx}
            className={`p-2 rounded border ${answered === idx ? (idx === questions[current].answer ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => handleAnswer(idx)}
            disabled={answered !== null}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered !== null && (
        <div className="mt-2 text-sm text-gray-700">
          {answered === questions[current].answer ? 'Correto!' : 'Errado!'}
        </div>
      )}
    </div>
  );
}
