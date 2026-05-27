import type { InterpretedQuery, Place, RankedPlace, User } from "../types/domain";
import { loadOnboardingPreferences } from "../data/onboarding";

const priceWeight: Record<string, number> = {
  "$": 1,
  "$$": 2,
  "$$$": 3,
  "$$$$": 4
};

const includesAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

const unique = <T>(values: T[]) => Array.from(new Set(values));

const normalizeSignal = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

const placeSignals = (place: Place) =>
  [place.name, place.category, place.description, place.location.city, ...place.goodFor, ...place.vibeTags, ...place.practicalTags].map(normalizeSignal);

const hasSignal = (signals: string[], target: string) => {
  const normalized = normalizeSignal(target);
  return signals.some((signal) => signal === normalized || signal.includes(normalized) || normalized.includes(signal));
};

const onboardingSignalsForUser = (user: User) => {
  const onboardingPreferences = loadOnboardingPreferences();
  const aceSignals = [
    ...(user.aceType?.traits ?? []),
    ...(user.aceType?.recommendationPriorities ?? []),
    ...(onboardingPreferences?.topTraits ?? []),
    ...(onboardingPreferences?.vibePreferences ?? []),
    ...(onboardingPreferences?.selectedBonusTags ?? [])
  ];

  return unique([...user.preferences.vibeTags, ...aceSignals].map(normalizeSignal).filter(Boolean));
};

const proximityScoreFor = (place: Place, comfortMiles: number) => {
  if (place.distanceMiles <= 1) return 34;
  if (place.distanceMiles <= 2) return 28;
  if (place.distanceMiles <= 5) return 18;
  if (place.distanceMiles <= 10) return 8;
  return -Math.min(42, (place.distanceMiles - comfortMiles) * 4);
};

const localScoreFor = (signals: string[]) => {
  let score = 0;
  if (hasSignal(signals, "local")) score += 14;
  if (hasSignal(signals, "hidden gem") || hasSignal(signals, "authentic")) score += 8;
  if (hasSignal(signals, "walkable") || hasSignal(signals, "nearby")) score += 5;
  return score;
};

const queryAsksForProximity = (interpretedQuery: InterpretedQuery) =>
  includesAny(normalizeSignal(interpretedQuery.rawQuery), ["near me", "nearby", "close", "within", "walkable", "local"]);

const queryIntentPenalty = (interpretedQuery: InterpretedQuery, signals: string[]) => {
  const raw = normalizeSignal(interpretedQuery.rawQuery);
  let penalty = 0;

  const expectsRestaurant = includesAny(raw, ["restaurant", "restaurants", "dinner"]);
  const expectsFood = expectsRestaurant || includesAny(raw, ["food", "eat", "brunch"]);
  const expectsDrink = includesAny(raw, ["drink", "drinks", "cocktail", "cocktails", "wine", "bar"]);
  const expectsOutdoors = includesAny(raw, ["outdoor", "outdoors", "outside", "park", "walk"]);
  const expectsCulture = includesAny(raw, ["culture", "museum", "show", "theatre", "art"]);
  const expectsGames = includesAny(raw, ["game", "games", "arcade", "bowling", "play"]);

  if (expectsRestaurant && !["restaurant", "dinner", "food truck", "asian fusion", "southern", "bar"].some((signal) => hasSignal(signals, signal))) penalty += 72;
  else if (expectsFood && !["food", "restaurant", "dinner", "cafe", "coffee", "waffle", "brunch"].some((signal) => hasSignal(signals, signal))) penalty += 24;

  if (expectsDrink && !["drink", "bar", "cocktail", "wine", "rooftop"].some((signal) => hasSignal(signals, signal))) penalty += 24;
  if (expectsOutdoors && !["outdoors", "park", "walkable", "scenic", "riverfront", "courtyard"].some((signal) => hasSignal(signals, signal))) penalty += 22;
  if (expectsCulture && !["culture", "museum", "show", "theatre", "art", "creative", "historic"].some((signal) => hasSignal(signals, signal))) penalty += 22;
  if (expectsGames && !["games", "arcade", "bowling", "active", "playful"].some((signal) => hasSignal(signals, signal))) penalty += 22;

  return penalty;
};

