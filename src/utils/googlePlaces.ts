import type { Place, PriceRange, User } from "../types/domain";
import { estimateTravelMinutes, milesBetween, roundedMiles } from "./location";

type GoogleAttribution = {
  displayName?: string;
  uri?: string;
};

type GooglePlaceResult = {
  id?: string;
  name?: string;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  lat?: number;
  lng?: number;
  primaryType?: string;
  types?: string[];
  priceLevel?: string;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  currentWeekdayDescriptions?: string[];
  regularWeekdayDescriptions?: string[];
  photoName?: string;
  photoAttributions?: GoogleAttribution[];
  googleMapsUri?: string;
};

type GooglePlacesResponse = {
  places?: GooglePlaceResult[];
  source?: string;
};

type FetchGooglePlacesInput = {
  query: string;
  user: User;
  pageSize?: number;
};

const fallbackImageByIntent = {
  food: "https://images.squarespace-cdn.com/content/v1/5f19f7796eed36780bbe7cd6/ef8d619b-449e-4af7-8371-1b5146d0b5e8/test2021+Hungry+Asian+Catalog3991Common+Thread+1.jpg",
  drinks: "/venue-images/lost-square-social.jpg",
  outdoors: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Forsyth_fountain_2019.jpeg/1280px-Forsyth_fountain_2019.jpeg",
  culture: "https://savannahtheatre.com/wp-content/uploads/2024/09/auditorium-3600x2000-for-home-new-scaled.jpg",
  shopping: "https://cdn.shoplightspeed.com/shops/643137/files/74883046/visitus.jpg",
  active: "https://images.ctfassets.net/6gvyj3hhelpa/xF08H5qsg7Q86uwax7ZtG/2e38a1286f01f0c64cef661daf610baa/bowlero-bowling.jpg"
};

const priceLevelMap: Record<string, PriceRange> = {
  PRICE_LEVEL_FREE: "$",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
};

const normalize = (value: string) => value.toLowerCase().replace(/_/g, " ");

