import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export function BusinessProfilePage() {
  const navigate = useNavigate();
  const place = useAppStore((state) => state.places.find((item) => item.id === "common-thread") ?? state.places[0]);
  const updatePlace = useAppStore((state) => state.updatePlace);
  const [story, setStory] = useState(place.businessStory ?? place.description);
  const [bestFor, setBestFor] = useState(place.goodFor.join(", "));
  const [vibes, setVibes] = useState(place.vibeTags.join(", "));
  const [parking, setParking] = useState(place.parking ?? "");
  const [reservations, setReservations] = useState(place.reservations ?? "");

  const save = (event: FormEvent) => {
    event.preventDefault();
    updatePlace(place.id, {
      businessStory: story,
      goodFor: bestFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      vibeTags: vibes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      parking,
      reservations
    });
  };

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
          <ArrowLeft size={22} />
        </button>
        <button type="submit" form="business-profile-form" className="flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-ace-purple to-ace-cyan px-4 text-sm font-bold text-white">
          <Save size={17} />
          Save
        </button>
      </header>

      <div className="mt-7">
        <p className="text-sm font-bold text-ace-cyan">Business Profile</p>
        <h1 className="mt-2 text-3xl font-bold">{place.name}</h1>
        <p className="mt-2 text-sm font-semibold text-ace-secondary">{place.category}</p>
      </div>

      <form id="business-profile-form" onSubmit={save} className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-bold text-ace-secondary">Our story</span>
          <textarea
            value={story}
            onChange={(event) => setStory(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ace-secondary">Vibe tags</span>
          <input
            value={vibes}
            onChange={(event) => setVibes(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ace-secondary">Best for</span>
          <input
            value={bestFor}
            onChange={(event) => setBestFor(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-ace-secondary">Parking</span>
            <input
              value={parking}
              onChange={(event) => setParking(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ace-secondary">Reservations</span>
            <input
              value={reservations}
              onChange={(event) => setReservations(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none"
            />
          </label>
        </div>
      </form>
    </section>
  );
}
