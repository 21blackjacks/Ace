import { ArrowLeft, Heart, Search, SlidersHorizontal } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlaceImage } from "../components/places/PlaceImage";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useAppStore } from "../store/appStore";
import type { RankedPlace } from "../types/domain";
import { interpretSearchQuery, rankPlaces } from "../utils/search";

const filters = ["All", "Tonight", "Within 10 mi", "$", "$$", "$$$", "Open now"];

function applyFilter(ranked: RankedPlace[], filter: string) {
  if (filter === "All") return ranked;
  if (filter === "Tonight") {
    return ranked.filter(({ place }) => {
      const eveningFriendly = place.goodFor.some((tag) => ["friends", "date", "groups", "visitors"].includes(tag)) || place.vibeTags.some((tag) => ["social", "cocktails", "active", "fun", "great food"].includes(tag));
      return place.openStatus === "open" && eveningFriendly;
    });
  }
  if (filter === "Open now") return ranked.filter(({ place }) => place.openStatus === "open");
  if (filter === "Within 10 mi") return ranked.filter(({ place }) => place.distanceMiles <= 10);
  if (["$", "$$", "$$$"].includes(filter)) return ranked.filter(({ place }) => place.priceRange === filter);
  return ranked;
}

function openLabel(openStatus: RankedPlace["place"]["openStatus"]) {
  if (openStatus === "open") return "Open";
  if (openStatus === "opening_soon") return "Soon";
  return "Closed";
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppStore((state) => state.user);
  const places = useAppStore((state) => state.places);
  const savePlace = useAppStore((state) => state.savePlace);
  const requestedQuery = searchParams.get("q");
  const recommendationsMode = searchParams.get("mode") === "recommendations" || !requestedQuery;
  const activeQuery = requestedQuery ?? "best local places near me";
  const [queryDraft, setQueryDraft] = useState({ source: activeQuery, value: activeQuery });
  const query = queryDraft.source === activeQuery ? queryDraft.value : activeQuery;
  const [selectedFilter, setSelectedFilter] = useState("All");
  const liveResults = useGooglePlaces(activeQuery, 12);

  const interpreted = useMemo(() => interpretSearchQuery(activeQuery, user), [activeQuery, user]);
  const curatedPlaces = useMemo(() => places.filter((place) => place.source !== "google_places"), [places]);
  const ranked = useMemo(() => {
    const searchablePlaces = liveResults.isLive ? liveResults.places : liveResults.isLoading ? [] : curatedPlaces;
    return applyFilter(rankPlaces(searchablePlaces, interpreted, user), selectedFilter);
  }, [curatedPlaces, interpreted, liveResults.isLive, liveResults.isLoading, liveResults.places, selectedFilter, user]);

  const runSearch = () => {
    const nextQuery = query.trim() || "something to do nearby";
    setSearchParams({ q: nextQuery });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    runSearch();
  };

  const tonightIsContext = interpreted.timeContext === "tonight";

  return (
    <section className="min-h-screen px-6 pb-24 pt-[58px]">
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ace-text"
        >
          <ArrowLeft size={27} />
        </button>
        <form onSubmit={submitSearch} className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="search-query">
            Search
          </label>
          <div className="flex min-h-[54px] items-center gap-3 rounded-[23px] border border-white/10 bg-white/[0.08] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Search className="shrink-0 text-ace-secondary" size={22} />
            <input
              id="search-query"
              value={query}
              onChange={(event) => setQueryDraft({ source: activeQuery, value: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  runSearch();
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ace-text outline-none placeholder:text-ace-secondary"
            />
          </div>
        </form>
        <button type="button" aria-label="Open filters" className="grid size-10 shrink-0 place-items-center rounded-full text-ace-text">
          <SlidersHorizontal size={26} />
        </button>
      </header>

      <div className="-mx-6 mt-5 flex gap-2.5 overflow-x-auto border-b border-white/5 px-6 pb-5">
        {filters.map((filter) => {
          const selected = selectedFilter === filter;
          const contextSelected = filter === "Tonight" && tonightIsContext && selectedFilter === "All";
          return (
            <button
              type="button"
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={[
                "min-h-[42px] shrink-0 rounded-full border px-4 text-sm font-bold transition",
                selected && filter === "All"
                  ? "border-[#705BFF]/35 bg-[#5147B4]/60 text-ace-text shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                  : selected || contextSelected
                    ? "border-[#5EA8FF]/35 bg-[#2D64BF]/55 text-ace-text shadow-[0_0_14px_rgba(47,128,255,0.18)]"
                    : "border-white/10 bg-white/[0.06] text-ace-secondary"
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <section className="mt-5">
        <h1 className="text-[24px] font-extrabold leading-tight">{recommendationsMode ? "Recommended for you" : "Curated for you"}</h1>
        <p className="mt-1 text-[15px] font-semibold text-ace-secondary">
          {liveResults.isLoading ? "Finding live local matches..." : recommendationsMode ? "Based on your ACE Type, distance, and local fit" : "Thoughtfully picked matches"}
        </p>
      </section>

      <div className="mt-5 space-y-4">
        {liveResults.isLoading ? (
          <article className="rounded-[18px] border border-white/10 bg-white/[0.055] p-5 text-sm font-semibold leading-6 text-ace-secondary">
            Checking nearby places and sorting them for your preferences.
          </article>
        ) : null}
        {ranked.map(({ place, reasons }) => {
          const status = openLabel(place.openStatus);
          return (
          <article key={place.id} className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.055] p-2.5 shadow-[0_14px_36px_rgba(5,11,30,0.24)]">
            <div className="flex gap-3">
              <Link to={`/place/${place.id}`} className="h-[140px] w-[132px] shrink-0 overflow-hidden rounded-[14px]">
                <PlaceImage place={place} wrapperClassName="block size-full overflow-hidden" imageClassName="size-full object-cover" maxWidthPx={700} />
              </Link>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/place/${place.id}`} className="min-w-0">
                    <h2 className="line-clamp-2 text-[16px] font-extrabold leading-5">{place.name}</h2>
                  </Link>
                  <button type="button" aria-label={`Save ${place.name}`} onClick={() => savePlace(place.id)} className="shrink-0 text-ace-secondary">
                    <Heart size={27} />
                  </button>
                </div>
                <p className="mt-2 line-clamp-1 text-[13px] font-semibold text-ace-secondary">{place.category}</p>
                <p className="mt-2 text-[13px] font-bold text-ace-secondary">
                  {place.distanceMiles} mi - {place.travelMinutes} min - <span className="text-ace-success">{place.priceRange}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {place.vibeTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.08] px-2 py-1 text-[11px] font-bold capitalize leading-none text-ace-secondary">
                      {tag}
                    </span>
                  ))}
                  <span className={["shrink-0 text-sm font-extrabold", status === "Open" ? "text-ace-success" : status === "Soon" ? "text-ace-warning" : "text-ace-secondary"].join(" ")}>{status}</span>
                </div>
                <p className="mt-2 line-clamp-1 text-[11.5px] font-semibold leading-5 text-ace-secondary">
                  <span className="font-extrabold text-[#85C9FF]">Why it fits:</span> {reasons[0] ?? place.matchReason}
                </p>
              </div>
            </div>
          </article>
        );
        })}
      </div>
    </section>
  );
}
