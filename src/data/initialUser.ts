import type { User } from "../types/domain";
import { defaultAceType } from "./aceTypes";
import { defaultBoards } from "./mockBoards";
import { defaultPlans } from "./mockPlans";

export const initialUser: User = {
  id: "user-michelle",
  name: "Michelle",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=85",
  currentLocation: {
    label: "Savannah, GA",
    city: "Savannah",
    state: "GA",
    country: "US",
    lat: 32.0809,
    lng: -81.0912,
    mode: "near_me"
  },
  aceType: defaultAceType,
  preferences: {
    vibeTags: ["social", "active", "local", "cozy", "great for groups"],
    budgetPreference: "$$",
    distanceComfortMiles: 10,
    noveltyLevel: "slightly_new",
    socialStyles: ["friends", "groups", "visitors"],
    trustNeeds: ["reviews", "real visitor proof", "clear practical info"],
    effortPreference: "balanced"
  },
  savedPlaceIds: defaultBoards.find((board) => board.id === "saved-places")?.placeIds ?? [],
  boardIds: defaultBoards.map((board) => board.id),
  planIds: defaultPlans.map((plan) => plan.id)
};
