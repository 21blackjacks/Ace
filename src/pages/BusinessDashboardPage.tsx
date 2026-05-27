import { ArrowLeft, Bookmark, CalendarPlus, Eye, MessageSquare, Pencil, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PlaceImage } from "../components/places/PlaceImage";
import { useAppStore } from "../store/appStore";

export function BusinessDashboardPage() {
  const navigate = useNavigate();
  const places = useAppStore((state) => state.places);
  const boards = useAppStore((state) => state.boards);
  const plans = useAppStore((state) => state.plans);
  const place = places.find((item) => item.id === "common-thread") ?? places[0];
  const saves = boards.filter((board) => board.placeIds.includes(place.id)).length * 18 + 42;
  const planAdds = plans.filter((plan) => plan.stops.some((stop) => stop.placeId === place.id)).length * 7 + 19;

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
          <ArrowLeft size={22} />
        </button>
        <Link to="/business/profile" className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-bold">
          <Pencil size={17} />
          Edit
        </Link>
      </header>

      <div className="mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-ace-glow">
        <div className="relative h-48">
          <PlaceImage
            place={place}
            wrapperClassName="block size-full overflow-hidden"
            imageClassName="size-full object-cover"
            attributionClassName="absolute bottom-4 right-4 max-w-[58%] rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white/85 backdrop-blur"
            maxWidthPx={1000}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ace-bg to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-sm font-bold text-ace-cyan">Business Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold">{place.name}</h1>
            <p className="mt-2 text-sm font-semibold text-ace-secondary">{place.category}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          [Eye, "Views", "3.8K"],
          [Bookmark, "Saves", saves.toString()],
          [CalendarPlus, "Plan adds", planAdds.toString()],
          [MessageSquare, "Inquiries", "12"]
        ].map(([Icon, label, value]) => {
          const IconComponent = Icon as typeof Eye;
          return (
            <article key={label as string} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
              <IconComponent className="text-ace-cyan" size={24} />
              <p className="mt-4 text-sm font-bold text-ace-secondary">{label as string}</p>
              <p className="mt-1 text-2xl font-bold">{value as string}</p>
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-bold">Engagement insights</h2>
        <div className="mt-4 space-y-3">
          {[
            `Most saved to boards tagged ${place.vibeTags.slice(0, 2).join(" and ")}.`,
            `${place.goodFor.slice(0, 2).join(" and ")} are the strongest audience matches.`,
            "Searches mentioning cozy dinner and local food are trending this week."
          ].map((insight) => (
            <p key={insight} className="rounded-2xl bg-white/[0.05] p-4 text-sm leading-6 text-ace-secondary">
              {insight}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Search className="text-ace-purple" size={22} />
          Top search terms
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["cozy local dinner", "savannah date night", "foodie restaurant", "warm lighting", "seasonal menu"].map((term) => (
            <span key={term} className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-ace-secondary">
              {term}
            </span>
          ))}
        </div>
      </section>
    </section>
  );
}
