import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultBoards } from "../data/mockBoards";
import { defaultPlans } from "../data/mockPlans";
import { experienceVideos, places } from "../data/mockPlaces";
import { initialUser } from "../data/initialUser";
import type { AceType, Board, ExperienceVideo, GeneratePlanInput, LocationContext, Place, Plan, User, UserPreferences } from "../types/domain";
import { coordinatesForKnownCity, recalculatePlacesForLocation } from "../utils/location";
import { buildStopForPlace, generatePlan as buildGeneratedPlan, recalculatePlanTotals, rescheduleStops } from "../utils/plans";

const DEFAULT_BOARD_ID = "saved-places";

type ToastState = {
  message: string;
  actionLabel?: string;
};

type StoreGeneratePlanInput = Omit<GeneratePlanInput, "user">;

type AppState = {
  user: User;
  places: Place[];
  videos: ExperienceVideo[];
  boards: Board[];
  plans: Plan[];
  toast?: ToastState;
  savePlace: (placeId: string) => void;
  removeSavedPlace: (placeId: string) => void;
  addPlaceToBoard: (placeId: string, boardId: string) => void;
  removePlaceFromBoard: (placeId: string, boardId: string) => void;
  movePlaceToBoard: (placeId: string, boardId: string, removeFromSaved?: boolean) => void;
  movePlaceBetweenBoards: (placeId: string, fromBoardId: string, toBoardId: string) => void;
  createBoard: (name: string, placeIds?: string[]) => Board;
  generatePlan: (input: StoreGeneratePlanInput) => Plan;
  addStop: (planId: string, placeId: string) => void;
  removeStop: (planId: string, stopId: string) => void;
  replaceStop: (planId: string, stopId: string, newPlaceId: string) => void;
  reorderStops: (planId: string, orderedStopIds: string[]) => void;
  makePlanCheaper: (planId: string) => void;
  makePlanShorter: (planId: string) => void;
  makePlanMoreLocal: (planId: string) => void;
  makePlanMoreAdventurous: (planId: string) => void;
  makePlanMoreRelaxed: (planId: string) => void;
  updatePlanSchedule: (planId: string, dateLabel: string, startTime: string) => void;
  updatePlace: (placeId: string, patch: Partial<Place>) => void;
  upsertPlaces: (places: Place[]) => void;
  setAceProfile: (aceType: AceType, preferences: UserPreferences) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateLocationLabel: (label: string) => void;
  setCurrentLocation: (location: LocationContext) => void;
  showToast: (message: string, actionLabel?: string) => void;
  clearToast: () => void;
};

const now = () => new Date().toISOString();