const titleCase = (value: string) =>
  normalize(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function includesAny(values: string[], targets: string[]) {
  return values.some((value) => targets.some((target) => value.includes(target)));
}

function classifyPlace(types: string[], query: string) {
  const signals = [...types.map(normalize), normalize(query)];
  const vibeTags = new Set<string>(["local", "nearby"]);
  const practicalTags = new Set<string>(["google maps"]);
  const goodFor = new Set<string>(["friends", "visitors"]);

  if (includesAny(signals, ["restaurant", "meal", "food", "bakery", "cafe"])) {
    vibeTags.add("great food");
    vibeTags.add("cozy");
    practicalTags.add("food");
    goodFor.add("date");
    goodFor.add("family");
  }

  if (includesAny(signals, ["bar", "night club", "liquor", "wine"])) {
    vibeTags.add("cocktails");
    vibeTags.add("social");
    practicalTags.add("drinks");
    goodFor.add("groups");
  }

  if (includesAny(signals, ["park", "tourist attraction", "natural feature"])) {
    vibeTags.add("outdoors");
    vibeTags.add("scenic");
    practicalTags.add("walkable");
    goodFor.add("solo");
  }

  if (includesAny(signals, ["museum", "art gallery", "movie theater", "performing arts", "library"])) {
    vibeTags.add("culture");
    vibeTags.add("memorable");
    goodFor.add("solo");
    goodFor.add("date");
  }

  if (includesAny(signals, ["store", "shopping", "book store", "clothing"])) {
    vibeTags.add("shopping");
    vibeTags.add("creative");
    practicalTags.add("browse");
  }

  if (includesAny(signals, ["bowling", "amusement", "arcade", "stadium"])) {
    vibeTags.add("active");
    vibeTags.add("fun");
    practicalTags.add("games");
    goodFor.add("groups");
  }

  return {
    vibeTags: Array.from(vibeTags),
    practicalTags: Array.from(practicalTags),
    goodFor: Array.from(goodFor)
  };
}

function fallbackImageFor(types: string[], query: string) {
  const signals = [...types.map(normalize), normalize(query)];
  if (includesAny(signals, ["bar", "wine", "cocktail", "night"])) return fallbackImageByIntent.drinks;
  if (includesAny(signals, ["park", "outdoor", "scenic"])) return fallbackImageByIntent.outdoors;
  if (includesAny(signals, ["museum", "art", "theater", "culture"])) return fallbackImageByIntent.culture;
  if (includesAny(signals, ["shopping", "store", "market"])) return fallbackImageByIntent.shopping;
  if (includesAny(signals, ["bowling", "arcade", "game", "active"])) return fallbackImageByIntent.active;
  return fallbackImageByIntent.food;
}

function estimateCost(priceRange: PriceRange) {
  if (priceRange === "$") return { min: 0, max: 20 };
  if (priceRange === "$$") return { min: 15, max: 40 };
  if (priceRange === "$$$") return { min: 35, max: 80 };
  return { min: 70, max: 140 };
}

function slugFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mapGooglePlaceToPlace(result: GooglePlaceResult, user: User, query: string, index: number): Place | undefined {
  if (!result.id || !result.name) return undefined;

  const types = result.types ?? [];
  const category = result.primaryType ?? (types[0] ? titleCase(types[0]) : "Local Place");
  const distance = milesBetween(user.currentLocation, { lat: result.lat, lng: result.lng });
  const distanceMiles = typeof distance === "number" ? roundedMiles(distance) : Math.max(0.4, index + 1);
  const travelMinutes = estimateTravelMinutes(distanceMiles);
  const priceRange = result.priceLevel ? (priceLevelMap[result.priceLevel] ?? "$$") : "$$";
  const cost = estimateCost(priceRange);
  const tags = classifyPlace(types, query);
  const weekdayDescriptions = result.currentWeekdayDescriptions?.length ? result.currentWeekdayDescriptions : result.regularWeekdayDescriptions;
  const openStatus = typeof result.openNow === "boolean" ? (result.openNow ? "open" : "closed") : "opening_soon";

  return {
    id: `google-${slugFor(result.id)}`,
    source: "google_places",
    googlePlaceId: result.id,
    googleMapsUri: result.googleMapsUri,
    googlePhotoName: result.photoName,
    googlePhotoAttributions: result.photoAttributions ?? [],
    name: result.name,
    category,
    description: `${result.name} is a live Google Places result near ${user.currentLocation.label}.`,
    location: {
      ...user.currentLocation,
      lat: result.lat,
      lng: result.lng,
      mode: "near_me"
    },
    address: result.formattedAddress ?? result.shortFormattedAddress,
    distanceMiles,
    travelMinutes,
    priceRange,
    openStatus,
    hours: weekdayDescriptions?.[0] ?? "Hours available on Google Maps",
    bestTimeToGo: query.toLowerCase().includes("tonight") ? "Tonight" : "When it fits your route",
    goodFor: tags.goodFor,
    vibeTags: tags.vibeTags,
    practicalTags: tags.practicalTags,
    imageUrl: fallbackImageFor(types, query),
    galleryUrls: [fallbackImageFor(types, query)],
    videoIds: [],
    rating: result.rating ?? 4.4,
    reviewCount: result.userRatingCount ?? 0,
    reviews: [],
    parking: "Check Google Maps",
    reservations: "Check Google Maps",
    dressVibe: "Casual",
    worthItIf: `You want a real, nearby option that matches "${query}".`,
    maybeSkipIf: "You want more curated editorial context before deciding.",
    matchReason: `Live Google result near ${user.currentLocation.label}, sorted with your ACE preferences and proximity.`,
    costEstimateMin: cost.min,
    costEstimateMax: cost.max
  };
}

export async function fetchGooglePlaces({ query, user, pageSize = 10 }: FetchGooglePlacesInput) {
  const params = new URLSearchParams({
    query,
    locationLabel: user.currentLocation.label,
    pageSize: String(pageSize)
  });

  if (typeof user.currentLocation.lat === "number" && typeof user.currentLocation.lng === "number") {
    params.set("lat", String(user.currentLocation.lat));
    params.set("lng", String(user.currentLocation.lng));
  }

  const response = await fetch(`/api/google-places?${params.toString()}`);
  if (!response.ok) return [];

  const data = (await response.json()) as GooglePlacesResponse;
  return (data.places ?? [])
    .map((place, index) => mapGooglePlaceToPlace(place, user, query, index))
    .filter((place): place is Place => Boolean(place));
}
