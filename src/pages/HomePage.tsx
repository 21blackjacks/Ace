import { CircleDollarSign, Navigation, Search, ShieldCheck, Sparkles, Star, TentTree, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/layout/BrandLogo";
import { PlaceImage } from "../components/places/PlaceImage";
import { loadOnboardingPreferences } from "../data/onboarding";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useAppStore } from "../store/appStore";
import { interpretSearchQuery, rankPlaces } from "../utils/search";

const vibeFilters = [
  { label: "Tonight", query: "something to do with friends tonight", Icon: Star },
  { label: "With friends", query: "fun with friends nearby", Icon: UsersRound },
  { label: "Date night", query: "low effort date night", Icon: ShieldCheck },
  { label: "Outdoors", query: "something outdoors and scenic", Icon: TentTree }
];

const vibeCards = [
  { label: "Fun & Party", query: "fun party with friends", placeId: "stars-and-strikes" },
  { label: "Foodie", query: "best foodie spots", placeId: "common-thread" },
  { label: "Trendy", query: "trendy night out", placeId: "rooftop-alida" },
  { label: "Chill", query: "chill scenic places", placeId: "forsyth-park" }
];

export function HomePage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const places = useAppStore((state) => state.places);
  const { requestLocation } = useCurrentLocation();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(vibeFilters[0]);
  const onboardingPreferences = useMemo(() => loadOnboardingPreferences(), []);
  const liveResults = useGooglePlaces(selectedFilter.query, 8);
  const recommendationsHref = "/search?mode=recommendations";
  const browseRecommendationsHref = "/search?mode=recommendations";

  useEffect(() => {
    const requested = sessionStorage.getItem("ace-location-requested");
    if (requested || user.currentLocation.label !== "Savannah, GA") return;
    sessionStorage.setItem("ace-location-requested", "true");
    requestLocation({ silent: true });
  }, [requestLocation, user.currentLocation.label]);

  const ranked = useMemo(() => {
    const interpreted = interpretSearchQuery(selectedFilter.query, user);
    const curatedPlaces = places.filter((place) => place.source !== "google_places");
    const recommendationPlaces = liveResults.isLive ? liveResults.places : liveResults.isLoading ? [] : curatedPlaces;
    return rankPlaces(recommendationPlaces, interpreted, user);
  }, [liveResults.isLive, liveResults.isLoading, liveResults.places, places, selectedFilter, user]);

  const topMatch = ranked[0];
  const homeMatchScore = topMatch?.score;
  const browseVibes = vibeCards
    .map((vibe) => ({ ...vibe, place: places.find((place) => place.id === vibe.placeId) }))
    .filter((vibe): vibe is (typeof vibeCards)[number] & { place: (typeof places)[number] } => Boolean(vibe.place));

  const runSearch = () => {
    const searchQuery = query.trim() || "something to do with friends tonight";
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    runSearch();
  };

  const formatCategory = (category: string) => category.replaceAll(" - ", " • ");

  return (
    <section className="min-h-screen px-6 pb-5 pt-12">
      <header className="relative">
        <div className="min-w-0">
          <BrandLogo className="h-[52px] w-auto drop-shadow-[0_0_14px_rgba(32,214,210,0.24)]" />
          <h1 className="mt-6 whitespace-nowrap text-[27px] font-extrabold leading-none tracking-normal">Good evening, {user.name} ✨</h1>
          <p className="mt-2.5 flex items-center gap-2 text-[15px] font-semibold text-ace-secondary">
            Finding fits near {user.currentLocation.label}
            <Navigation size={15} fill="currentColor" />
          </p>
        </div>
        <Link to="/profile" aria-label="Open profile" className="absolute right-0 top-0 overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-[0_0_18px_rgba(32,214,210,0.12)]">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={`${user.name} profile`} className="size-[54px] object-cover" /> : <span className="block size-[54px]" />}
        </Link>
      </header>

      <form onSubmit={submitSearch} className="mt-6">
        <label className="sr-only" htmlFor="home-search">
          Search for a plan
        </label>
        <div className="flex min-h-[58px] items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.08] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Search className="shrink-0 text-ace-secondary" size={22} />
          <input
            id="home-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
              }
            }}
            placeholder="What kind of plan are you looking for?"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-ace-text outline-none placeholder:text-ace-secondary"
          />
        </div>
      </form>

      <div className="mt-4 grid grid-cols-4 gap-2 pb-1">
        {vibeFilters.map((filter) => {
          const selected = selectedFilter.label === filter.label;
          const Icon = filter.Icon;
          return (
            <button
              type="button"
              key={filter.label}
              onClick={() => setSelectedFilter(filter)}
              className={[
                "inline-flex min-h-[34px] min-w-0 items-center justify-center gap-1 rounded-full border px-1.5 py-2 text-[11px] font-bold leading-none transition",
                selected ? "border-[#5EA8FF]/50 bg-[#2457A8]/55 text-ace-text shadow-[0_0_16px_rgba(47,128,255,0.2)]" : "border-white/10 bg-white/[0.06] text-ace-secondary"
              ].join(" ")}
            >
              <Icon size={14} className={selected ? "text-ace-cyan" : "text-ace-secondary"} fill={selected ? "currentColor" : "none"} />
              <span className="whitespace-nowrap">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {onboardingPreferences?.aceType ? (
        <section className="mt-5 rounded-[18px] border border-ace-cyan/20 bg-white/[0.055] px-4 py-3 shadow-[0_0_24px_rgba(32,214,210,0.08)]">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 shrink-0 text-ace-cyan" size={18} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ace-cyan">Based on your ACE Type</p>
              <p className="mt-1 truncate text-sm font-extrabold">{onboardingPreferences.aceType}</p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-ace-secondary">{onboardingPreferences.aceTypeDescription}</p>
            </div>
          </div>
        </section>
      ) : null}

      {topMatch || liveResults.isLoading ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Top matches for you</h2>
            <Link to={recommendationsHref} className="text-sm font-bold text-ace-pink">
              See all
            </Link>
          </div>

          {liveResults.isLoading || !topMatch ? (
            <article className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.055] px-5 py-8 text-sm font-semibold leading-6 text-ace-secondary shadow-ace-glow">
              Finding your best live local match...
            </article>
          ) : (
          <article className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.055] shadow-ace-glow">
            <div className="relative h-[200px]">
              <PlaceImage place={topMatch.place} wrapperClassName="block size-full overflow-hidden" imageClassName="size-full object-cover" maxWidthPx={900} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B1E] via-[#050B1E]/34 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-[#8B5CF6] px-4 py-2 text-sm font-bold text-white shadow-[0_0_14px_rgba(139,92,246,0.55)]">
                {homeMatchScore}% match
              </span>
              <Link to={`/place/${topMatch.place.id}`} className="absolute inset-x-0 bottom-0 block p-5">
                <h3 className="text-2xl font-bold">{topMatch.place.name}</h3>
                <p className="mt-2 text-sm font-semibold text-ace-secondary">{formatCategory(topMatch.place.category)}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-ace-secondary">
                  <CircleDollarSign size={16} className="text-ace-secondary" />
                  <span>
                    {topMatch.place.distanceMiles} mi - {topMatch.place.travelMinutes} min - <span className="text-ace-success">{topMatch.place.priceRange}</span>
                  </span>
                </p>
              </Link>
            </div>
          </article>
          )}

          {!liveResults.isLoading && topMatch ? (
          <div className="mt-3 rounded-[18px] border border-white/10 bg-gradient-to-r from-[#2D2B66] to-[#263B78] px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">Why it fits you</h3>
                <p className="mt-1.5 max-w-[250px] text-sm font-semibold leading-5 text-ace-secondary">{topMatch.place.matchReason}</p>
              </div>
              <Sparkles className="mt-2 shrink-0 text-ace-cyan" size={38} strokeWidth={1.6} />
            </div>
          </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Browse by vibe</h2>
          <Link to={browseRecommendationsHref} className="text-sm font-bold text-ace-pink">
            See all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {browseVibes.map(({ label, query: vibeQuery, place }) => (
            <Link key={label} to={`/search?q=${encodeURIComponent(vibeQuery)}`} className="overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.06]">
              <div className="relative h-[66px]">
                <PlaceImage place={place} alt={label} wrapperClassName="block size-full overflow-hidden" imageClassName="size-full object-cover" maxWidthPx={500} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <p className="absolute bottom-2 left-1.5 right-1.5 truncate text-center text-[12px] font-extrabold leading-none text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  {label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
