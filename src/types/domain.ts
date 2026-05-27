export type LocationMode = "near_me" | "manual_city" | "travel_planning";
export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type BudgetPreference = "$" | "$$" | "$$$" | "flexible";
export type OpenStatus = "open" | "closed" | "opening_soon";
export type NoveltyLevel = "safe" | "slightly_new" | "surprise_me" | "push_comfort_zone";
export type EffortPreference = "low_effort" | "balanced" | "worth_the_drive";
export type PlanSourceType = "place" | "board" | "search" | "explore" | "saved_places";
export type PlanStatus = "draft" | "upcoming" | "past";
export type PlanDepth = "just_this_place" | "nearby_stops" | "full_route";
export type PlanWhen = "tonight" | "this_weekend" | "custom";

export type LocationContext = {
  label: string;
  city: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  mode: LocationMode;
};

export type AceType = {
  id: string;
  name: string;
  description: string;
  traits: string[];
  recommendationPriorities: string[];
};

export type UserPreferences = {
  vibeTags: string[];
  budgetPreference: BudgetPreference;
  distanceComfortMiles: number;
  noveltyLevel: NoveltyLevel;
  socialStyles: string[];
  trustNeeds: string[];
  effortPreference: EffortPreference;
};

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  currentLocation: LocationContext;
  aceType?: AceType;
  preferences: UserPreferences;
  savedPlaceIds: string[];
  boardIds: string[];
  planIds: string[];
};

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  dateLabel: string;
};

export type Place = {
  id: string;
  source?: "curated" | "google_places";
  googlePlaceId?: string;
  googleMapsUri?: string;
  googlePhotoName?: string;
  googlePhotoAttributions?: {
    displayName?: string;
    uri?: string;
  }[];
  name: string;
  category: string;
  description: string;
  location: LocationContext;
  address?: string;
  distanceMiles: number;
  travelMinutes: number;
  priceRange: PriceRange;
  openStatus: OpenStatus;
  openUntil?: string;
  hours: string;
  bestTimeToGo?: string;
  goodFor: string[];
  vibeTags: string[];
  practicalTags: string[];
  imageUrl: string;
  galleryUrls: string[];
  videoIds: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  parking?: string;
  reservations?: string;
  dressVibe?: string;
  businessStory?: string;
  worthItIf: string;
  maybeSkipIf: string;
  matchReason: string;
  costEstimateMin: number;
  costEstimateMax: number;
};

export type ExperienceVideo = {
  id: string;
  placeId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl?: string;
  videoUrl?: string;
  thumbnailUrl: string;
  caption: string;
  audioLabel?: string;
  likes: number;
  comments: number;
  saves: number;
  vibeTags: string[];
  bestFor: string[];
  aceNote: string;
};

export type Board = {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  locationLabel?: string;
  vibeTags: string[];
  placeIds: string[];
  coverImageUrls: string[];
  notes?: string[];
  createdAt: string;
  updatedAt: string;
};

export type PlanStop = {
  id: string;
  placeId: string;
  time: string;
  durationMinutes: number;
  distanceFromPreviousMiles?: number;
  note?: string;
};

export type Plan = {
  id: string;
  name: string;
  dateLabel: string;
  startTime: string;
  locationLabel: string;
  peopleContext?: string;
  sourceType: PlanSourceType;
  sourceId?: string;
  stops: PlanStop[];
  backupStops: PlanStop[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  estimatedDurationMinutes: number;
  explanation: string;
  status: PlanStatus;
};

export type InterpretedQuery = {
  rawQuery: string;
  locationMode: LocationMode;
  locationLabel: string;
  socialContext?: string;
  timeContext?: string;
  budgetContext?: string;
  vibeTags: string[];
  effortLevel?: string;
  noveltyLevel?: string;
};

export type RankedPlace = {
  place: Place;
  score: number;
  reasons: string[];
};

export type GeneratePlanInput = {
  sourceType: PlanSourceType;
  sourceId?: string;
  selectedPlaceIds?: string[];
  user: User;
  when: PlanWhen;
  customDate?: string;
  planDepth: PlanDepth;
  peopleContext?: string;
  query?: string;
};
