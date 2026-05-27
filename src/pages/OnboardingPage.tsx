import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Compass, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  aceTypeForPreferences,
  appPreferencesFromOnboarding,
  bonusTags,
  calculateACEType,
  defaultOnboardingPreferences,
  onboardingQuestions,
  preferencesForResult,
  saveOnboardingPreferences,
  type ACEBudgetPreference,
  type ACETypeResult,
  type ACEUserPreferences,
  type OnboardingAnswer
} from "../data/onboarding";
import { useAppStore } from "../store/appStore";

type OnboardingStep = "welcome" | "how" | "intro" | "question" | "bonus" | "analyzing" | "result";

const budgetOptions: ACEBudgetPreference[] = ["$", "$$", "$$$", "$$$$"];

const valueProps = ["Curated, not crowded", "Plans that fit your vibe", "Real experiences, real places"];

const howItWorks = [
  {
    title: "Answer honestly",
    body: "There are no right or wrong answers."
  },
  {
    title: "We learn your vibe",
    body: "ACE finds what fits you best."
  },
  {
    title: "Better recs every time",
    body: "The more you use ACE, the smarter it gets."
  }
];

const analyzingItems = ["Understanding your preferences", "Finding your vibe patterns", "Matching with your style", "Almost there..."];

const initialStepForPath = (pathname: string): OnboardingStep => {
  if (pathname.includes("/quiz")) return "intro";
  return "welcome";
};

function ScreenFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-ace-bg text-ace-text">
      <section className="relative isolate mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(47,128,255,0.24),_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(139,92,246,0.18),_transparent_30%),linear-gradient(180deg,#071126_0%,#050B1E_68%)] px-5 pb-7 pt-10 shadow-ace-glow">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/[0.04] to-transparent" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </section>
    </main>
  );
}

