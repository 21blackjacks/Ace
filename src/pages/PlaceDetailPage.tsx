import { ArrowLeft, BookmarkPlus, Clock, Heart, MapPin, Share, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BoardPickerSheet } from "../components/sheets/BoardPickerSheet";
import { PlaceImage } from "../components/places/PlaceImage";
import { PlanSetupSheet } from "../components/sheets/PlanSetupSheet";
import { useAppStore } from "../store/appStore";

export function PlaceDetailPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [boardOpen, setBoardOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const place = useAppStore((state) => state.places.find((item) => item.id === placeId));
  const savePlace = useAppStore((state) => state.savePlace);
  const showToast = useAppStore((state) => state.showToast);

  if (!place) {
    return (
      <section className="px-6 py-12">
        <h1 className="text-2xl font-bold">Place not found</h1>
      </section>
    );
  }

  return (
    <section className="min-h-screen pb-6">
      <div className="relative h-[330px]">
        <PlaceImage
          place={place}
          wrapperClassName="block size-full overflow-hidden"
          imageClassName="size-full object-cover"
          attributionClassName="absolute bottom-4 left-6 max-w-[70%] rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white/85 backdrop-blur"
          maxWidthPx={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ace-bg via-ace-bg/30 to-black/30" />
        <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 pt-10">
          <button onClick={() => navigate(-1)} type="button" aria-label="Go back" className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur">
            <ArrowLeft size={23} />
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={() => showToast("Share link copied")} aria-label="Share" className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur">
              <Share size={21} />
            </button>
            <button type="button" onClick={() => showToast("More options coming soon")} aria-label="More options" className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur">
              ...
            </button>
          </div>
        </header>
      </div>

      <div className="-mt-16 px-6">
        <div className="relative">
          <div className="mb-3 flex gap-2">
            <span className="rounded-full bg-ace-purple px-4 py-2 text-sm font-bold">85% match</span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">See why</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{place.name}</h1>
          <p className="mt-3 text-base font-semibold text-ace-secondary">{place.category}</p>
          {place.address ? <p className="mt-2 text-sm font-semibold text-ace-secondary">{place.address}</p> : null}
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-ace-secondary">
            <MapPin size={17} />
            {place.distanceMiles} mi - {place.travelMinutes} min - {place.priceRange}
            <span className="text-ace-success">{place.openStatus === "open" ? `Open until ${place.openUntil}` : "Check hours"}</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-[20px] border border-white/10 bg-white/[0.05] p-3">
          {[
            ["Hours", place.hours],
            ["Parking", place.parking ?? "Check"],
            ["Reservations", place.reservations ?? "Check"],
            ["Dress", place.dressVibe ?? "Casual"]
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-xs font-bold text-ace-secondary">{label}</p>
              <p className="mt-1 truncate text-xs font-semibold text-ace-text">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {place.vibeTags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-ace-secondary">
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ace-cyan">
                <ThumbsUp size={22} />
                Worth it if...
              </h2>
              <p className="mt-2 text-sm leading-6 text-ace-secondary">{place.worthItIf}</p>
            </div>
          </div>
          <div className="my-4 h-px bg-white/10" />
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ace-danger">
              <ThumbsDown size={22} />
              Maybe skip if...
            </h2>
            <p className="mt-2 text-sm leading-6 text-ace-secondary">{place.maybeSkipIf}</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-[1fr_1.3fr_1.8fr] gap-3">
          <button type="button" onClick={() => savePlace(place.id)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold">
            <Heart size={18} />
            Save
          </button>
          <button type="button" onClick={() => setBoardOpen(true)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold">
            <BookmarkPlus size={18} />
            Add
          </button>
          <button type="button" onClick={() => setPlanOpen(true)} className="min-h-14 rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan px-4 text-sm font-bold text-white">
            <span className="inline-flex items-center gap-2">
              <Clock size={18} />
              Plan Around This
            </span>
          </button>
        </div>

        <section className="mt-6">
          <h2 className="text-xl font-bold">What people say</h2>
          <div className="mt-3 space-y-3">
            {place.reviews.map((review) => (
              <article key={review.id} className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{review.authorName}</p>
                  <p className="text-sm font-bold text-ace-warning">{review.rating.toFixed(1)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-ace-secondary">{review.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <BoardPickerSheet open={boardOpen} placeIds={[place.id]} onClose={() => setBoardOpen(false)} />
      <PlanSetupSheet open={planOpen} sourceType="place" sourceId={place.id} defaultPeopleContext={place.goodFor[0] ?? "friends"} onClose={() => setPlanOpen(false)} />
    </section>
  );
}
