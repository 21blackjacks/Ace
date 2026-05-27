import type { Board } from "../types/domain";
import { places } from "./mockPlaces";

const now = "2026-05-18T20:00:00.000Z";

const coversFor = (placeIds: string[]) =>
  placeIds
    .map((id) => places.find((place) => place.id === id)?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 5);

export const defaultBoards: Board[] = [
  {
    id: "saved-places",
    name: "Saved Places",
    description: "Default board",
    isDefault: true,
    locationLabel: "Savannah, GA",
    vibeTags: ["default", "saved"],
    placeIds: ["stars-and-strikes", "paris-market", "common-thread", "rooftop-alida", "vault-arcade"],
    coverImageUrls: coversFor(["stars-and-strikes", "paris-market", "common-thread", "rooftop-alida", "vault-arcade"]),
    createdAt: now,
    updatedAt: now
  },
  {
    id: "girls-night",
    name: "Girls Night",
    description: "Social spots for an easy night out.",
    locationLabel: "Savannah, GA",
    vibeTags: ["friends", "social", "cocktails", "fun"],
    placeIds: [
      "rooftop-alida",
      "vault-arcade",
      "paris-market",
      "mirabelle-wine-bar",
      "common-thread",
      "starland-yard",
      "plant-riverside",
      "stars-and-strikes",
      "foxy-loxy-cafe",
      "graveface-museum",
      "savannah-theatre",
      "abercorn-street-shops"
    ],
    coverImageUrls: coversFor(["rooftop-alida", "vault-arcade", "paris-market", "mirabelle-wine-bar"]),
    createdAt: now,
    updatedAt: now
  },
  {
    id: "new-york-trip",
    name: "New York Trip",
    description: "Travel ideas to fill in later.",
    locationLabel: "New York, NY",
    vibeTags: ["travel", "city", "food"],
    placeIds: [],
    coverImageUrls: coversFor(["vault-arcade", "plant-riverside"]),
    notes: ["Use this board as a travel-planning placeholder in the MVP."],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "family-dinner",
    name: "Family Dinner",
    description: "Easy places with food, comfort, and enough flexibility.",
    locationLabel: "Savannah, GA",
    vibeTags: ["family", "food", "easy"],
    placeIds: ["starland-yard", "plant-riverside", "common-thread", "foxy-loxy-cafe", "forsyth-park"],
    coverImageUrls: coversFor(["starland-yard", "plant-riverside", "common-thread"]),
    createdAt: now,
    updatedAt: now
  },
  {
    id: "date-night-ideas",
    name: "Date Night Ideas",
    description: "Warm, scenic, and memorable places for two.",
    locationLabel: "Savannah, GA",
    vibeTags: ["date", "cozy", "romantic"],
    placeIds: ["common-thread", "mirabelle-wine-bar", "rooftop-alida", "the-grey", "savannah-theatre"],
    coverImageUrls: coversFor(["common-thread", "mirabelle-wine-bar", "rooftop-alida"]),
    createdAt: now,
    updatedAt: now
  }
];