const makeId = (prefix: string) => {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 100000)}`;
  return `${prefix}-${random}`;
};

const unique = <T>(values: T[]) => Array.from(new Set(values));

const coverImagesFor = (placeIds: string[], allPlaces: Place[]) =>
  placeIds
    .map((id) => allPlaces.find((place) => place.id === id)?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 5);

const reconcilePlaces = (persistedPlaces: Place[] = []) => {
  const persistedById = new Map(persistedPlaces.map((place) => [place.id, place]));
  const persistedLivePlaces = persistedPlaces.filter((place) => place.source === "google_places");

  const reconciledCuratedPlaces = places.map((place) => {
    const persisted = persistedById.get(place.id);
    if (!persisted) return place;

    return {
      ...place,
      businessStory: persisted.businessStory ?? place.businessStory,
      goodFor: persisted.goodFor ?? place.goodFor,
      vibeTags: persisted.vibeTags ?? place.vibeTags,
      parking: persisted.parking ?? place.parking,
      reservations: persisted.reservations ?? place.reservations
    };
  });

  return [...reconciledCuratedPlaces, ...persistedLivePlaces];
};

const upsertPlaceList = (currentPlaces: Place[], incomingPlaces: Place[]) => {
  if (!incomingPlaces.length) return currentPlaces;
  const nextPlaces = [...currentPlaces];
  incomingPlaces.forEach((place) => {
    const index = nextPlaces.findIndex((item) => item.id === place.id);
    if (index >= 0) {
      nextPlaces[index] = { ...nextPlaces[index], ...place };
      return;
    }
    nextPlaces.push(place);
  });
  return nextPlaces;
};

const updateBoardPlaces = (board: Board, placeIds: string[], allPlaces: Place[]) => ({
  ...board,
  placeIds: unique(placeIds),
  coverImageUrls: coverImagesFor(unique(placeIds), allPlaces),
  updatedAt: now()
});

const replacePlan = (plans: Plan[], planId: string, updater: (plan: Plan) => Plan) =>
  plans.map((plan) => (plan.id === planId ? updater(plan) : plan));

const nextStopTime = (plan: Plan) => {
  const lastStop = plan.stops[plan.stops.length - 1];
  if (!lastStop) return plan.startTime;
  return lastStop.time;
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

const candidateDiversityScore = (candidate: Place, usedPlaceIds: string[], allPlaces: Place[]) => {
  const usedPlaces = usedPlaceIds.map((id) => allPlaces.find((place) => place.id === id)).filter((place): place is Place => Boolean(place));
  const usedRoles = usedPlaces.flatMap(placeRoles);
  const candidateRoles = placeRoles(candidate);
  const newRoles = candidateRoles.filter((role) => !usedRoles.includes(role)).length;
  const repeatedRoles = candidateRoles.length - newRoles;
  const usedTags = new Set(usedPlaces.flatMap((place) => [...place.vibeTags, ...place.practicalTags, ...place.goodFor]));
  const freshTags = [...candidate.vibeTags, ...candidate.practicalTags, ...candidate.goodFor].filter((tag) => !usedTags.has(tag)).length;

  return newRoles * 10 - repeatedRoles * 3 + Math.min(8, freshTags);
};

const cheaperCandidateFor = (currentPlaceId: string, usedPlaceIds: string[], allPlaces: Place[]) => {
  const current = allPlaces.find((place) => place.id === currentPlaceId);
  if (!current) return undefined;
  const currentTags = [...current.vibeTags, ...current.practicalTags, ...current.goodFor];
  return allPlaces
    .filter((place) => !usedPlaceIds.includes(place.id) && place.costEstimateMax < current.costEstimateMax)
    .map((place) => ({
      place,
      score:
        (current.costEstimateMax - place.costEstimateMax) * 2 +
        currentTags.filter((tag) => place.vibeTags.includes(tag) || place.practicalTags.includes(tag) || place.goodFor.includes(tag)).length * 8 +
        candidateDiversityScore(place, usedPlaceIds, allPlaces) +
        (place.openStatus === "open" ? 4 : place.openStatus === "opening_soon" ? 1 : -8) -
        place.distanceMiles
    }))
    .sort((a, b) => b.score - a.score || a.place.costEstimateMax - b.place.costEstimateMax || a.place.distanceMiles - b.place.distanceMiles)[0]?.place;
};

const candidateByTags = (usedPlaceIds: string[], allPlaces: Place[], preferredTags: string[]) =>
  allPlaces
    .filter((place) => !usedPlaceIds.includes(place.id))
    .map((place) => ({
      place,
      score:
        preferredTags.filter((tag) => place.vibeTags.includes(tag) || place.practicalTags.includes(tag) || place.goodFor.includes(tag)).length * 12 +
        candidateDiversityScore(place, usedPlaceIds, allPlaces) +
        (place.openStatus === "open" ? 4 : place.openStatus === "opening_soon" ? 1 : -8) -
        place.distanceMiles
    }))
    .sort((a, b) => b.score - a.score)[0]?.place;

const normalizeUniqueStops = (stops: Plan["stops"], allPlaces: Place[], preferredTags: string[] = []) => {
  const usedPlaceIds = new Set<string>();

  return stops.map((stop) => {
    if (!usedPlaceIds.has(stop.placeId)) {
      usedPlaceIds.add(stop.placeId);
      return stop;
    }

    const currentPlace = allPlaces.find((place) => place.id === stop.placeId);
    const replacementTags = [...preferredTags, ...(currentPlace?.vibeTags ?? []), ...(currentPlace?.practicalTags ?? [])];
    const replacement = candidateByTags([...usedPlaceIds], allPlaces, replacementTags.length ? replacementTags : ["local", "social", "cozy", "culture"]);

    if (!replacement) return stop;
    usedPlaceIds.add(replacement.id);
    return { ...buildStopForPlace(replacement, stop.time), id: stop.id };
  });
};

const replaceStopInPlan = (stops: Plan["stops"], index: number, candidate: Place) =>
  stops.map((stop, stopIndex) => (stopIndex === index ? { ...buildStopForPlace(candidate, stop.time), id: stop.id } : stop));

const normalizePlanForPlaces = (plan: Plan, allPlaces: Place[]) => {
  const preferredTags = plan.peopleContext ? [plan.peopleContext] : [];
  const nextPlan = {
    ...plan,
    stops: rescheduleStops(normalizeUniqueStops(plan.stops, allPlaces, preferredTags), allPlaces, plan.startTime),
    backupStops: rescheduleStops(normalizeUniqueStops(plan.backupStops, allPlaces, preferredTags), allPlaces, plan.startTime)
  };

  return { ...nextPlan, ...recalculatePlanTotals(nextPlan, allPlaces) };
};

const protectedPlaceIdsForPlan = (plan: Plan) => (plan.sourceId && ["place", "explore"].includes(plan.sourceType) ? [plan.sourceId] : []);

const replaceableStopIndexes = (stops: Plan["stops"], plan: Plan) => {
  const protectedPlaceIds = protectedPlaceIdsForPlan(plan);
  return stops.map((stop, index) => (protectedPlaceIds.includes(stop.placeId) ? -1 : index)).filter((index) => index >= 0);
};

const closestReplaceableIndex = (indexes: number[], targetIndex: number) =>
  indexes.slice().sort((a, b) => Math.abs(a - targetIndex) - Math.abs(b - targetIndex) || a - b)[0] ?? -1;

type PlanTuneKind = "cheaper" | "shorter" | "local" | "adventurous" | "relaxed";

const costRangeForPlan = (plan: Plan) => `$${plan.estimatedCostMin}-$${plan.estimatedCostMax}`;

const durationLabelForPlan = (plan: Plan) => {
  const hours = Math.floor(plan.estimatedDurationMinutes / 60);
  const minutes = plan.estimatedDurationMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

const placeNameForStop = (stop: Plan["stops"][number], allPlaces: Place[]) => allPlaces.find((place) => place.id === stop.placeId)?.name ?? "a stop";

const changedStopSummaries = (before: Plan, after: Plan, allPlaces: Place[]) => {
  const maxLength = Math.max(before.stops.length, after.stops.length);
  const summaries: string[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const beforeStop = before.stops[index];
    const afterStop = after.stops[index];

    if (beforeStop && afterStop && beforeStop.placeId !== afterStop.placeId) {
      summaries.push(`${placeNameForStop(beforeStop, allPlaces)} became ${placeNameForStop(afterStop, allPlaces)}`);
    } else if (beforeStop && !afterStop) {
      summaries.push(`${placeNameForStop(beforeStop, allPlaces)} was removed`);
    } else if (!beforeStop && afterStop) {
      summaries.push(`${placeNameForStop(afterStop, allPlaces)} was added`);
    }
  }

  return summaries;
};

const changedPlaceTags = (before: Plan, after: Plan, allPlaces: Place[]) => {
  const beforeIds = new Set(before.stops.map((stop) => stop.placeId));
  return after.stops
    .filter((stop) => !beforeIds.has(stop.placeId))
    .map((stop) => allPlaces.find((place) => place.id === stop.placeId))
    .filter((place): place is Place => Boolean(place))
    .flatMap((place) => [...place.vibeTags, ...place.practicalTags, ...place.goodFor])
    .filter((tag, index, tags) => tags.indexOf(tag) === index)
    .slice(0, 4);
};

const averageDistance = (plan: Plan, allPlaces: Place[]) => {
  const distances = plan.stops
    .map((stop) => allPlaces.find((place) => place.id === stop.placeId)?.distanceMiles)
    .filter((distance): distance is number => typeof distance === "number");

  if (!distances.length) return undefined;
  return distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
};

const buildTuneExplanation = (kind: PlanTuneKind, before: Plan, after: Plan, allPlaces: Place[], user: User) => {
  const changes = changedStopSummaries(before, after, allPlaces);
  const tags = changedPlaceTags(before, after, allPlaces);
  const costDifference = before.estimatedCostMax - after.estimatedCostMax;
  const timeDifference = before.estimatedDurationMinutes - after.estimatedDurationMinutes;
  const beforeAverageDistance = averageDistance(before, allPlaces);
  const afterAverageDistance = averageDistance(after, allPlaces);
  const distanceDifference =
    typeof beforeAverageDistance === "number" && typeof afterAverageDistance === "number" ? beforeAverageDistance - afterAverageDistance : undefined;

  const planBasics = `Now ${after.stops.length} stops, ${durationLabelForPlan(after)}, estimated ${costRangeForPlan(after)}.`;
  const changedLine = changes.length ? `I changed ${changes.slice(0, 3).join("; ")}.` : "I kept the stop list intact because it was already the best fit available without duplicating places.";
  const tagLine = tags.length ? `The new mix leans into ${tags.join(", ")}.` : "";
  const aceLine = user.aceType ? `This still respects your ${user.aceType.name} profile and keeps recommendations near ${user.currentLocation.label}.` : `This still respects your saved preferences and keeps recommendations near ${user.currentLocation.label}.`;

  if (kind === "cheaper") {
    const savingsLine = costDifference > 0 ? `Estimated top-end cost dropped by about $${costDifference}.` : "Cost stayed about the same because there was not a clearly cheaper non-duplicate swap.";
    return [savingsLine, changedLine, tagLine, planBasics].filter(Boolean).join(" ");
  }

  if (kind === "shorter") {
    const timeLine = timeDifference > 0 ? `This trims about ${durationLabelForPlan({ ...after, estimatedDurationMinutes: timeDifference })} from the outing.` : "This keeps the plan compact without forcing an awkward replacement.";
    return [timeLine, changedLine, "The remaining stops preserve the strongest fit and reduce decision load.", planBasics].join(" ");
  }

  if (kind === "local") {
    const distanceLine =
      typeof distanceDifference === "number" && distanceDifference > 0.1
        ? `Average stop distance moved about ${distanceDifference.toFixed(1)} mi closer.`
        : "The route favors places with local, walkable, or hidden-gem signals.";
    return [distanceLine, changedLine, tagLine, aceLine, planBasics].filter(Boolean).join(" ");
  }

  if (kind === "adventurous") {
    return [changedLine, tagLine || "The route now prioritizes more memorable and discovery-friendly stops.", aceLine, planBasics].join(" ");
  }

  return [
    changedLine,
    tagLine || "The pacing now favors calmer, lower-friction places and easier transitions.",
    timeDifference > 0 ? `It also trims about ${durationLabelForPlan({ ...after, estimatedDurationMinutes: timeDifference })}.` : "",
    planBasics
  ]
    .filter(Boolean)
    .join(" ");
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      places: recalculatePlacesForLocation(places, initialUser.currentLocation),
      videos: experienceVideos,
      boards: defaultBoards,
      plans: defaultPlans,
      toast: undefined,

      savePlace: (placeId) =>
        set((state) => {
          const savedPlaceIds = unique([...state.user.savedPlaceIds, placeId]);
          const boards = state.boards.map((board) =>
            board.id === DEFAULT_BOARD_ID ? updateBoardPlaces(board, [...board.placeIds, placeId], state.places) : board
          );

          return {
            user: { ...state.user, savedPlaceIds },
            boards,
            toast: { message: "Saved to Saved Places", actionLabel: "Move to board" }
          };
        }),

      removeSavedPlace: (placeId) =>
        set((state) => {
          const savedPlaceIds = state.user.savedPlaceIds.filter((id) => id !== placeId);
          const boards = state.boards.map((board) =>
            board.id === DEFAULT_BOARD_ID ? updateBoardPlaces(board, board.placeIds.filter((id) => id !== placeId), state.places) : board
          );

          return {
            user: { ...state.user, savedPlaceIds },
            boards,
            toast: { message: "Removed from Saved Places" }
          };
        }),

      addPlaceToBoard: (placeId, boardId) =>
        set((state) => {
          const targetBoard = state.boards.find((board) => board.id === boardId);
          const savedPlaceIds = unique([...state.user.savedPlaceIds, placeId]);
          const boards = state.boards.map((board) => {
            if (board.id === boardId || board.id === DEFAULT_BOARD_ID) {
              return updateBoardPlaces(board, [...board.placeIds, placeId], state.places);
            }
            return board;
          });

          return {
            user: { ...state.user, savedPlaceIds },
            boards,
            toast: { message: `Added to ${targetBoard?.name ?? "board"}` }
          };
        }),

      removePlaceFromBoard: (placeId, boardId) =>
        set((state) => {
          const board = state.boards.find((item) => item.id === boardId);
          const savedPlaceIds = boardId === DEFAULT_BOARD_ID ? state.user.savedPlaceIds.filter((id) => id !== placeId) : state.user.savedPlaceIds;
          return {
            user: { ...state.user, savedPlaceIds },
            boards: state.boards.map((item) =>
              item.id === boardId ? updateBoardPlaces(item, item.placeIds.filter((id) => id !== placeId), state.places) : item
            ),
            toast: { message: `Removed from ${board?.name ?? "board"}` }
          };
        }),

      movePlaceToBoard: (placeId, boardId, removeFromSaved = false) =>
        set((state) => {
          const targetBoard = state.boards.find((board) => board.id === boardId);
          const boards = state.boards.map((board) => {
            if (board.id === boardId) {
              return updateBoardPlaces(board, [...board.placeIds, placeId], state.places);
            }
            if (removeFromSaved && board.id === DEFAULT_BOARD_ID) {
              return updateBoardPlaces(board, board.placeIds.filter((id) => id !== placeId), state.places);
            }
            return board;
          });

          const savedPlaceIds = removeFromSaved ? state.user.savedPlaceIds.filter((id) => id !== placeId) : unique([...state.user.savedPlaceIds, placeId]);

          return {
            user: { ...state.user, savedPlaceIds },
            boards,
            toast: { message: `Moved to ${targetBoard?.name ?? "board"}` }
          };
        }),

      movePlaceBetweenBoards: (placeId, fromBoardId, toBoardId) =>
        set((state) => {
          const targetBoard = state.boards.find((board) => board.id === toBoardId);
          const savedPlaceIds = unique([...state.user.savedPlaceIds, placeId]);
          const boards = state.boards.map((board) => {
            if (board.id === toBoardId || board.id === DEFAULT_BOARD_ID) {
              return updateBoardPlaces(board, [...board.placeIds, placeId], state.places);
            }
            if (board.id === fromBoardId) {
              return updateBoardPlaces(board, board.placeIds.filter((id) => id !== placeId), state.places);
            }
            return board;
          });

          return {
            user: { ...state.user, savedPlaceIds },
            boards,
            toast: { message: `Moved to ${targetBoard?.name ?? "board"}` }
          };
        }),

      createBoard: (name, placeIds = []) => {
        const state = get();
        const board: Board = {
          id: makeId("board"),
          name,
          description: undefined,
          locationLabel: state.user.currentLocation.label,
          vibeTags: [],
          placeIds: unique(placeIds),
          coverImageUrls: coverImagesFor(placeIds, state.places),
          createdAt: now(),
          updatedAt: now()
        };

        set((current) => ({
          boards: [...current.boards, board],
          user: { ...current.user, boardIds: unique([...current.user.boardIds, board.id]) },
          toast: { message: `${name} created` }
        }));

        return board;
      },

      generatePlan: (input) => {
        const state = get();
        const plan = buildGeneratedPlan(
          {
            ...input,
            user: state.user
          },
          {
            places: state.places,
            boards: state.boards
          }
        );

        set((current) => ({
          plans: [plan, ...current.plans],
          user: { ...current.user, planIds: unique([plan.id, ...current.user.planIds]) },
          toast: { message: "Plan created. You can edit every stop." }
        }));

        return plan;
      },

      addStop: (planId, placeId) =>
        set((state) => {
          const place = state.places.find((item) => item.id === placeId);
          if (!place) return state;
          const currentPlan = state.plans.find((plan) => plan.id === planId);
          if (currentPlan?.stops.some((stop) => stop.placeId === placeId)) {
            return { toast: { message: `${place.name} is already in this plan` } };
          }

          const plans = replacePlan(state.plans, planId, (plan) => {
            const nextPlan = {
              ...plan,
              stops: rescheduleStops([...plan.stops, buildStopForPlace(place, nextStopTime(plan))], state.places, plan.startTime)
            };
            return {
              ...nextPlan,
              ...recalculatePlanTotals(nextPlan, state.places)
            };
          });

          return { plans, toast: { message: `${place.name} added to plan` } };
        }),

      removeStop: (planId, stopId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const nextPlan = { ...plan, stops: plan.stops.filter((stop) => stop.id !== stopId) };
            return {
              ...nextPlan,
              ...recalculatePlanTotals(nextPlan, state.places)
            };
          }),
          toast: { message: "Stop removed" }
        })),

      replaceStop: (planId, stopId, newPlaceId) =>
        set((state) => {
          const place = state.places.find((item) => item.id === newPlaceId);
          if (!place) return state;
          const currentPlan = state.plans.find((plan) => plan.id === planId);
          if (currentPlan?.stops.some((stop) => stop.id !== stopId && stop.placeId === newPlaceId)) {
            return { toast: { message: `${place.name} is already in this plan` } };
          }

          const plans = replacePlan(state.plans, planId, (plan) => {
            const nextPlan = {
              ...plan,
              stops: plan.stops.map((stop) =>
                stop.id === stopId
                  ? {
                      ...buildStopForPlace(place, stop.time),
                      id: stop.id,
                      distanceFromPreviousMiles: stop.distanceFromPreviousMiles
                    }
                  : stop
              )
            };
            nextPlan.stops = rescheduleStops(nextPlan.stops, state.places, plan.startTime);

            return {
              ...nextPlan,
              ...recalculatePlanTotals(nextPlan, state.places)
            };
          });

          return { plans, toast: { message: `Replaced with ${place.name}` } };
        }),

      reorderStops: (planId, orderedStopIds) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const orderedStops = orderedStopIds
              .map((id) => plan.stops.find((stop) => stop.id === id))
              .filter((stop): stop is Plan["stops"][number] => Boolean(stop));
            const missingStops = plan.stops.filter((stop) => !orderedStopIds.includes(stop.id));
            const nextPlan = { ...plan, stops: [...orderedStops, ...missingStops] };
            nextPlan.stops = rescheduleStops(nextPlan.stops, state.places, plan.startTime);
            return {
              ...nextPlan,
              ...recalculatePlanTotals(nextPlan, state.places)
            };
          }),
          toast: { message: "Plan reordered" }
        })),

      makePlanCheaper: (planId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const beforePlan = { ...plan, ...recalculatePlanTotals(plan, state.places) };
            const baseStops = normalizeUniqueStops(plan.stops, state.places, ["$", "low effort", "walkable"]);
            const usedPlaceIds = new Set(baseStops.map((stop) => stop.placeId));
            const protectedPlaceIds = protectedPlaceIdsForPlan(plan);
            const nextStops = baseStops.map((stop) => {
              if (protectedPlaceIds.includes(stop.placeId)) return stop;
              usedPlaceIds.delete(stop.placeId);
              const cheaper = cheaperCandidateFor(stop.placeId, [...usedPlaceIds], state.places);
              if (cheaper) {
                usedPlaceIds.add(cheaper.id);
                return { ...buildStopForPlace(cheaper, stop.time), id: stop.id };
              }
              usedPlaceIds.add(stop.placeId);
              return stop;
            });
            const nextPlan = { ...plan, stops: nextStops };
            nextPlan.stops = rescheduleStops(nextPlan.stops, state.places, plan.startTime);
            const nextPlanWithTotals = { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
            return {
              ...nextPlanWithTotals,
              explanation: buildTuneExplanation("cheaper", beforePlan, nextPlanWithTotals, state.places, state.user)
            };
          }),
          toast: { message: "Plan made cheaper where possible" }
        })),

      makePlanShorter: (planId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const beforePlan = { ...plan, ...recalculatePlanTotals(plan, state.places) };
            const baseStops = normalizeUniqueStops(plan.stops, state.places, ["close", "low effort"]);
            const nextPlan = {
              ...plan,
              stops: baseStops.length > 1 ? baseStops.slice(0, -1) : baseStops
            };
            const nextPlanWithTotals = { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
            return {
              ...nextPlanWithTotals,
              explanation: buildTuneExplanation("shorter", beforePlan, nextPlanWithTotals, state.places, state.user)
            };
          }),
          toast: { message: "Plan shortened" }
        })),

      makePlanMoreLocal: (planId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const beforePlan = { ...plan, ...recalculatePlanTotals(plan, state.places) };
            const baseStops = normalizeUniqueStops(plan.stops, state.places, ["local", "hidden gem", "walkable", "seasonal"]);
            const usedPlaceIds = baseStops.map((stop) => stop.placeId);
            const candidate = candidateByTags(usedPlaceIds, state.places, ["local", "hidden gem", "walkable", "seasonal"]);
            const replaceIndex = closestReplaceableIndex(replaceableStopIndexes(baseStops, plan), Math.max(0, baseStops.length - 2));
            if (!candidate || baseStops.length === 0 || replaceIndex < 0) {
              const normalizedPlan = { ...plan, stops: rescheduleStops(baseStops, state.places, plan.startTime) };
              const normalizedPlanWithTotals = { ...normalizedPlan, ...recalculatePlanTotals(normalizedPlan, state.places) };
              return {
                ...normalizedPlanWithTotals,
                explanation: buildTuneExplanation("local", beforePlan, normalizedPlanWithTotals, state.places, state.user)
              };
            }
            const nextStops = replaceStopInPlan(baseStops, replaceIndex, candidate);
            const nextPlan = {
              ...plan,
              stops: rescheduleStops(nextStops, state.places, plan.startTime)
            };
            const nextPlanWithTotals = { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
            return {
              ...nextPlanWithTotals,
              explanation: buildTuneExplanation("local", beforePlan, nextPlanWithTotals, state.places, state.user)
            };
          }),
          toast: { message: "Plan made more local" }
        })),

      makePlanMoreAdventurous: (planId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const beforePlan = { ...plan, ...recalculatePlanTotals(plan, state.places) };
            const baseStops = normalizeUniqueStops(plan.stops, state.places, ["weird", "hidden gem", "memorable", "culture", "creative"]);
            const usedPlaceIds = baseStops.map((stop) => stop.placeId);
            const candidate = candidateByTags(usedPlaceIds, state.places, ["weird", "hidden gem", "memorable", "culture", "creative"]);
            const replaceIndex = closestReplaceableIndex(replaceableStopIndexes(baseStops, plan), Math.max(0, Math.floor(baseStops.length / 2)));
            if (!candidate || baseStops.length === 0 || replaceIndex < 0) {
              const normalizedPlan = { ...plan, stops: rescheduleStops(baseStops, state.places, plan.startTime) };
              const normalizedPlanWithTotals = { ...normalizedPlan, ...recalculatePlanTotals(normalizedPlan, state.places) };
              return {
                ...normalizedPlanWithTotals,
                explanation: buildTuneExplanation("adventurous", beforePlan, normalizedPlanWithTotals, state.places, state.user)
              };
            }
            const nextStops = replaceStopInPlan(baseStops, replaceIndex, candidate);
            const nextPlan = {
              ...plan,
              stops: rescheduleStops(nextStops, state.places, plan.startTime)
            };
            const nextPlanWithTotals = { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
            return {
              ...nextPlanWithTotals,
              explanation: buildTuneExplanation("adventurous", beforePlan, nextPlanWithTotals, state.places, state.user)
            };
          }),
          toast: { message: "Plan made more adventurous" }
        })),

      makePlanMoreRelaxed: (planId) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const beforePlan = { ...plan, ...recalculatePlanTotals(plan, state.places) };
            const baseStops = normalizeUniqueStops(plan.stops, state.places, ["cozy", "quiet", "coffee", "outdoors", "walkable"]);
            const usedPlaceIds = baseStops.map((stop) => stop.placeId);
            const candidate = candidateByTags(usedPlaceIds, state.places, ["cozy", "quiet", "coffee", "outdoors", "walkable"]);
            const indexes = replaceableStopIndexes(baseStops, plan);
            if (!candidate || baseStops.length === 0 || indexes.length === 0) {
              const normalizedPlan = { ...plan, stops: rescheduleStops(baseStops, state.places, plan.startTime) };
              const normalizedPlanWithTotals = { ...normalizedPlan, ...recalculatePlanTotals(normalizedPlan, state.places) };
              return {
                ...normalizedPlanWithTotals,
                explanation: buildTuneExplanation("relaxed", beforePlan, normalizedPlanWithTotals, state.places, state.user)
              };
            }
            const activeIndex = indexes.find((index) => {
              const stop = baseStops[index];
              const place = state.places.find((item) => item.id === stop.placeId);
              return place?.vibeTags.some((tag) => ["active", "games", "social"].includes(tag));
            });
            const replaceIndex = activeIndex ?? closestReplaceableIndex(indexes, Math.max(0, baseStops.length - 1));
            const nextStops = replaceStopInPlan(baseStops, replaceIndex, candidate).map((stop, index) =>
              index === replaceIndex ? { ...stop, durationMinutes: 60 } : stop
            );
            const nextPlan = {
              ...plan,
              stops: rescheduleStops(nextStops, state.places, plan.startTime)
            };
            const nextPlanWithTotals = { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
            return {
              ...nextPlanWithTotals,
              explanation: buildTuneExplanation("relaxed", beforePlan, nextPlanWithTotals, state.places, state.user)
            };
          }),
          toast: { message: "Plan made more relaxed" }
        })),

      updatePlanSchedule: (planId, dateLabel, startTime) =>
        set((state) => ({
          plans: replacePlan(state.plans, planId, (plan) => {
            const nextPlan = {
              ...plan,
              dateLabel,
              startTime,
              stops: rescheduleStops(plan.stops, state.places, startTime),
              backupStops: rescheduleStops(plan.backupStops, state.places, startTime)
            };
            return { ...nextPlan, ...recalculatePlanTotals(nextPlan, state.places) };
          }),
          toast: { message: "Plan schedule updated" }
        })),

      updatePlace: (placeId, patch) =>
        set((state) => ({
          places: state.places.map((place) => (place.id === placeId ? { ...place, ...patch } : place)),
          toast: { message: "Business profile updated" }
        })),

      upsertPlaces: (incomingPlaces) =>
        set((state) => ({
          places: upsertPlaceList(state.places, incomingPlaces)
        })),

      setAceProfile: (aceType, preferences) =>
        set((state) => ({
          user: {
            ...state.user,
            aceType,
            preferences
          },
          toast: { message: `${aceType.name} saved` }
        })),

      updatePreferences: (patch) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: {
              ...state.user.preferences,
              ...patch
            }
          },
          toast: { message: "Preferences updated" }
        })),

      updateLocationLabel: (label) =>
        set((state) => {
          const [cityPart, statePart] = label.split(",").map((part) => part.trim());
          const knownCoordinates = coordinatesForKnownCity(label);
          const location = {
            ...state.user.currentLocation,
            label,
            city: cityPart || state.user.currentLocation.city,
            state: statePart || state.user.currentLocation.state,
            lat: knownCoordinates?.lat,
            lng: knownCoordinates?.lng,
            mode: "manual_city" as const
          };
          const placesForLocation = recalculatePlacesForLocation(state.places, location);
          return {
            user: {
              ...state.user,
              currentLocation: location
            },
            places: placesForLocation,
            toast: { message: `Location set to ${label}` }
          };
        }),

      setCurrentLocation: (location) =>
        set((state) => {
          const placesForLocation = recalculatePlacesForLocation(state.places, location);

          return {
            user: {
              ...state.user,
              currentLocation: location
            },
            places: placesForLocation,
            boards: state.boards.map((board) => ({
              ...board,
              locationLabel: board.locationLabel ?? location.label,
              coverImageUrls: coverImagesFor(board.placeIds, placesForLocation)
            })),
            toast: { message: `Sorted by proximity to ${location.city || "you"}` }
          };
        }),

      showToast: (message, actionLabel) => set({ toast: { message, actionLabel } }),

      clearToast: () => set({ toast: undefined })
    }),
    {
      name: "ace-app-state",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        boards: state.boards,
        plans: state.plans,
        places: state.places
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<Pick<AppState, "user" | "boards" | "plans" | "places">>;
        const mergedUser = persistedState.user ?? current.user;
        const mergedPlaces = recalculatePlacesForLocation(reconcilePlaces(persistedState.places), mergedUser.currentLocation);
        const mergedBoards = (persistedState.boards ?? current.boards).map((board) => ({
          ...board,
          coverImageUrls: coverImagesFor(board.placeIds, mergedPlaces)
        }));
        const mergedPlans = (persistedState.plans ?? current.plans).map((plan) => normalizePlanForPlaces(plan, mergedPlaces));

        return {
          ...current,
          ...persistedState,
          user: mergedUser,
          places: mergedPlaces,
          videos: experienceVideos,
          boards: mergedBoards,
          plans: mergedPlans,
          toast: undefined
        };
      },
      migrate: () => ({
        user: initialUser,
        places: recalculatePlacesForLocation(places, initialUser.currentLocation),
        videos: experienceVideos,
        boards: defaultBoards,
        plans: defaultPlans,
        toast: undefined
      })
    }
  )
);
