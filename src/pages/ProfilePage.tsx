import { ArrowLeft, Bell, LocateFixed, RotateCcw, Settings, Shield, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AceTypeCard } from "../components/ace/AceTypeCard";
import { defaultAceType } from "../data/aceTypes";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import type { BudgetPreference, EffortPreference, NoveltyLevel } from "../types/domain";
import { useAppStore } from "../store/appStore";

const budgetOptions: BudgetPreference[] = ["$", "$$", "$$$", "flexible"];
const effortOptions: EffortPreference[] = ["low_effort", "balanced", "worth_the_drive"];
const noveltyOptions: NoveltyLevel[] = ["safe", "slightly_new", "surprise_me", "push_comfort_zone"];
const optionalVibes = ["cozy", "social", "outdoors", "hidden gem", "great food", "culture", "active", "quiet"];

const labelFor = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const updateLocationLabel = useAppStore((state) => state.updateLocationLabel);
  const showToast = useAppStore((state) => state.showToast);
  const { isLocating, requestLocation } = useCurrentLocation();
  const aceType = user.aceType ?? defaultAceType;
  const [locationInput, setLocationInput] = useState(user.currentLocation.label);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const updateLocation = (event: FormEvent) => {
    event.preventDefault();
    const nextLocation = locationInput.trim();
    if (nextLocation) updateLocationLabel(nextLocation);
  };

  const toggleVibe = (tag: string) => {
    const current = user.preferences.vibeTags;
    updatePreferences({
      vibeTags: current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    });
  };

  return (
    <section className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          My ACE Type
          <Sparkles className="text-ace-warning" size={18} />
        </div>
        <button type="button" aria-label="Open settings" className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
          <Settings size={20} />
        </button>
      </header>

      <div className="mt-7">
        <AceTypeCard aceType={aceType} />
      </div>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your preferences</h2>
          <Link to="/onboarding/quiz" className="text-sm font-bold text-ace-pink">
            Edit
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.preferences.vibeTags.slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-ace-secondary">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-bold">How we get it right</h2>
        <p className="mt-3 text-sm leading-6 text-ace-secondary">We use your quiz and feedback to personalize every recommendation.</p>
        <Link
          to="/onboarding/quiz"
          className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] px-5 text-base font-bold"
        >
          <RotateCcw size={18} />
          Retake ACE Quiz
        </Link>
      </section>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-bold">Fine-tune ACE</h2>

        <div className="mt-5">
          <p className="text-sm font-bold text-ace-secondary">Budget</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {budgetOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => updatePreferences({ budgetPreference: option })}
                className={`min-h-11 rounded-2xl border text-sm font-bold ${user.preferences.budgetPreference === option ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
              >
                {option === "flexible" ? "Flex" : option}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-ace-secondary">Distance comfort: {user.preferences.distanceComfortMiles} mi</span>
          <input
            type="range"
            min="1"
            max="25"
            value={user.preferences.distanceComfortMiles}
            onChange={(event) => updatePreferences({ distanceComfortMiles: Number(event.target.value) })}
            className="mt-3 w-full accent-ace-cyan"
          />
        </label>

        <div className="mt-5">
          <p className="text-sm font-bold text-ace-secondary">Effort</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {effortOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => updatePreferences({ effortPreference: option })}
                className={`min-h-12 rounded-2xl border px-2 text-xs font-bold ${user.preferences.effortPreference === option ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
              >
                {labelFor(option)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-ace-secondary">Novelty</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {noveltyOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => updatePreferences({ noveltyLevel: option })}
                className={`min-h-11 rounded-2xl border px-3 text-xs font-bold ${user.preferences.noveltyLevel === option ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
              >
                {labelFor(option)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-ace-secondary">Vibe signals</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {optionalVibes.map((tag) => {
              const selected = user.preferences.vibeTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleVibe(tag)}
                  className={`rounded-full border px-3 py-2 text-sm font-bold ${selected ? "border-ace-cyan bg-ace-blue/25" : "border-white/10 bg-white/[0.05] text-ace-secondary"}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-bold">Settings</h2>

        <form onSubmit={updateLocation} className="mt-5">
          <label htmlFor="profile-location" className="text-sm font-bold text-ace-secondary">
            Location
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="profile-location"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold outline-none"
            />
            <button type="submit" className="min-h-12 rounded-2xl bg-white/10 px-4 text-sm font-bold">
              Set
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={() => requestLocation()}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-ace-cyan/30 bg-ace-blue/15 px-4 text-sm font-bold text-ace-cyan"
        >
          <LocateFixed size={18} />
          {isLocating ? "Locating..." : "Use current location"}
        </button>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => {
              setNotificationsEnabled((current) => !current);
              showToast(notificationsEnabled ? "Notifications paused" : "Notifications enabled");
            }}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-white/[0.05] px-4 text-left"
          >
            <span className="flex items-center gap-3 font-bold">
              <Bell className="text-ace-cyan" size={20} />
              Notifications
            </span>
            <span className="text-sm font-bold text-ace-secondary">{notificationsEnabled ? "On" : "Off"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrivacyMode((current) => !current);
              showToast(privacyMode ? "Private mode off" : "Private mode on");
            }}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-white/[0.05] px-4 text-left"
          >
            <span className="flex items-center gap-3 font-bold">
              <Shield className="text-ace-purple" size={20} />
              Private saves
            </span>
            <span className="text-sm font-bold text-ace-secondary">{privacyMode ? "On" : "Off"}</span>
          </button>
        </div>
      </section>

    </section>
  );
}
