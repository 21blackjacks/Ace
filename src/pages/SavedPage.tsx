import { Bookmark, CalendarDays, MoreHorizontal, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PlaceImage } from "../components/places/PlaceImage";
import { CreateBoardSheet } from "../components/sheets/CreateBoardSheet";
import { useAppStore } from "../store/appStore";

export function SavedPage() {
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const places = useAppStore((state) => state.places);
  const boards = useAppStore((state) => state.boards);
  const plans = useAppStore((state) => state.plans);
  const defaultBoard = boards.find((board) => board.isDefault);
  const customBoards = boards.filter((board) => !board.isDefault);
  const upcomingPlan = plans.find((plan) => plan.status === "upcoming") ?? plans[0];
  const placeById = new Map(places.map((place) => [place.id, place]));
  const defaultBoardCoverPlaces = defaultBoard?.placeIds.map((id) => placeById.get(id)).filter((place): place is (typeof places)[number] => Boolean(place)).slice(0, 3) ?? [];

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Saved</h1>
        <div className="flex gap-2">
          <button type="button" aria-label="Search saved places" className="grid size-11 place-items-center text-ace-text">
            <Search size={28} />
          </button>
          <button type="button" aria-label="Create board" onClick={() => setCreateBoardOpen(true)} className="grid size-11 place-items-center text-ace-text">
            <Plus size={30} />
          </button>
        </div>
      </header>

      <h2 className="mt-8 text-xl font-bold">Your boards</h2>
      {defaultBoard ? (
        <article className="mt-4 rounded-[24px] border-2 border-ace-cyan bg-white/[0.06] p-4 shadow-ace-glow">
          <Link to="/saved/places" className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-ace-blue/30 text-ace-cyan">
              <Bookmark size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold">{defaultBoard.name}</h3>
              <p className="text-sm font-semibold text-ace-secondary">{defaultBoard.description}</p>
              <p className="mt-1 text-sm font-bold text-ace-secondary">{defaultBoard.placeIds.length} places</p>
            </div>
            <div className="flex -space-x-5">
              {defaultBoardCoverPlaces.map((place, index) => (
                <PlaceImage
                  key={place.id}
                  place={place}
                  alt={`${defaultBoard.name} cover ${index + 1}`}
                  wrapperClassName="block size-14 overflow-hidden rounded-2xl border border-ace-bg"
                  imageClassName="size-full object-cover"
                  attributionClassName="absolute bottom-0 right-0 max-w-full truncate rounded-tl bg-black/60 px-1 text-[7px] font-bold text-white/80"
                  maxWidthPx={300}
                />
              ))}
            </div>
          </Link>
        </article>
      ) : null}

      <div className="mt-4 space-y-3">
        {customBoards.map((board) => {
          const coverPlace = board.placeIds.map((id) => placeById.get(id)).find((place): place is (typeof places)[number] => Boolean(place));

          return (
            <Link key={board.id} to={`/saved/boards/${board.id}`} className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
              {coverPlace ? (
                <PlaceImage
                  place={coverPlace}
                  alt={`${board.name} cover`}
                  wrapperClassName="block size-16 overflow-hidden rounded-2xl"
                  imageClassName="size-full object-cover"
                  attributionClassName="absolute bottom-0 right-0 max-w-full truncate rounded-tl bg-black/60 px-1 text-[7px] font-bold text-white/80"
                  maxWidthPx={300}
                />
              ) : (
                <div className="size-16 rounded-2xl bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold">{board.name}</h3>
                <p className="text-sm font-bold text-ace-secondary">{board.placeIds.length} places</p>
              </div>
              <MoreHorizontal className="text-ace-secondary" />
            </Link>
          );
        })}
      </div>

      {upcomingPlan ? (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your plans</h2>
            <Link to="/plans" className="text-sm font-bold text-ace-pink">
              See all
            </Link>
          </div>
          <Link to={`/plans/${upcomingPlan.id}`} className="mt-4 block rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start gap-4">
              <CalendarDays className="text-ace-purple" size={34} />
              <div>
                <h3 className="text-lg font-bold">{upcomingPlan.name}</h3>
                <p className="mt-1 text-sm font-semibold text-ace-secondary">{upcomingPlan.dateLabel}</p>
                <p className="mt-2 text-sm font-bold text-ace-secondary">
                  {upcomingPlan.stops.length} stops - {Math.round(upcomingPlan.estimatedDurationMinutes / 60)}h - ${upcomingPlan.estimatedCostMin}-${upcomingPlan.estimatedCostMax}
                </p>
              </div>
            </div>
          </Link>
        </section>
      ) : null}
      <CreateBoardSheet open={createBoardOpen} onClose={() => setCreateBoardOpen(false)} />
    </section>
  );
}
