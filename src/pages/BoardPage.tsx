import { ArrowLeft, Heart, MoreHorizontal, Plus, Share } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlaceImage } from "../components/places/PlaceImage";
import { BoardPickerSheet } from "../components/sheets/BoardPickerSheet";
import { PlacePickerSheet } from "../components/sheets/PlacePickerSheet";
import { PlanSetupSheet } from "../components/sheets/PlanSetupSheet";
import { useAppStore } from "../store/appStore";

export function BoardPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [planOpen, setPlanOpen] = useState(false);
  const [movingPlaceId, setMovingPlaceId] = useState<string | undefined>();
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const resolvedBoardId = boardId ?? "saved-places";
  const board = useAppStore((state) => state.boards.find((item) => item.id === resolvedBoardId));
  const places = useAppStore((state) => state.places);
  const addPlaceToBoard = useAppStore((state) => state.addPlaceToBoard);
  const removePlaceFromBoard = useAppStore((state) => state.removePlaceFromBoard);
  const showToast = useAppStore((state) => state.showToast);

  if (!board) {
    return (
      <section className="px-6 py-12">
        <h1 className="text-2xl font-bold">Board not found</h1>
      </section>
    );
  }

  const boardPlaces = board.placeIds.map((id) => places.find((place) => place.id === id)).filter((place): place is (typeof places)[number] => Boolean(place));
  const activePlaceId = selectedPlaceId ?? boardPlaces[0]?.id;

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
          <ArrowLeft size={22} />
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={() => showToast("Share link copied")} aria-label="Share board" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
            <Share size={20} />
          </button>
          <button type="button" onClick={() => setAddPlaceOpen(true)} aria-label="Add place" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
            <Plus size={22} />
          </button>
        </div>
      </header>

      <h1 className="mt-7 text-3xl font-bold">{board.name}</h1>
      <p className="mt-2 text-base font-bold text-ace-secondary">{boardPlaces.length} places</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <button type="button" onClick={() => showToast("Share link copied")} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold">
          Share
        </button>
        <button type="button" onClick={() => setPlanOpen(true)} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold">
          Add to Plan
        </button>
        <button type="button" onClick={() => setPlanOpen(true)} className="min-h-12 rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan text-sm font-bold text-white">
          Build Plan
        </button>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        {boardPlaces.map((place) => (
          <article
            key={place.id}
            className={[
              "overflow-hidden rounded-[22px] border bg-white/[0.06] transition",
              activePlaceId === place.id ? "border-ace-cyan/70 shadow-[0_0_24px_rgba(32,214,210,0.14)]" : "border-white/10"
            ].join(" ")}
          >
            <div className="relative h-36">
              <Link to={`/place/${place.id}`} className="block h-full">
                <PlaceImage place={place} wrapperClassName="block size-full overflow-hidden" imageClassName="size-full object-cover" maxWidthPx={700} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </Link>
              <button
                type="button"
                aria-label={`Select ${place.name}`}
                onClick={() => setSelectedPlaceId(place.id)}
                className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur"
              >
                <Heart size={21} fill={activePlaceId === place.id ? "currentColor" : "none"} />
              </button>
            </div>
            <Link to={`/place/${place.id}`} className="block p-3">
                <h2 className="line-clamp-2 font-bold leading-5">{place.name}</h2>
                <p className="mt-2 text-sm font-bold text-ace-secondary">
                  {place.distanceMiles} mi - {place.priceRange}
                </p>
            </Link>
          </article>
        ))}
      </div>

      {activePlaceId ? (
        <div className="sticky bottom-24 mt-6 grid grid-cols-[1fr_64px] overflow-hidden rounded-2xl border border-white/10 bg-ace-strong/95 shadow-[0_18px_44px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button type="button" onClick={() => setMovingPlaceId(activePlaceId)} className="min-h-14 text-sm font-bold">
            Move to Board
          </button>
          <button
            type="button"
            aria-label="Remove selected place"
            onClick={() => {
              removePlaceFromBoard(activePlaceId, board.id);
              setSelectedPlaceId(undefined);
              showToast("Removed from board");
            }}
            className="grid min-h-14 place-items-center border-l border-white/10 text-ace-secondary"
          >
            <MoreHorizontal size={22} />
          </button>
        </div>
      ) : null}
      <BoardPickerSheet
        open={Boolean(movingPlaceId)}
        placeIds={movingPlaceId ? [movingPlaceId] : []}
        sourceBoardId={board.id}
        moveMode
        onClose={() => setMovingPlaceId(undefined)}
      />
      <PlacePickerSheet
        open={addPlaceOpen}
        title={`Add to ${board.name}`}
        places={places}
        excludePlaceIds={board.placeIds}
        emptyLabel="Every available place is already on this board."
        onSelect={(placeId) => addPlaceToBoard(placeId, board.id)}
        onClose={() => setAddPlaceOpen(false)}
      />
      <PlanSetupSheet
        open={planOpen}
        sourceType={board.isDefault ? "saved_places" : "board"}
        sourceId={board.id}
        defaultPeopleContext={board.vibeTags.includes("family") ? "family" : board.vibeTags.includes("date") ? "partner" : "friends"}
        onClose={() => setPlanOpen(false)}
      />
    </section>
  );
}
