import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Banknote,
  CalendarDays,
  Clock3,
  Compass,
  Map,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Share,
  Shuffle,
  Sparkles,
  TimerReset,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlaceImage } from "../components/places/PlaceImage";
import { PlacePickerSheet } from "../components/sheets/PlacePickerSheet";
import { useAppStore } from "../store/appStore";

const timelineColors = ["bg-ace-purple", "bg-ace-cyan", "bg-ace-success", "bg-[#C8E6A0]", "bg-ace-purple", "bg-ace-blue"];

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatCategory(category: string) {
  return category.replaceAll(" - ", " - ");
}

export function PlanDetailPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [tab, setTab] = useState<"itinerary" | "map" | "details">("itinerary");
  const [showBackup, setShowBackup] = useState(false);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [replacingStopId, setReplacingStopId] = useState<string | undefined>();
  const [dateInput, setDateInput] = useState("");
  const [startInput, setStartInput] = useState("");
  const plan = useAppStore((state) => state.plans.find((item) => item.id === planId));
  const places = useAppStore((state) => state.places);
  const addStop = useAppStore((state) => state.addStop);
  const removeStop = useAppStore((state) => state.removeStop);
  const replaceStop = useAppStore((state) => state.replaceStop);
  const reorderStops = useAppStore((state) => state.reorderStops);
  const makePlanCheaper = useAppStore((state) => state.makePlanCheaper);
  const makePlanShorter = useAppStore((state) => state.makePlanShorter);
  const makePlanMoreLocal = useAppStore((state) => state.makePlanMoreLocal);
  const makePlanMoreAdventurous = useAppStore((state) => state.makePlanMoreAdventurous);
  const makePlanMoreRelaxed = useAppStore((state) => state.makePlanMoreRelaxed);
  const updatePlanSchedule = useAppStore((state) => state.updatePlanSchedule);
  const showToast = useAppStore((state) => state.showToast);

  if (!plan) {
    return (
      <section className="h-screen overflow-y-auto px-6 py-12">
        <button type="button" onClick={() => navigate(-1)} className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]" aria-label="Go back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="mt-6 text-2xl font-bold">Plan not found</h1>
      </section>
    );
  }

  const stops = showBackup ? plan.backupStops : plan.stops;
  const usedPlaceIds = plan.stops.map((stop) => stop.placeId);
  const stopPlaces = stops.map((stop) => places.find((item) => item.id === stop.placeId)).filter((place): place is (typeof places)[number] => Boolean(place));
  const totalCost = `$${plan.estimatedCostMin}-$${plan.estimatedCostMax}`;
  const totalTime = formatDuration(plan.estimatedDurationMinutes);

  const moveStop = (stopId: string, direction: "up" | "down") => {
    const currentIds = plan.stops.map((stop) => stop.id);
    const index = currentIds.indexOf(stopId);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentIds.length) return;
    const nextIds = [...currentIds];
    [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
    reorderStops(plan.id, nextIds);
  };

  const saveSchedule = () => {
    updatePlanSchedule(plan.id, dateInput.trim() || plan.dateLabel, startInput.trim() || plan.startTime);
    showToast("Schedule updated");
  };

  const renderStopControls = (stopId: string, placeName: string) => {
    if (showBackup) return null;
    return (
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {places.length > usedPlaceIds.length ? (
          <button type="button" aria-label={`Replace ${placeName}`} onClick={() => setReplacingStopId(stopId)} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-ace-secondary">
            <Shuffle size={16} />
          </button>
        ) : null}
        <button type="button" aria-label={`Move ${placeName} earlier`} onClick={() => moveStop(stopId, "up")} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-ace-secondary">
          <ArrowUp size={16} />
        </button>
        <button type="button" aria-label={`Move ${placeName} later`} onClick={() => moveStop(stopId, "down")} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-ace-secondary">
          <ArrowDown size={16} />
        </button>
        <button type="button" aria-label={`Remove ${placeName}`} onClick={() => removeStop(plan.id, stopId)} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-ace-danger">
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  const renderItinerary = () => (
    <div className="relative mt-6 pl-7">
      <div className="absolute bottom-9 left-[11px] top-7 w-px bg-gradient-to-b from-ace-purple via-ace-cyan via-60% to-ace-purple/60" />
      <div className="space-y-4">
        {stops.map((stop, index) => {
          const place = places.find((item) => item.id === stop.placeId);
          if (!place) return null;
          return (
            <article key={stop.id} className="relative flex gap-3">
              <span className={`absolute -left-[24px] top-4 size-4 rounded-full border-2 border-[#071126] ${timelineColors[index % timelineColors.length]} shadow-[0_0_0_4px_rgba(255,255,255,0.06)]`} />
              <div className="w-[62px] shrink-0 pt-2 text-sm font-extrabold text-ace-text">{stop.time}</div>
              <div className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-white/[0.055] p-3 shadow-[0_14px_34px_rgba(5,11,30,0.22)]">
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-[15px] font-extrabold leading-5">{place.name}</h2>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-ace-secondary">{formatCategory(place.category)}</p>
                    <p className="mt-2 text-sm font-bold text-ace-secondary">
                      {formatDuration(stop.durationMinutes)}
                      <span className="px-1">-</span>
                      {(stop.distanceFromPreviousMiles ?? 0).toFixed(1)} mi
                      <span className="px-1">-</span>
                      {place.priceRange}
                    </p>
                  </div>
                  <PlaceImage place={place} wrapperClassName="block h-[76px] w-[92px] shrink-0 overflow-hidden rounded-xl" imageClassName="size-full object-cover" maxWidthPx={500} />
                </div>
                {renderStopControls(stop.id, place.name)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  const renderMap = () => (
    <section className="mt-6 rounded-[20px] border border-white/10 bg-white/[0.06] p-4">
      <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(32,214,210,0.24),transparent_28%),radial-gradient(circle_at_80%_55%,rgba(139,92,246,0.28),transparent_30%),#08122A] p-5">
        <div className="absolute inset-x-8 top-1/2 h-1 rounded-full bg-gradient-to-r from-ace-purple via-ace-cyan to-ace-blue" />
        <div className="relative flex min-h-44 items-center justify-between">
          {stopPlaces.slice(0, 5).map((place, index) => (
            <div key={place.id} className="flex flex-col items-center gap-2">
              <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-ace-strong text-sm font-black text-ace-cyan">{index + 1}</span>
              <span className="max-w-16 truncate text-xs font-bold">{place.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {stops.map((stop, index) => {
          const place = places.find((item) => item.id === stop.placeId);
          if (!place) return null;
          return (
            <div key={stop.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
              <MapPin className="text-ace-cyan" size={18} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {index + 1}. {place.name}
                </p>
                <p className="text-xs font-semibold text-ace-secondary">{(stop.distanceFromPreviousMiles ?? 0).toFixed(1)} mi from previous</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderDetails = () => (
    <section className="mt-6 space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveSchedule();
        }}
        className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5"
      >
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CalendarDays className="text-ace-purple" size={20} />
          Schedule
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-ace-secondary">Date</span>
            <input value={dateInput || plan.dateLabel} onChange={(event) => setDateInput(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-sm font-bold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-ace-secondary">Start time</span>
            <input value={startInput || plan.startTime} onChange={(event) => setStartInput(event.target.value)} placeholder="6:00 PM" className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-sm font-bold outline-none" />
          </label>
        </div>
        <button type="submit" className="mt-4 min-h-12 w-full rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan text-sm font-bold text-white">
          Update Schedule
        </button>
      </form>

      <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Compass className="text-ace-cyan" size={20} />
          Plan details
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/[0.05] p-3">
            <p className="font-bold text-ace-secondary">People</p>
            <p className="mt-1 font-bold capitalize">{plan.peopleContext ?? "Flexible"}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.05] p-3">
            <p className="font-bold text-ace-secondary">Location</p>
            <p className="mt-1 font-bold">{plan.locationLabel}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.05] p-3">
            <p className="font-bold text-ace-secondary">Source</p>
            <p className="mt-1 font-bold capitalize">{plan.sourceType.replace("_", " ")}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.05] p-3">
            <p className="font-bold text-ace-secondary">Backups</p>
            <p className="mt-1 font-bold">{plan.backupStops.length} stops</p>
          </div>
        </div>
      </section>
    </section>
  );

  return (
    <section className="h-screen overflow-y-auto px-5 pb-28 pt-12">
      <header className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid size-10 shrink-0 place-items-center rounded-full text-ace-text">
          <ArrowLeft size={25} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-xl font-extrabold">{plan.name}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setTab("details")} aria-label="Edit plan" className="grid size-10 place-items-center rounded-full text-ace-text">
            <Pencil size={21} />
          </button>
          <button type="button" onClick={() => showToast("Share link copied")} aria-label="Share plan" className="grid size-10 place-items-center rounded-full text-ace-text">
            <Share size={21} />
          </button>
          <button type="button" onClick={() => showToast("More plan options coming soon")} aria-label="More plan options" className="grid size-10 place-items-center rounded-full text-ace-text">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-3 rounded-[14px] border border-white/10 bg-white/[0.055] p-1 text-sm font-extrabold shadow-[0_12px_30px_rgba(5,11,30,0.22)]">
        {(["itinerary", "map", "details"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-10 rounded-xl capitalize transition ${tab === item ? "bg-[#234073] text-ace-text shadow-[inset_0_-2px_0_rgba(127,204,255,0.75)]" : "text-ace-secondary"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <div className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-sm font-extrabold text-ace-secondary">
          <Compass size={16} />
          {plan.stops.length} stops
        </div>
        <div className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-sm font-extrabold text-ace-secondary">
          <Clock3 size={16} />
          {totalTime}
        </div>
        <div className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-sm font-extrabold text-ace-secondary">
          <Banknote size={16} />
          {totalCost}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setShowBackup(false)} className={`min-h-10 rounded-2xl text-sm font-bold ${!showBackup ? "bg-ace-purple text-white" : "border border-white/10 bg-white/[0.05]"}`}>
          Plan A
        </button>
        <button type="button" onClick={() => setShowBackup(true)} className={`min-h-10 rounded-2xl text-sm font-bold ${showBackup ? "bg-ace-purple text-white" : "border border-white/10 bg-white/[0.05]"}`}>
          Backup
        </button>
      </div>

      {tab === "map" ? renderMap() : tab === "details" ? renderDetails() : renderItinerary()}

      {tab === "itinerary" ? (
        <>
          <section className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.045] p-4">
            <div className="grid grid-cols-[1fr_1fr_1.45fr] gap-3">
              <div>
                <p className="text-xs font-bold text-ace-secondary">Est. total</p>
                <p className="mt-1 text-xl font-extrabold">{totalCost}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ace-secondary">Est. time</p>
                <p className="mt-1 text-xl font-extrabold">{totalTime}</p>
              </div>
              <button type="button" onClick={() => setTab("map")} className="min-h-14 rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan px-4 text-base font-extrabold text-white shadow-ace-glow">
                View Route
              </button>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setTab("details")} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold">
              <Pencil size={16} />
              Edit Plan
            </button>
            <button type="button" onClick={() => setAddStopOpen(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold">
              <Plus size={16} />
              Add Stop
            </button>
            <button type="button" onClick={() => showToast("Share link copied")} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold">
              <Share size={16} />
              Share
            </button>
          </div>
        </>
      ) : null}

      <section className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="font-bold">Why this plan works</h2>
        <p className="mt-2 text-sm leading-6 text-ace-secondary">{plan.explanation}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-extrabold">Fine tune</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => makePlanCheaper(plan.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold">
            <Banknote size={16} />
            Cheaper
          </button>
          <button type="button" onClick={() => makePlanShorter(plan.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold">
            <TimerReset size={16} />
            Shorter
          </button>
          <button type="button" onClick={() => makePlanMoreLocal(plan.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold">
            <MapPin size={16} />
            More Local
          </button>
          <button type="button" onClick={() => makePlanMoreAdventurous(plan.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold">
            <Sparkles size={16} />
            Adventurous
          </button>
          <button type="button" onClick={() => makePlanMoreRelaxed(plan.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold">
            <Map size={16} />
            Relaxed
          </button>
          <button type="button" onClick={() => setTab("map")} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan text-sm font-bold text-white">
            <Route size={16} />
            Route
          </button>
        </div>
      </section>

      <PlacePickerSheet
        open={addStopOpen}
        title="Add stop"
        places={places}
        excludePlaceIds={usedPlaceIds}
        emptyLabel="All available places are already in this plan."
        onSelect={(placeId) => addStop(plan.id, placeId)}
        onClose={() => setAddStopOpen(false)}
      />
      <PlacePickerSheet
        open={Boolean(replacingStopId)}
        title="Replace stop"
        places={places}
        excludePlaceIds={usedPlaceIds}
        emptyLabel="No replacement places are available."
        onSelect={(placeId) => {
          if (replacingStopId) replaceStop(plan.id, replacingStopId, placeId);
        }}
        onClose={() => setReplacingStopId(undefined)}
      />
    </section>
  );
}
