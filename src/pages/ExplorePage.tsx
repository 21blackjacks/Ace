import { ArrowLeft, Bookmark, CalendarPlus, Heart, MoreHorizontal, Music2, PlusSquare, Share } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoardPickerSheet } from "../components/sheets/BoardPickerSheet";
import { PlaceImage } from "../components/places/PlaceImage";
import { PlanSetupSheet } from "../components/sheets/PlanSetupSheet";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useAppStore } from "../store/appStore";
import type { ExperienceVideo, Place } from "../types/domain";
import { interpretSearchQuery, rankPlaces } from "../utils/search";

const tabs = ["For you", "Following"] as const;
type ExploreTab = (typeof tabs)[number];

function matchesTab(tab: ExploreTab, video: ExperienceVideo, place: Place | undefined, followedHandles: string[]) {
  if (!place) return false;
  if (tab === "For you") return true;
  if (tab === "Following") return followedHandles.includes(video.creatorHandle);
  return true;
}

function displayPlaceName(place: Place) {
  if (place.id === "rooftop-alida") return "Rooftop at The Alida";
  return place.name;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ExplorePage() {
  const navigate = useNavigate();
  const videos = useAppStore((state) => state.videos);
  const places = useAppStore((state) => state.places);
  const user = useAppStore((state) => state.user);
  const savePlace = useAppStore((state) => state.savePlace);
  const showToast = useAppStore((state) => state.showToast);
  const [boardPlaceId, setBoardPlaceId] = useState<string | undefined>();
  const [planPlaceId, setPlanPlaceId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<ExploreTab>("For you");
  const [followedHandles, setFollowedHandles] = useState<string[]>(["@localswithlena"]);
  const feedRef = useRef<HTMLElement | null>(null);
  const liveResults = useGooglePlaces(`${user.aceType?.name ?? "local"} nearby experiences`, 8);

  const feedPlaces = liveResults.isLive ? liveResults.places : places;
  const feedVideos = useMemo<ExperienceVideo[]>(() => {
    if (!liveResults.isLive) return videos;

    return liveResults.places.map((place, index) => ({
      id: `video-${place.id}`,
      placeId: place.id,
      creatorName: "Google Maps",
      creatorHandle: "@googlemaps",
      thumbnailUrl: place.imageUrl,
      caption: place.worthItIf,
      likes: Math.max(140, Math.min(9800, (place.reviewCount || 200) * 3 + index * 80)),
      comments: Math.max(8, Math.round((place.reviewCount || 50) / 24)),
      saves: Math.max(16, Math.round((place.reviewCount || 80) / 12)),
      vibeTags: place.vibeTags.slice(0, 4),
      bestFor: place.goodFor,
      aceNote: place.matchReason
    }));
  }, [liveResults.isLive, liveResults.places, videos]);

  const filteredVideos = useMemo(() => {
    const interpreted = interpretSearchQuery(`${user.aceType?.name ?? "local"} nearby experiences`, user);
    const rankByPlaceId = new Map(rankPlaces(feedPlaces, interpreted, user).map((ranked, index) => [ranked.place.id, { score: ranked.score, index }]));

    return feedVideos
      .filter((video) => matchesTab(activeTab, video, feedPlaces.find((place) => place.id === video.placeId), followedHandles))
      .sort((a, b) => {
        const aPlace = feedPlaces.find((place) => place.id === a.placeId);
        const bPlace = feedPlaces.find((place) => place.id === b.placeId);
        const aRank = rankByPlaceId.get(a.placeId);
        const bRank = rankByPlaceId.get(b.placeId);
        const aScore = (aRank?.score ?? 0) + (aPlace?.distanceMiles ? Math.max(0, 12 - aPlace.distanceMiles * 2) : 0);
        const bScore = (bRank?.score ?? 0) + (bPlace?.distanceMiles ? Math.max(0, 12 - bPlace.distanceMiles * 2) : 0);
        return bScore - aScore || (aRank?.index ?? 999) - (bRank?.index ?? 999);
      });
  }, [activeTab, feedPlaces, feedVideos, followedHandles, user]);

  const toggleFollow = (handle: string) => {
    setFollowedHandles((current) => {
      const following = current.includes(handle);
      showToast(following ? "Creator unfollowed" : "Creator followed");
      return following ? current.filter((item) => item !== handle) : [...current, handle];
    });
  };

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0 });
  }, [activeTab, filteredVideos.length]);

  return (
    <>
      <section ref={feedRef} className="h-screen snap-y snap-mandatory overflow-y-auto">
        {filteredVideos.length ? filteredVideos.map((video) => {
          const place = feedPlaces.find((item) => item.id === video.placeId);
          if (!place) return null;
          const following = followedHandles.includes(video.creatorHandle);

          return (
            <article key={video.id} className="relative h-screen snap-start overflow-hidden">
            <PlaceImage
              place={place}
              alt={`${place.name} experience preview`}
              fallbackSrc={video.thumbnailUrl}
              wrapperClassName="block size-full overflow-hidden"
              imageClassName="size-full object-cover object-[30%_center] brightness-[0.68] saturate-[0.95]"
              attributionClassName="absolute bottom-[72px] left-6 max-w-[72%] rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur"
              maxWidthPx={1200}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#071126]/55 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B1E] via-black/22 to-black/18" />
            <div className="absolute inset-x-0 top-[90px] z-10 flex items-start justify-center px-6">
              <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="absolute left-6 top-0 grid size-11 place-items-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                <ArrowLeft size={31} strokeWidth={2.35} />
              </button>
              <div className="flex items-start justify-center gap-9 text-base font-bold text-white/75">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-12 shrink-0 px-1 pb-2 ${activeTab === tab ? "border-b-[3px] border-white text-white" : "text-white/55"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute bottom-[86px] left-6 right-[86px]">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-black/35 px-2.5 pr-3 text-sm font-bold backdrop-blur">
                  {video.creatorAvatarUrl ? <img src={video.creatorAvatarUrl} alt="" className="size-7 rounded-full object-cover" /> : <span className="size-7 rounded-full bg-white/20" />}
                  {video.creatorHandle}
                </span>
                <button type="button" onClick={() => toggleFollow(video.creatorHandle)} className="min-h-9 rounded-full bg-white/15 px-4 text-sm font-bold backdrop-blur">
                  {following ? "Following" : "Follow"}
                </button>
              </div>
              <Link to={`/place/${place.id}`}>
                <h1 className="text-[28px] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">{displayPlaceName(place)}</h1>
              </Link>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-base font-bold text-white/82">
                <span>{place.distanceMiles} mi</span>
                <span aria-hidden="true">&bull;</span>
                <span>{place.location.label}</span>
                <span aria-hidden="true">&bull;</span>
                <span className="text-ace-success">Open now</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {video.vibeTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-black/35 px-3.5 py-2 text-sm font-bold text-white backdrop-blur">
                    {titleCase(tag)}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-3">
                <p className="min-w-0 flex-1 text-base font-semibold leading-7">{video.caption}</p>
                <button type="button" onClick={() => showToast("More options coming soon")} aria-label="More options" className="mt-1 shrink-0 text-white">
                  <MoreHorizontal size={25} />
                </button>
              </div>
              {video.audioLabel ? (
                <p className="mt-5 flex items-center gap-3 text-lg font-bold">
                  <Music2 size={22} fill="currentColor" />
                  {video.audioLabel}
                </p>
              ) : null}
            </div>
            <div className="absolute right-4 top-[290px] flex w-[62px] flex-col items-center gap-6 rounded-full bg-black/35 py-6 backdrop-blur-md">
              {[
                [Heart, `${Math.round(video.likes / 100) / 10}K`, () => showToast("Liked")],
                [Bookmark, "Save", () => savePlace(place.id)],
                [PlusSquare, "Add to Board", () => setBoardPlaceId(place.id)],
                [CalendarPlus, "Plan", () => setPlanPlaceId(place.id)],
                [Share, "Share", () => showToast("Share link copied")]
              ].map(([Icon, label, action]) => {
                const IconComponent = Icon as typeof Heart;
                const onClick = action as () => void;
                return (
                  <button key={label as string} type="button" onClick={onClick} className="flex flex-col items-center gap-1 text-center text-xs font-extrabold leading-tight">
                    <IconComponent size={32} strokeWidth={2.2} />
                    <span className="max-w-[54px]">{label as string}</span>
                  </button>
                );
              })}
            </div>
            </article>
          );
        }) : (
          <article className="grid h-[calc(100vh-88px)] place-items-center px-6 text-center">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-ace-glow">
              <h1 className="text-2xl font-bold">Nothing here yet</h1>
              <p className="mt-3 text-sm leading-6 text-ace-secondary">
                Follow a creator or switch tabs to keep exploring local experiences.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("For you")}
                className="mt-5 min-h-12 rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-sm font-bold text-white"
              >
                Back to For you
              </button>
            </div>
          </article>
        )}
      </section>
      <BoardPickerSheet open={Boolean(boardPlaceId)} placeIds={boardPlaceId ? [boardPlaceId] : []} onClose={() => setBoardPlaceId(undefined)} />
      <PlanSetupSheet open={Boolean(planPlaceId)} sourceType="explore" sourceId={planPlaceId} defaultPeopleContext="friends" onClose={() => setPlanPlaceId(undefined)} />
    </>
  );
}