function Header({
  canGoBack,
  onBack,
  eyebrow,
  progress
}: {
  canGoBack?: boolean;
  onBack?: () => void;
  eyebrow?: string;
  progress?: number;
}) {
  return (
    <header>
      <div className="flex min-h-11 items-center justify-between">
        {canGoBack ? (
          <button type="button" onClick={onBack} aria-label="Go back" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-ace-text">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="size-11" />
        )}
        {eyebrow ? <p className="text-sm font-extrabold text-ace-cyan">{eyebrow}</p> : null}
        <div className="size-11" />
      </div>
      {typeof progress === "number" ? (
        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-ace-purple via-ace-blue to-ace-cyan shadow-[0_0_18px_rgba(32,214,210,0.34)]" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </header>
  );
}

function PrimaryButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-base font-extrabold text-white shadow-ace-glow transition disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}

function AnswerCard({ option, selected, onSelect, imageMode = false }: { option: OnboardingAnswer; selected: boolean; onSelect: () => void; imageMode?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        "group relative w-full overflow-hidden rounded-[24px] border text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-ace-cyan/70",
        selected ? "scale-[1.015] border-ace-cyan bg-ace-blue/20 shadow-[0_0_24px_rgba(56,189,248,0.32)]" : "border-white/10 bg-white/[0.065] hover:border-white/25"
      ].join(" ")}
    >
      {imageMode && option.image ? (
        <div className="relative h-32">
          <img src={option.image} alt={option.alt ?? option.label} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061126] via-[#061126]/30 to-transparent" />
        </div>
      ) : null}
      <span className="flex items-center gap-3 p-4">
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold leading-6 text-ace-text">{option.label}</span>
          <span className="mt-3 flex flex-wrap gap-2">
            {option.traits.slice(0, 3).map((trait) => (
              <span key={trait} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-ace-secondary">
                {trait.replaceAll("_", " ")}
              </span>
            ))}
          </span>
        </span>
        <span className={`grid size-8 shrink-0 place-items-center rounded-full border ${selected ? "border-ace-cyan bg-ace-cyan text-[#061126]" : "border-white/20 text-transparent"}`}>
          <Check size={18} />
        </span>
      </span>
      {selected ? <span className="sr-only">Selected</span> : null}
    </button>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setAceProfile = useAppStore((state) => state.setAceProfile);
  const [step, setStep] = useState<OnboardingStep>(() => initialStepForPath(location.pathname));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedBonusTags, setSelectedBonusTags] = useState<string[]>([]);
  const [budget, setBudget] = useState<ACEBudgetPreference>("$$");
  const [aceResult, setAceResult] = useState<ACETypeResult | null>(null);

  const question = onboardingQuestions[questionIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const quizProgress = useMemo(() => ((questionIndex + 1) / onboardingQuestions.length) * 100, [questionIndex]);

  useEffect(() => {
    if (step !== "analyzing" || !aceResult) return undefined;
    const timer = window.setTimeout(() => setStep("result"), 1700);
    return () => window.clearTimeout(timer);
  }, [aceResult, step]);

  const saveAndGoHome = (preferences: ACEUserPreferences) => {
    saveOnboardingPreferences(preferences);
    setAceProfile(aceTypeForPreferences(preferences), appPreferencesFromOnboarding(user.preferences, preferences));
    navigate("/home", { replace: true });
  };

  const skipOnboarding = () => {
    saveAndGoHome(defaultOnboardingPreferences);
  };

  const completeFromResult = () => {
    if (!aceResult) return;
    saveAndGoHome(preferencesForResult(aceResult, selectedBonusTags, budget));
  };

  const goBack = () => {
    if (step === "how") setStep("welcome");
    if (step === "intro") setStep("how");
    if (step === "question") {
      if (questionIndex > 0) setQuestionIndex((current) => current - 1);
      else setStep("intro");
    }
    if (step === "bonus") setStep("question");
    if (step === "result") setStep("bonus");
  };

  const nextQuestion = () => {
    if (!selectedAnswer) return;
    if (questionIndex === onboardingQuestions.length - 1) {
      setStep("bonus");
      return;
    }
    setQuestionIndex((current) => current + 1);
  };

  const analyzeAnswers = () => {
    const result = calculateACEType(answers, selectedBonusTags, budget);
    setAceResult(result);
    setStep("analyzing");
  };

  const toggleBonusTag = (tag: string) => {
    setSelectedBonusTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  if (step === "welcome") {
    return (
      <ScreenFrame>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-3 text-ace-cyan">
              <Compass size={36} />
              <span className="bg-gradient-to-r from-[#83C9FF] via-[#6DB9FF] to-[#20D6D2] bg-clip-text text-6xl font-black leading-none tracking-normal text-transparent">ACE</span>
            </div>
            <h1 className="mt-8 text-[38px] font-black leading-[1.03] tracking-normal">Find things worth doing, made for you.</h1>
            <p className="mt-5 text-base font-semibold leading-7 text-ace-secondary">
              ACE learns what you love so it can find places, plans, and experiences that actually fit your life.
            </p>
          </div>

          <div className="my-7 space-y-3">
            {valueProps.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur">
                <CheckCircle2 className="text-ace-cyan" size={22} />
                <span className="font-extrabold">{item}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <PrimaryButton onClick={() => setStep("how")}>
              Start the quiz
              <Sparkles size={18} />
            </PrimaryButton>
            <button type="button" onClick={skipOnboarding} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.06] px-5 text-base font-extrabold text-ace-text">
              Skip for now
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </ScreenFrame>
    );
  }

  if (step === "how") {
    return (
      <ScreenFrame>
        <Header canGoBack onBack={goBack} />
        <div className="mt-7">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-ace-cyan">Quick and personal</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">How it works</h1>
          <p className="mt-4 text-base font-semibold leading-7 text-ace-secondary">
            We'll ask a few quick questions to understand your vibe, preferences, and what makes an experience worth it for you.
          </p>
        </div>

        <div className="mt-8 flex-1 space-y-4">
          {howItWorks.map((item, index) => (
            <section key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-ace-blue/20 text-sm font-black text-ace-cyan">{index + 1}</span>
                <div>
                  <h2 className="text-lg font-extrabold">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-ace-secondary">{item.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <PrimaryButton onClick={() => setStep("intro")}>
          Let's go
          <ChevronRight size={19} />
        </PrimaryButton>
      </ScreenFrame>
    );
  }

  if (step === "intro") {
    return (
      <ScreenFrame>
        <Header canGoBack onBack={goBack} />
        <div className="flex flex-1 flex-col justify-center">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.07] p-6 shadow-ace-glow backdrop-blur">
            <div className="grid size-16 place-items-center rounded-[24px] bg-gradient-to-br from-ace-purple to-ace-cyan text-white">
              <Sparkles size={30} />
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight">Let's get to know you</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-ace-secondary">
              This helps ACE give you personalized places, plans, and experiences you'll love.
            </p>
          </div>
        </div>
        <PrimaryButton onClick={() => setStep("question")}>
          Next
          <ArrowRight size={18} />
        </PrimaryButton>
      </ScreenFrame>
    );
  }

  if (step === "question" && question) {
    return (
      <ScreenFrame>
        <Header canGoBack onBack={goBack} eyebrow={`${questionIndex + 1} of ${onboardingQuestions.length}`} progress={quizProgress} />
        <div className="mt-7">
          <h1 className="text-[30px] font-black leading-tight">{question.question}</h1>
        </div>
        <div className={`mt-6 flex-1 overflow-y-auto pb-4 ${question.imageCards ? "grid content-start grid-cols-2 gap-3" : "space-y-3"}`}>
          {question.options.map((option) => (
            <AnswerCard
              key={option.id}
              option={option}
              selected={selectedAnswer === option.id}
              onSelect={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
              imageMode={question.imageCards}
            />
          ))}
        </div>
        <PrimaryButton disabled={!selectedAnswer} onClick={nextQuestion}>
          Next
          <ArrowRight size={18} />
        </PrimaryButton>
      </ScreenFrame>
    );
  }

  if (step === "bonus") {
    return (
      <ScreenFrame>
        <Header canGoBack onBack={goBack} eyebrow="Optional" progress={100} />
        <div className="mt-7">
          <h1 className="text-[32px] font-black leading-tight">Anything else we should know?</h1>
          <p className="mt-2 text-base font-semibold text-ace-secondary">Select all that apply.</p>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto pb-4">
          <div className="flex flex-wrap gap-2">
            {bonusTags.map((tag) => {
              const selected = selectedBonusTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  aria-pressed={selected}
                  onClick={() => toggleBonusTag(tag)}
                  className={`rounded-full border px-3 py-2 text-sm font-extrabold transition ${selected ? "border-ace-cyan bg-ace-blue/25 text-ace-text shadow-[0_0_18px_rgba(56,189,248,0.2)]" : "border-white/10 bg-white/[0.06] text-ace-secondary"}`}
                >
                  {selected ? <Check size={14} className="mr-1 inline" /> : null}
                  {tag}
                </button>
              );
            })}
          </div>

          <section className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.07] p-5">
            <h2 className="text-lg font-extrabold">Your budget vibe</h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {budgetOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  aria-pressed={budget === option}
                  onClick={() => setBudget(option)}
                  className={`min-h-12 rounded-2xl border text-base font-black ${budget === option ? "border-ace-cyan bg-ace-blue/25 text-ace-text" : "border-white/10 bg-white/[0.06] text-ace-secondary"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>

        <PrimaryButton onClick={analyzeAnswers}>
          Next
          <ArrowRight size={18} />
        </PrimaryButton>
      </ScreenFrame>
    );
  }

  if (step === "analyzing") {
    return (
      <ScreenFrame>
        <div className="flex flex-1 flex-col justify-center">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.07] p-6 text-center shadow-ace-glow backdrop-blur">
            <div className="mx-auto grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-ace-purple to-ace-cyan text-white shadow-[0_0_36px_rgba(56,189,248,0.34)]">
              <Sparkles className="animate-pulse" size={36} />
            </div>
            <h1 className="mt-7 text-3xl font-black">Analyzing your vibe</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-ace-secondary">
              Hang tight while we create your ACE Type and tailor your recommendations.
            </p>
            <div className="mt-7 space-y-3 text-left">
              {analyzingItems.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ace-cyan/20 text-ace-cyan">
                    <Check size={16} />
                  </span>
                  <span className={`text-sm font-extrabold ${index === analyzingItems.length - 1 ? "animate-pulse text-ace-text" : "text-ace-secondary"}`}>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScreenFrame>
    );
  }

  const result = aceResult;

  return (
    <ScreenFrame>
      <Header canGoBack onBack={goBack} eyebrow="Your ACE Type" />
      <div className="mt-6 flex-1 overflow-y-auto pb-5">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.075] p-6 shadow-ace-glow backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-ace-cyan">Your ACE Type</p>
            <Sparkles className="text-ace-warning" size={22} />
          </div>
          <div className="mt-6 rounded-[28px] border border-ace-cyan/25 bg-gradient-to-br from-ace-purple/25 via-ace-blue/20 to-ace-cyan/15 p-5">
            <h1 className="text-[32px] font-black leading-tight">{result?.name ?? "The Open Explorer"}</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-ace-secondary">
              {result?.description ?? defaultOnboardingPreferences.aceTypeDescription}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(result?.topTraits ?? defaultOnboardingPreferences.topTraits).map((trait) => (
              <span key={trait} className="rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold text-ace-secondary">
                {trait}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-lg font-extrabold">How ACE will recommend</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-ace-secondary">
            {result?.recommendationStyle ?? "ACE will prioritize flexible places and plans that fit your moment."}
          </p>
        </section>

        <p className="mt-5 text-center text-sm font-semibold text-ace-secondary">You can retake this anytime from your profile.</p>
      </div>

      <PrimaryButton onClick={completeFromResult}>
        Start exploring
        <ArrowRight size={18} />
      </PrimaryButton>
    </ScreenFrame>
  );
}
