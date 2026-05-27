import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PlanSetupSheet } from "../components/sheets/PlanSetupSheet";
import { useAppStore } from "../store/appStore";

export function PlansPage() {
  const [planOpen, setPlanOpen] = useState(false);
  const plans = useAppStore((state) => state.plans);
  const groups = [
    ["Upcoming Plans", plans.filter((plan) => plan.status === "upcoming")],
    ["Draft Plans", plans.filter((plan) => plan.status === "draft")],
    ["Past Plans", plans.filter((plan) => plan.status === "past")]
  ] as const;

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plans</h1>
        <button type="button" onClick={() => setPlanOpen(true)} aria-label="Create plan" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
          <Plus size={24} />
        </button>
      </header>

      <div className="mt-8 space-y-8">
        {groups.map(([label, items]) => (
          <section key={label}>
            <h2 className="text-xl font-bold">{label}</h2>
            <div className="mt-4 space-y-4">
              {items.length ? (
                items.map((plan) => (
                  <Link key={plan.id} to={`/plans/${plan.id}`} className="block rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-ace-secondary">{plan.dateLabel}</p>
                        <p className="mt-2 text-sm font-bold text-ace-secondary">
                          {plan.stops.length} stops - {Math.round(plan.estimatedDurationMinutes / 60)}h - ${plan.estimatedCostMin}-${plan.estimatedCostMax}
                        </p>
                      </div>
                      <MoreHorizontal className="text-ace-secondary" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-ace-secondary">No plans here yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <PlanSetupSheet
        open={planOpen}
        sourceType="search"
        query="plan a saturday afternoon with friends in Savannah"
        defaultPeopleContext="friends"
        onClose={() => setPlanOpen(false)}
      />
    </section>
  );
}