export function interpretSearchQuery(query: string, user: User): InterpretedQuery {
  const normalized = query.trim().toLowerCase();
  const vibeTags: string[] = [];

  let socialContext: string | undefined;
  if (includesAny(normalized, ["friends", "group", "girls night", "people"])) socialContext = "friends";
  if (includesAny(normalized, ["date", "partner", "romantic"])) socialContext = "date";
  if (includesAny(normalized, ["family", "kids", "children"])) socialContext = "family";
  if (includesAny(normalized, ["solo", "alone", "reset"])) socialContext = "solo";
  if (includesAny(normalized, ["visitors", "guests", "tourist"])) socialContext = "visitors";

  let timeContext: string | undefined;
  if (includesAny(normalized, ["tonight", "evening", "night"])) timeContext = "tonight";
  if (includesAny(normalized, ["weekend", "saturday", "sunday"])) timeContext = "this weekend";
  if (includesAny(normalized, ["morning", "brunch"])) timeContext = "morning";
  if (includesAny(normalized, ["afternoon"])) timeContext = "afternoon";
  if (includesAny(normalized, ["late night", "after dinner"])) timeContext = "late night";

  let budgetContext: string | undefined;
  if (includesAny(normalized, ["cheap", "free", "affordable", "budget"])) budgetContext = "$";
  if (includesAny(normalized, ["nice", "special", "splurge", "premium"])) budgetContext = "$$$";
  if (includesAny(normalized, ["not expensive", "value"])) budgetContext = "$$";

  let effortLevel: string | undefined;
  if (includesAny(normalized, ["low effort", "easy", "nearby", "close", "walkable"])) effortLevel = "low_effort";
  if (includesAny(normalized, ["worth the drive", "destination"])) effortLevel = "worth_the_drive";

  let noveltyLevel: string | undefined;
  if (includesAny(normalized, ["new", "different", "surprise", "hidden", "weird"])) noveltyLevel = "surprise_me";
  if (includesAny(normalized, ["safe", "reliable", "familiar"])) noveltyLevel = "safe";

  const vibeMap: Array<[string[], string[]]> = [
    [["cozy", "quiet", "calm"], ["cozy", "quiet"]],
    [["fun", "play", "games", "arcade", "bowling"], ["fun", "active", "games"]],
    [["food", "dinner", "restaurant", "eat", "brunch"], ["food", "great food"]],
    [["drink", "cocktail", "wine", "bar"], ["cocktails", "wine", "social"]],
    [["outdoors", "walk", "park", "outside"], ["outdoors", "walkable"]],
    [["culture", "museum", "show", "theatre", "art"], ["culture", "memorable"]],
    [["local", "savannah", "hidden gem"], ["local", "hidden gem"]],
    [["rooftop", "views", "scenic", "sunset"], ["rooftop", "scenic"]],
    [["rain", "rainy"], ["indoor", "rainy day"]]
  ];

  vibeMap.forEach(([words, tags]) => {
    if (includesAny(normalized, words)) {
      vibeTags.push(...tags);
    }
  });

  if (!vibeTags.length) {
    vibeTags.push(...user.preferences.vibeTags.slice(0, 3));
  }

  let locationMode: InterpretedQuery["locationMode"] = "near_me";
  let locationLabel = user.currentLocation.label;
  if (includesAny(normalized, ["new york", "nyc"])) {
    locationMode = "manual_city";
    locationLabel = "New York, NY";
  } else if (includesAny(normalized, ["atlanta"])) {
    locationMode = "manual_city";
    locationLabel = "Atlanta, GA";
  } else if (includesAny(normalized, ["trip", "travel"])) {
    locationMode = "travel_planning";
  }

  return {
    rawQuery: query,
    locationMode,
    locationLabel,
    socialContext,
    timeContext,
    budgetContext,
    vibeTags: unique(vibeTags),
    effortLevel,
    noveltyLevel
  };
}

export function rankPlaces(places: Place[], interpretedQuery: InterpretedQuery, user: User): RankedPlace[] {
  const onboardingSignals = onboardingSignalsForUser(user);

  return places
    .map((place) => {
      const signals = placeSignals(place);
      let score = 48;
      const reasons: string[] = [];

      const vibeMatches = interpretedQuery.vibeTags.filter((tag) => hasSignal(signals, tag));
      if (vibeMatches.length) {
        score += Math.min(vibeMatches.length * 10, 30);
        reasons.push(`Matches ${vibeMatches.slice(0, 2).join(" and ")}`);
      }

      const onboardingMatches = onboardingSignals.filter((signal) => hasSignal(signals, signal));
      if (onboardingMatches.length) {
        score += Math.min(onboardingMatches.length * 9, 36);
        reasons.push(user.aceType ? `Fits ${user.aceType.name}` : "Fits your ACE profile");
      }

      if (interpretedQuery.socialContext && place.goodFor.includes(interpretedQuery.socialContext)) {
        score += 12;
        reasons.push(`Works well for ${interpretedQuery.socialContext}`);
      } else if (interpretedQuery.socialContext) {
        score -= 10;
      }

      if (place.openStatus === "open") {
        score += 8;
      } else if (place.openStatus === "opening_soon") {
        score += 4;
      } else {
        score -= 10;
      }

      score += proximityScoreFor(place, user.preferences.distanceComfortMiles);
      if (queryAsksForProximity(interpretedQuery)) {
        score += Math.max(0, 26 - place.distanceMiles * 8);
      }
      if (place.distanceMiles <= 2) {
        reasons.push(place.distanceMiles <= 1 ? "Very close to you" : "Close to you");
      }

      const localScore = localScoreFor(signals);
      score += localScore;
      if (localScore >= 14) reasons.push("Local pick");

      const budgetTarget = interpretedQuery.budgetContext ?? user.preferences.budgetPreference;
      if (budgetTarget !== "flexible") {
        const distance = Math.abs(priceWeight[place.priceRange] - priceWeight[budgetTarget]);
        score += distance === 0 ? 8 : distance === 1 ? 3 : -8;
      }

      if (interpretedQuery.effortLevel === "low_effort" && (place.distanceMiles <= 1.2 || place.practicalTags.includes("walkable"))) {
        score += 7;
        reasons.push("Low-friction option");
      }

      if (interpretedQuery.noveltyLevel === "surprise_me" && place.vibeTags.some((tag) => ["hidden gem", "weird", "memorable", "local"].includes(tag))) {
        score += 8;
        reasons.push("Adds something different");
      }

      if (user.savedPlaceIds.includes(place.id)) {
        score += 5;
        reasons.push("Already in your saved places");
      }

      score -= queryIntentPenalty(interpretedQuery, signals);

      return {
        place,
        rawScore: score,
        score: Math.round(Math.max(1, Math.min(99, score))),
        reasons: unique(reasons).slice(0, 3)
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore || a.place.distanceMiles - b.place.distanceMiles)
    .map((ranked) => ({
      place: ranked.place,
      score: ranked.score,
      reasons: ranked.reasons
    }));
}
