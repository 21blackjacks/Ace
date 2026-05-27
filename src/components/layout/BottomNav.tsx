import { Bookmark, Compass, Home, Map, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/saved", label: "Saved", Icon: Bookmark },
  { to: "/plans", label: "Plans", Icon: Map }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-white/10 bg-[#071126]/95 px-5 pb-5 pt-3 text-xs shadow-[0_-16px_36px_rgba(5,11,30,0.78)] backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex min-h-12 flex-col items-center justify-center gap-1 text-ace-secondary transition",
                isActive ? "text-[#7FCCFF] drop-shadow-[0_0_10px_rgba(32,214,210,0.45)]" : "hover:text-ace-text"
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon aria-hidden="true" size={22} strokeWidth={2.25} fill={isActive && ["Home", "Saved"].includes(label) ? "currentColor" : "none"} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
