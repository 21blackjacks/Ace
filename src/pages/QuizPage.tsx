import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aceTypes } from "../data/aceTypes";
import { quizQuestions, scoreQuizAnswers } from "../data/quiz";
import { useAppStore } from "../store/appStore";

export function QuizPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const setAceProfile = useAppStore((state) => state.setAceProfile);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const question = quizQuestions[step];
  const selectedAnswer = answers[question.id];
  const isLastStep = step === quizQuestions.length - 1;
  const progress = useMemo(() => ((step + 1) / quizQuestions.length) * 100, [step]);

  const finishQuiz = () => {
    const answerIds = quizQuestions.map((item) => answers[item.id]).filter((answerId): answerId is string => Boolean(answerId));
    const result = scoreQuizAnswers(answerIds, aceTypes, user.preferences);
    setAceProfile(result.aceType, result.preferences);
    navigate("/onboarding/result");
  };

  const goNext = () => {
    if (!selectedAnswer) return;
    if (isLastStep) {
      finishQuiz();
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-ace-bg text-ace-text">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => (step === 0 ? navigate("/onboarding") : setStep((current) => current - 1))}
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]"
          >
            <ArrowLeft size={22} />
          </button>
          <Link to="/home" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-ace-secondary">
            Skip
          </Link>
        </header>

        <div className="mt-8 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-ace-purple to-ace-cyan" style={{ width: `${progress}%` }} />
        </div>

        <p className="mt-6 text-sm font-semibold text-ace-cyan">
          {step + 1} of {quizQuestions.length}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">{question.prompt}</h1>

        <div className="mt-7 flex flex-1 flex-col gap-3">
          {question.options.map((option) => {
            const selected = selectedAnswer === option.id;
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                className={[
                  "rounded-[24px] border p-4 text-left transition",
                  selected
                    ? "border-ace-cyan bg-ace-blue/20 shadow-ace-glow"
                    : "border-white/10 bg-white/[0.06] hover:border-white/25"
                ].join(" ")}
              >
                <span className="block text-base font-bold leading-6">{option.label}</span>
                <span className="mt-3 flex flex-wrap gap-2">
                  {option.signals.map((signal) => (
                    <span key={signal} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-ace-secondary">
                      {signal}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!selectedAnswer}
          className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-base font-bold text-white shadow-ace-glow disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isLastStep ? "Reveal My ACE Type" : "Next"}
          <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}
