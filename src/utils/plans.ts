import { defaultBoards } from "../data/mockBoards";
import { places as defaultPlaces } from "../data/mockPlaces";
import type { Board, GeneratePlanInput, Place, Plan, PlanStop } from "../types/domain";
import { distanceBetweenPlaces } from "./location";
import { interpretSearchQuery, rankPlaces } from "./search";

type PlanGenerationContext = {
  places?: Place[];
  boards?: Board[];
};

const priceToCost: Record<string, [number, number]> = {
  "$": [0, 15],
  "$$": [15, 40],
  "$$$": [35, 75],
  "$$$$": [75, 140]
};

const makeId = (prefix: string) => {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 100000)}`;
  return `${prefix}-${random}`;
};

const toTitle = (value?: string) =>
  value
    ? value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "";

const startTimeFor = (when: GeneratePlanInput["when"]) => {
  if (when === "tonight") return "6:00 PM";
  if (when === "this_weekend") return "1:00 PM";
  return "1:00 PM";
};

const dateLabelFor = (input: GeneratePlanInput) => {
  if (input.customDate) return input.customDate;
  if (input.when === "tonight") return "Tonight";
  if (input.when === "this_weekend") return "This weekend";
  return "Custom date";
};

const parseTime = (label: string) => {
  const match = label.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 13 * 60;
  const rawHour = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();
  const hour = suffix === "PM" && rawHour !== 12 ? rawHour + 12 : suffix === "AM" && rawHour === 12 ? 0 : rawHour;
  return hour * 60 + minutes;
};

const formatTime = (totalMinutes: number) => {
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${suffix}`;
};

const durationFor = (place: Place) => {
  if (place.category.toLowerCase().includes("dinner") || place.vibeTags.includes("great food")) return 90;
  if (place.vibeTags.includes("active") || place.practicalTags.includes("ticketed")) return 90;
  if (place.vibeTags.includes("outdoors") || place.vibeTags.includes("shopping")) return 60;
  if (place.vibeTags.includes("coffee") || place.vibeTags.includes("wine")) return 45;
  return 60;
};

const costFor = (place: Place): [number, number] => {
  if (place.costEstimateMax || place.costEstimateMin) {
    return [place.costEstimateMin, place.costEstimateMax];
  }
  return priceToCost[place.priceRange] ?? [15, 40];
};

const findAnchor = (input: GeneratePlanInput, places: Place[], boards: Board[]) => {
  if (input.sourceType === "place" || input.sourceType === "explore") {
    return places.find((place) => place.id === input.sourceId);
  }

  if (input.selectedPlaceIds?.length) {
    return places.find((place) => place.id === input.selectedPlaceIds?.[0]);
  }

  if (input.sourceType === "board" || input.sourceType === "saved_places") {
    const boardId = input.sourceType === "saved_places" ? "saved-places" : input.sourceId;
    const board = boards.find((item) => item.id === boardId);
    return places.find((place) => place.id === board?.placeIds[0]);
  }

  if (input.query) {
    const interpreted = interpretSearchQuery(input.query, input.user);
    return rankPlaces(places, interpreted, input.user)[0]?.place;
  }

  return places[0];
};

const candidatePlaces = (input: GeneratePlanInput, places: Place[], boards: Board[], anchor?: Place) => {
  const selected = input.selectedPlaceIds?.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place)) ?? [];
  const socialContext = input.peopleContext ?? input.user.preferences.socialStyles[0];
  const selectedVibeTags = selected.flatMap((place) => place.vibeTags).slice(0, 4);
  const candidateVibeTags = anchor?.vibeTags.slice(0, 4) ?? (selectedVibeTags.length ? selectedVibeTags : input.user.preferences.vibeTags);
  const rankedAroundAnchor = rankPlaces(
    places.filter((place) => !selected.some((item) => item.id === place.id)),
    {
      rawQuery: input.query ?? anchor?.name ?? socialContext,
      locationMode: input.user.currentLocation.mode,
      locationLabel: input.user.currentLocation.label,
      socialContext,
      timeContext: undefined,
      budgetContext: undefined,
      vibeTags: candidateVibeTags,
      effortLevel: undefined,
      noveltyLevel: undefined
    },
    input.user
  ).map((rankedPlace) => rankedPlace.place);

  if (selected.length) return [...selected, ...rankedAroundAnchor];

  if (input.sourceType === "board" || input.sourceType === "saved_places") {
    const boardId = input.sourceType === "saved_places" ? "saved-places" : input.sourceId;
    const board = boards.find((item) => item.id === boardId);
    const boardPlaces = board?.placeIds.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place)) ?? [];
    if (boardPlaces.length) return [...boardPlaces, ...rankedAroundAnchor.filter((place) => !boardPlaces.some((boardPlace) => boardPlace.id === place.id))];
  }

  if (input.query) {
    const interpreted = interpretSearchQuery(input.query, input.user);
    return rankPlaces(places, interpreted, input.user)
      .slice(0, 8)
      .map((ranked) => ranked.place);
  }

  const ranked = rankPlaces(
    places,
    {
      rawQuery: socialContext,
      locationMode: input.user.currentLocation.mode,
      locationLabel: input.user.currentLocation.label,
      socialContext,
      timeContext: undefined,
      budgetContext: undefined,
      vibeTags: anchor?.vibeTags.slice(0, 3) ?? input.user.preferences.vibeTags,
      effortLevel: undefined,
      noveltyLevel: undefined
    },
    input.user
  ).map((rankedPlace) => rankedPlace.place);

  return ranked;
};

