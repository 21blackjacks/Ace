import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PlaceImage } from "../places/PlaceImage";
import type { Place } from "../../types/domain";

type PlacePickerSheetProps = {
  open: boolean;
  title: string;
  places: Place[];
  excludePlaceIds?: string[];
  emptyLabel?: string;
  onSelect: (placeId: string) => void;
  onClose: () => void;
};

export function PlacePickerSheet({ open, title, places, excludePlaceIds = [], emptyLabel = "No places available.", onSelect, onClose }: PlacePickerSheetProps) {
  const [query, setQuery] = useState("");

  const visiblePlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return places
      .filter((place) => !excludePlaceIds.includes(place.id))
      .filter((place) => {
        if (!normalized) return true;
        const haystack = [place.name, place.category, ...place.vibeTags, ...place.goodFor].join(" ").toLowerCase();
        return haystack.includes(normalized);
      });
  }, [excludePlaceIds, places, query]);

  if (!open) return null;

  const selectPlace = (placeId: string) => {
    onSelect(placeId);
    setQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#08122A]/95 p-5 text-ace-text shadow-ace-glow backdrop-blur-xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-ace-secondary">Pick a place and ACE will update the collection.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close place picker" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
          <X size={20} />
        </button>
      </header>

      <label className="mt-5 flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4">
        <Search className="shrink-0 text-ace-secondary" size={18} />
        <span className="sr-only">Search places</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search places"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ace-secondary"
        />
      </label>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
        {visiblePlaces.length ? (
          visiblePlaces.map((place) => (
            <button
              type="button"
              key={place.id}
              onClick={() => selectPlace(place.id)}
              className="flex w-full gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] p-3 text-left"
            >
              <PlaceImage place={place} wrapperClassName="block size-16 shrink-0 overflow-hidden rounded-2xl" imageClassName="size-full object-cover" maxWidthPx={400} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{place.name}</span>
                <span className="mt-1 block truncate text-sm font-semibold text-ace-secondary">{place.category}</span>
                <span className="mt-2 block text-xs font-bold text-ace-secondary">
                  {place.distanceMiles} mi - {place.priceRange}
                </span>
              </span>
            </button>
          ))
        ) : (
          <p className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-sm text-ace-secondary">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
