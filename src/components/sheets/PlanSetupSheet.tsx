import { CalendarDays, Clock, Users, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import type { PlanDepth, PlanSourceType, PlanWhen } from "../../types/domain";

type PlanSetupSheetProps = {
  open: boolean;
  sourceType: PlanSourceType;
  sourceId?: string;
  selectedPlaceIds?: string[];
  query?: string;
  defaultPeopleContext?: string;
  onClose: () => void;
};

const whenOptions: Array<{ value: PlanWhen; label: string }> = [
  { value: "tonight", label: "Tonight" },
  { value: "this_weekend", label: "This weekend" },
  { value: "custom", label: "Pick a date" }
];

const depthOptions: Array<{ value: PlanDepth; label: string }> = [
  { value: "just_this_place", label: "Just this place" },
  { value: "nearby_stops", label: "Add nearby stops" },
  { value: "full_route", label: "Build a full route" }
];

const peopleOptions = ["friends", "partner", "family", "solo", "visitors"];

export function PlanSetupSheet({ open, sourceType, sourceId, selectedPlaceIds, query, defaultPeopleContext = "friends", onClose }: PlanSetupSheetProps) {
  const navigate = useNavigate();
  const generatePlan = useAppStore((state) => state.generatePlan);
  const [when, setWhen] = useState<PlanWhen>("tonight");
  const [planDepth, setPlanDepth] = useState<PlanDepth>("nearby_stops");
  const [peopleContext, setPeopleContext] = useState(defaultPeopleContext);
  const [customDate, setCustomDate] = useState("");

  if (!open) return null;

  const buildPlan = () => {
    const plan = generatePlan({
      sourceType,
      sourceId,
      selectedPlaceIds,
      query,
      when,
      customDate: when === "custom" ? customDate || "Custom date" : undefined,
      planDepth,
      peopleContext
    });
    onClose();
    navigate(`/plans/${plan.id}`);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#08122A]/95 p-5 text-ace-text shadow-ace-glow backdrop-blur-xl">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Build plan</h2>
          <p className="mt-1 text-sm text-ace-secondary">A few choices, then ACE makes an editable itinerary.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close plan setup" className="grid size-10 place-items-center rounded-full bg-white/10">
          <X size={20} />
        </button>
      </header>

      <section className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ace-secondary">
          <CalendarDays size={17} />
          When?
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {whenOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setWhen(option.value)}
              className={`min-h-11 rounded-2xl border px-2 text-sm font-bold ${when === option.value ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {when === "custom" ? (
          <input
            value={customDate}
            onChange={(event) => setCustomDate(event.target.value)}
            placeholder="Sat, May 24"
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none placeholder:text-ace-secondary"
          />
        ) : null}
      </section>

      <section className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ace-secondary">
          <Clock size={17} />
          How much of a plan?
        </h3>
        <div className="mt-3 space-y-2">
          {depthOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setPlanDepth(option.value)}
              className={`min-h-11 w-full rounded-2xl border px-4 text-left text-sm font-bold ${planDepth === option.value ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ace-secondary">
          <Users size={17} />
          Who?
        </h3>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {peopleOptions.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setPeopleContext(option)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold capitalize ${peopleContext === option ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <button type="button" onClick={buildPlan} className="mt-6 min-h-14 w-full rounded-3xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-base font-bold text-white shadow-ace-glow">
        Generate Plan
      </button>
    </div>
  );
}