const categoryWeight = (place: Place, peopleContext?: string) => {
  const tags = [...place.vibeTags, ...place.goodFor, ...place.practicalTags];
  if (peopleContext === "friends") {
    if (tags.includes("active") || tags.includes("games")) return 10;
    if (tags.includes("food") || tags.includes("great food")) return 8;
    if (tags.includes("cocktails") || tags.includes("rooftop")) return 6;
  }
  if (peopleContext === "date") {
    if (tags.includes("cozy") || tags.includes("scenic")) return 10;
    if (tags.includes("great food") || tags.includes("wine")) return 8;
  }
  if (peopleContext === "family") {
    if (tags.includes("kid-friendly") || tags.includes("outdoors")) return 10;
    if (tags.includes("food") || tags.includes("flexible")) return 8;
  }
  if (peopleContext === "solo") {
    if (tags.includes("coffee") || tags.includes("books") || tags.includes("quiet")) return 10;
    if (tags.includes("walkable") || tags.includes("culture")) return 8;
  }
  return place.openStatus === "open" ? 5 : 2;
};

const placeRoles = (place: Place) => {
  const tags = [...place.vibeTags, ...place.practicalTags, ...place.goodFor, place.category.toLowerCase()];
  const has = (values: string[]) => tags.some((tag) => values.some((value) => tag.includes(value)));
  const roles: string[] = [];

  if (has(["active", "games", "arcade", "bowling", "show", "theatre"])) roles.push("activity");
  if (has(["dinner", "food", "restaurant", "cafe", "coffee", "dessert", "brunch"])) roles.push("food");
  if (has(["cocktails", "wine", "bar", "drinks", "rooftop"])) roles.push("drink");
  if (has(["outdoors", "park", "scenic", "views", "riverfront", "courtyard"])) roles.push("outdoors");
  if (has(["shopping", "gifts", "books", "boutique", "market"])) roles.push("shopping");
  if (has(["culture", "museum", "historic", "art", "creative", "weird", "memorable"])) roles.push("culture");

  return roles.length ? roles : [place.category.split(" - ")[0].toLowerCase()];
};

const diversityScore = (place: Place, selected: Place[]) => {
  const selectedRoles = selected.flatMap(placeRoles);
  const roles = placeRoles(place);
  const newRoleCount = roles.filter((role) => !selectedRoles.includes(role)).length;
  const repeatedRoleCount = roles.length - newRoleCount;

  return newRoleCount * 14 - repeatedRoleCount * 4;
};

const pickDiversePlaces = (pool: Place[], count: number, peopleContext?: string, seed: Place[] = []) => {
  const selected = [...seed];
  const picked: Place[] = [];

  while (picked.length < count) {
    const previous = selected[selected.length - 1];
    const next = pool
      .filter((place) => !selected.some((item) => item.id === place.id))
      .map((place) => {
        const legMiles = distanceBetweenPlaces(previous, place) ?? place.distanceMiles;
        const routePenalty = previous ? legMiles * 2 : place.distanceMiles;
        const openBoost = place.openStatus === "open" ? 5 : place.openStatus === "opening_soon" ? 2 : -8;

        return {
          place,
          score: categoryWeight(place, peopleContext) * 5 + diversityScore(place, selected) + openBoost - routePenalty
        };
      })
      .sort((a, b) => b.score - a.score || a.place.distanceMiles - b.place.distanceMiles)[0]?.place;

    if (!next) break;
    picked.push(next);
    selected.push(next);
  }

  return picked;
};

const sequencePlaces = (anchor: Place, candidates: Place[], count: number, peopleContext?: string) => {
  const deduped = [anchor, ...candidates].filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index);
  if (count <= 1) return deduped.slice(0, 1);

  return [anchor, ...pickDiversePlaces(deduped.filter((place) => place.id !== anchor.id), count - 1, peopleContext, [anchor])];
};

