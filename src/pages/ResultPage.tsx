import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AceTypeCard } from "../components/ace/AceTypeCard";
import { defaultAceType } from "../data/aceTypes";
import { useAppStore } from "../store/appStore";

export function ResultPage() {
  const aceType = useAppStore((state) => state.user.aceType) ?? defaultAceType;

  return (
    <main className="min-h-screen bg-ace-bg text-ace-text">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <Link to="/onboarding/quiz" aria-label="Back to quiz" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            My ACE Type
            <Sparkles className="text-ace-warning" size={18} />
          </div>
          <div className="size-11" />
        </header>

        <AceTypeCard aceType={aceType} />

        <section className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-bold">ACE will prioritize</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {aceType.recommendationPriorities.map((priority) => (
              <span key={priority} className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-ace-secondary">
                {priority}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-auto space-y-3">
          <Link
            to="/home"
            className="flex min-h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-base font-bold text-white shadow-ace-glow"
          >
            Start Exploring
          </Link>
          <Link
            to="/onboarding/quiz"
            className="flex min-h-14 items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.06] px-5 text-base font-bold text-ace-text"
          >
            <RotateCcw size={18} />
            Retake quiz
          </Link>
        </div>
      </section>
    </main>
  );
}
