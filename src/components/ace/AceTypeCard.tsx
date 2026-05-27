import { Sparkles } from "lucide-react";
import type { AceType } from "../../types/domain";

type AceTypeCardProps = {
  aceType: AceType;
};

export function AceTypeCard({ aceType }: AceTypeCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-ace-glow backdrop-blur">
      <div className="text-center">
        <p className="text-sm font-semibold text-ace-secondary">Your ACE Type</p>
        <h2 className="mt-2 text-2xl font-bold text-ace-text">{aceType.name}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ace-secondary">{aceType.description}</p>
      </div>

      <div className="relative mx-auto mt-7 grid aspect-square max-w-[280px] place-items-center rounded-full border border-ace-blue/25 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.36),_rgba(47,128,255,0.08)_38%,_transparent_68%)]">
        <div className="grid size-24 place-items-center rounded-full border border-white/15 bg-ace-strong/80 text-ace-cyan shadow-ace-glow">
          <Sparkles size={34} />
        </div>
        {aceType.traits.slice(0, 5).map((trait, index) => {
          const positions = [
            "left-1/2 top-1 -translate-x-1/2",
            "right-0 top-1/4",
            "bottom-4 right-8",
            "bottom-4 left-8",
            "left-0 top-1/4"
          ];

          return (
            <div key={trait} className={`absolute ${positions[index]} flex flex-col items-center gap-2 text-center`}>
              <span className="grid size-10 place-items-center rounded-full border border-white/10 bg-ace-blue/30 text-xs font-bold text-ace-text">
                {index + 1}
              </span>
              <span className="max-w-20 text-xs font-semibold text-ace-secondary">{trait}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