const buildStops = (selectedPlaces: Place[], startTime: string): PlanStop[] => {
  let cursor = parseTime(startTime);

  return selectedPlaces.map((place, index) => {
    const duration = durationFor(place);
    const previous = selectedPlaces[index - 1];
    const legMiles = index === 0 ? 0 : distanceBetweenPlaces(previous, place) ?? previous?.distanceMiles ?? place.distanceMiles;
    const travelGap = index === 0 ? 0 : Math.max(10, Math.round(legMiles * 8 + 5));
    if (index > 0) cursor += travelGap;

    const stop: PlanStop = {
      id: makeId("stop"),
      placeId: place.id,
      time: formatTime(cursor),
      durationMinutes: duration,
      distanceFromPreviousMiles: index === 0 ? 0 : legMiles,
      note: place.matchReason
    };

    cursor += duration;
    return stop;
  });
};

export function recalculatePlanTotals(plan: Plan, places: Place[] = defaultPlaces): Pick<Plan, "estimatedCostMin" | "estimatedCostMax" | "estimatedDurationMinutes"> {
  const stopPlaces = plan.stops.map((stop) => places.find((place) => place.id === stop.placeId)).filter((place): place is Place => Boolean(place));
  const [estimatedCostMin, estimatedCostMax] = stopPlaces.reduce<[number, number]>(
    (sum, place) => {
      const [min, max] = costFor(place);
      return [sum[0] + min, sum[1] + max];
    },
    [0, 0]
  );

  const estimatedDurationMinutes = plan.stops.reduce((sum, stop, index) => {
    const travel = index === 0 ? 0 : Math.max(10, Math.round((stop.distanceFromPreviousMiles ?? 0.8) * 10));
    return sum + stop.durationMinutes + travel;
  }, 0);

  return {
    estimatedCostMin,
    estimatedCostMax,
    estimatedDurationMinutes
  };
}

export function generatePlan(input: GeneratePlanInput, context: PlanGenerationContext = {}): Plan {
  const places = context.places ?? defaultPlaces;
  const boards = context.boards ?? defaultBoards;
  const anchor = findAnchor(input, places, boards) ?? places[0];
  const candidates = candidatePlaces(input, places, boards, anchor);
  const peopleContext = input.peopleContext ?? input.user.preferences.socialStyles[0];
  const stopCount = input.planDepth === "just_this_place" ? 1 : input.planDepth === "nearby_stops" ? 3 : 5;
  const selectedPlaces = sequencePlaces(anchor, candidates, stopCount, peopleContext);
  const startTime = startTimeFor(input.when);
  const stops = buildStops(selectedPlaces, startTime);
  const backupPlaces = pickDiversePlaces(
    places.filter((place) => !selectedPlaces.some((selected) => selected.id === place.id)),
    Math.min(3, stopCount),
    peopleContext,
    selectedPlaces
  );
  const backupStops = buildStops(backupPlaces, startTime);

  const basePlan: Plan = {
    id: makeId("plan"),
    name: `${anchor.location.city} ${toTitle(peopleContext) || "Local"} Plan`,
    dateLabel: dateLabelFor(input),
    startTime,
    locationLabel: input.user.currentLocation.label,
    peopleContext,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    stops,
    backupStops,
    estimatedCostMin: 0,
    estimatedCostMax: 0,
    estimatedDurationMinutes: 0,
    explanation: `This plan uses ${anchor.name} as the anchor, keeps stops close, balances ${peopleContext} fit with practical timing, and includes backups in case the mood or logistics change.`,
    status: "draft"
  };

  return {
    ...basePlan,
    ...recalculatePlanTotals(basePlan, places)
  };
}

export function buildStopForPlace(place: Place, time: string): PlanStop {
  return {
    id: makeId("stop"),
    placeId: place.id,
    time,
    durationMinutes: durationFor(place),
    distanceFromPreviousMiles: 0.8,
    note: place.matchReason
  };
}

export function rescheduleStops(stops: PlanStop[], places: Place[], startTime: string): PlanStop[] {
  let cursor = parseTime(startTime);

  return stops.map((stop, index) => {
    const place = places.find((item) => item.id === stop.placeId);
    const previousPlace = index > 0 ? places.find((item) => item.id === stops[index - 1]?.placeId) : undefined;
    const legMiles = index === 0 ? 0 : distanceBetweenPlaces(previousPlace, place) ?? previousPlace?.distanceMiles ?? place?.distanceMiles ?? 0.8;
    const travelGap = index === 0 ? 0 : Math.max(10, Math.round(legMiles * 8 + 5));
    if (index > 0) cursor += travelGap;

    const nextStop = {
      ...stop,
      time: formatTime(cursor),
      durationMinutes: place ? durationFor(place) : stop.durationMinutes,
      distanceFromPreviousMiles:
        index === 0 || !place ? 0 : legMiles
    };

    cursor += nextStop.durationMinutes;
    return nextStop;
  });
}
