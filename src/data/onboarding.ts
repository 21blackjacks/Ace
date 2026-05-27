import type { AceType, BudgetPreference, NoveltyLevel, UserPreferences } from "../types/domain";

export const ONBOARDING_COMPLETE_KEY = "ace_onboarding_complete";
export const ONBOARDING_PREFERENCES_KEY = "ace_user_preferences";

export type ACEBudgetPreference = "$" | "$$" | "$$$" | "$$$$";
export type ComfortZone = "safe" | "balanced" | "adventurous" | "very_adventurous";

export type ACEUserPreferences = {
  onboardingComplete: boolean;
  aceType: string;
  aceTypeDescription: string;
  topTraits: string[];
  vibePreferences: string[];
  planningStyle: string;
  budgetPreference: ACEBudgetPreference;
  comfortZone: ComfortZone;
  socialStyle: string;
  planFriction: string[];
  selectedBonusTags: string[];
};

export type OnboardingAnswer = {
  id: string;
  label: string;
  traits: string[];
  comfortZone?: ComfortZone;
  image?: string;
  alt?: string;
};

export type OnboardingQuestion = {
  id: string;
  question: string;
  imageCards?: boolean;
  options: OnboardingAnswer[];
};

export type ACETypeResult = {
  id: string;
  name: string;
  description: string;
  topTraits: string[];
  matchTraits: string[];
  vibePreferences: string[];
  planningStyle: string;
  comfortZone: ComfortZone;
  socialStyle: string;
  planFriction: string[];
  recommendationStyle: string;
  tieComfortZones?: ComfortZone[];
  tiePlanningTraits?: string[];
};

const venueImage = {
  rooftop: "/venue-images/lost-square-social.jpg",
  scenic: "/venue-images/lost-square-3.jpg",
  local: "https://cdn.shoplightspeed.com/shops/643137/files/74883046/visitus.jpg",
  cozy: "https://images.ctfassets.net/ph4gbgsekqey/7mai9NEplLAztyD7FN2Cp6/b927d1e49615aacfa8cd05ca6928b473/georgia_E.Shaver_Books.jpg?w=1500&h=843&fm=webp",
  culture: "https://images.squarespace-cdn.com/content/v1/5e4971b48ae6b644168a2dac/f6165e26-a997-4b40-8b6b-eeb42ada8757/IMG_0006+copy.jpg",
  playful: "https://images.ctfassets.net/6gvyj3hhelpa/xF08H5qsg7Q86uwax7ZtG/2e38a1286f01f0c64cef661daf610baa/bowlero-bowling.jpg"
};

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "free_afternoon",
    question: "You suddenly have a free afternoon. What sounds most appealing?",
    options: [
      { id: "q1_new_exciting", label: "Explore somewhere new and exciting", traits: ["adventurous", "curious", "novelty"] },
      { id: "q1_cozy_calm", label: "Relax somewhere cozy and calm", traits: ["cozy", "calm", "low_effort"] },
      { id: "q1_outside_active", label: "Get outside and be active", traits: ["outdoors", "active", "energetic"] },
      { id: "q1_fun_spontaneous", label: "Try something fun and spontaneous", traits: ["playful", "social", "spontaneous"] },
      { id: "q1_creative_cultural", label: "Dive into something creative or cultural", traits: ["creative", "culture", "inspired"] }
    ]
  },
  {
    id: "place_vibe",
    question: "Which place vibe draws you in the most?",
    imageCards: true,
    options: [
      { id: "q2_trendy_lively", label: "Trendy & lively", traits: ["social", "trendy", "energetic"], image: venueImage.rooftop, alt: "Lively rooftop patio with friends" },
      { id: "q2_cozy_chill", label: "Cozy & chill", traits: ["cozy", "quiet", "low_effort"], image: venueImage.cozy, alt: "Warm local bookstore interior" },
      { id: "q2_nature_scenic", label: "Nature & scenic", traits: ["outdoors", "scenic", "peaceful"], image: venueImage.scenic, alt: "Scenic waterfront view at sunset" },
      { id: "q2_arts_culture", label: "Arts & culture", traits: ["creative", "culture", "curious"], image: venueImage.culture, alt: "Creative museum and oddities display" },
      { id: "q2_local_authentic", label: "Local & authentic", traits: ["local", "hidden_gem", "authentic"], image: venueImage.local, alt: "Local Savannah storefront" },
      { id: "q2_fun_playful", label: "Fun & playful", traits: ["playful", "active", "group_friendly"], image: venueImage.playful, alt: "Bowling alley with arcade energy" }
    ]
  },
  {
    id: "group_chat_role",
    question: "In a group chat planning something, you're usually the one who...",
    options: [
      { id: "q3_starter", label: "Finds the ideas and gets things started", traits: ["initiator", "social", "discovery"] },
      { id: "q3_planner", label: "Plans the details and makes it happen", traits: ["planner", "structured", "confident"] },
      { id: "q3_decider", label: "Keeps the group decided and on track", traits: ["decisive", "practical", "organized"] },
      { id: "q3_flow", label: "Goes with the flow and keeps it fun", traits: ["flexible", "social", "easygoing"] },
      { id: "q3_show_up", label: "Lets others decide and just shows up", traits: ["low_effort", "decision_fatigue", "trust_needs"] }
    ]
  },
  {
    id: "worth_it_factor",
    question: "A place feels most worth it when...",
    options: [
      { id: "q4_unique", label: "It feels unique and a little unexpected", traits: ["novelty", "hidden_gem", "experience_value"] },
      { id: "q4_quality", label: "It is high quality and worth spending more for", traits: ["quality", "premium", "experience_value"] },
      { id: "q4_value", label: "It is good value for what I pay", traits: ["budget_aware", "practical", "value"] },
      { id: "q4_memories", label: "It creates great memories with people", traits: ["social", "memory_making", "group_friendly"] },
      { id: "q4_vibe", label: "It matches the vibe I'm in", traits: ["mood_match", "vibe_first", "personal_fit"] }
    ]
  },
  {
    id: "plan_ruiner",
    question: "What's most likely to ruin a plan for you?",
    options: [
      { id: "q5_crowded", label: "Crowded and overwhelming", traits: ["avoid_crowds", "sensory_comfort", "calm_preference"] },
      { id: "q5_overpriced", label: "Overpriced for what it is", traits: ["budget_sensitive", "value_focused"] },
      { id: "q5_wrong_mood", label: "Not what I was in the mood for", traits: ["mood_match", "fit_sensitive"] },
      { id: "q5_bad_service", label: "Bad service or rude staff", traits: ["service_sensitive", "trust_needs"] },
      { id: "q5_inconvenient", label: "Too far or inconvenient", traits: ["low_effort", "distance_sensitive", "convenience"] },
      { id: "q5_lack_info", label: "Lack of good information before I go", traits: ["info_needs", "trust_needs", "planning_support"] }
    ]
  },
  {
    id: "comfort_zone",
    question: "How would you describe your comfort zone?",
    options: [
      { id: "q6_love_new", label: "I love trying new things and new places", comfortZone: "very_adventurous", traits: ["adventurous", "novelty", "explorer"] },
      { id: "q6_mix", label: "I like a mix of familiar and new", comfortZone: "balanced", traits: ["balanced", "curious", "trust_aware"] },
      { id: "q6_familiar", label: "I prefer familiar and reliable", comfortZone: "safe", traits: ["reliable", "comfort", "low_risk"] },
      { id: "q6_stick_to_known", label: "I stick to what I know and love", comfortZone: "safe", traits: ["loyal", "comfort", "repeatable"] }
    ]
  }
];

export const bonusTags = [
  "Foodie",
  "Coffee lover",
  "Outdoor lover",
  "Night owl",
  "Early bird",
  "Culture seeker",
  "Adventure lover",
  "Budget conscious",
  "Luxury enjoyer",
  "Solo traveler",
  "Group planner",
  "Pet-friendly places",
  "Family-friendly places",
  "Hidden gems",
  "Live music",
  "Photo-worthy spots",
  "Low-crowd places"
];

const bonusTagTraitMap: Record<string, string> = {
  Foodie: "foodie",
  "Coffee lover": "cozy",
  "Outdoor lover": "outdoors",
  "Night owl": "nightlife",
  "Early bird": "daytime",
  "Culture seeker": "culture",
  "Adventure lover": "adventurous",
  "Budget conscious": "budget_sensitive",
  "Luxury enjoyer": "premium",
  "Solo traveler": "solo",
  "Group planner": "planner",
  "Pet-friendly places": "pet_friendly",
  "Family-friendly places": "family_friendly",
  "Hidden gems": "hidden_gem",
  "Live music": "energetic",
  "Photo-worthy spots": "photo_worthy",
  "Low-crowd places": "avoid_crowds"
};

export const onboardingAceTypes: ACETypeResult[] = [
  {
    id: "cozy-curator",
    name: "The Cozy Curator",
    description: "You love calm, atmospheric places with thoughtful details, good lighting, and low-stress plans.",
    topTraits: ["Cozy", "Calm", "Low Effort", "Quiet", "Thoughtful"],
    vibePreferences: ["cozy", "calm", "low effort", "quiet", "thoughtful"],
    matchTraits: ["cozy", "calm", "quiet", "low_effort", "mood_match", "avoid_crowds", "sensory_comfort", "calm_preference"],
    recommendationStyle: "Prioritize cozy spaces, quiet cafes, intimate restaurants, low-stress plans, and nearby hidden gems.",
    planningStyle: "low-stress",
    comfortZone: "safe",
    socialStyle: "calm",
    planFriction: ["crowds", "noise", "high effort"],
    tieComfortZones: ["safe", "balanced"],
    tiePlanningTraits: ["low_effort", "trust_needs"]
  },
  {
    id: "social-adventurer",
    name: "The Social Adventurer",
    description: "You crave fun, local flavor, and new experiences with your people.",
    topTraits: ["Fun", "Social", "Energetic", "Local", "Spontaneous"],
    vibePreferences: ["fun", "social", "energetic", "local", "spontaneous"],
    matchTraits: ["social", "playful", "group_friendly", "energetic", "spontaneous", "memory_making"],
    recommendationStyle: "Prioritize group-friendly activities, lively restaurants, events, games, and social places near you.",
    planningStyle: "spontaneous",
    comfortZone: "adventurous",
    socialStyle: "friends",
    planFriction: ["boring plans", "overplanning"],
    tieComfortZones: ["adventurous", "very_adventurous"],
    tiePlanningTraits: ["social", "initiator", "flexible"]
  },
  {
    id: "curious-wanderer",
    name: "The Curious Wanderer",
    description: "You love discovering places with personality, story, and local texture.",
    topTraits: ["Local", "Curious", "Unique", "Culture", "Hidden Gem"],
    vibePreferences: ["local", "curious", "unique", "culture", "hidden gem"],
    matchTraits: ["curious", "local", "hidden_gem", "authentic", "culture", "novelty", "explorer"],
    recommendationStyle: "Prioritize local businesses, hidden gems, cultural spaces, markets, and unusual experiences.",
    planningStyle: "discovery-first",
    comfortZone: "very_adventurous",
    socialStyle: "flexible",
    planFriction: ["generic lists", "tourist traps"],
    tieComfortZones: ["very_adventurous", "adventurous"],
    tiePlanningTraits: ["discovery", "curious"]
  },
  {
    id: "soft-planner",
    name: "The Soft Planner",
    description: "You like thoughtful plans that feel intentional, realistic, and easy to follow.",
    topTraits: ["Planned", "Balanced", "Trustworthy", "Smooth", "Intentional"],
    vibePreferences: ["planned", "balanced", "trustworthy", "smooth", "intentional"],
    matchTraits: ["planner", "structured", "organized", "planning_support", "trust_needs", "balanced"],
    recommendationStyle: "Prioritize plan-ready places, clear details, reliable options, route-friendly locations, and backup suggestions.",
    planningStyle: "structured",
    comfortZone: "balanced",
    socialStyle: "planner",
    planFriction: ["unclear details", "bad timing", "no backup"],
    tieComfortZones: ["balanced"],
    tiePlanningTraits: ["planner", "organized", "structured"]
  },
  {
    id: "comfort-loyalist",
    name: "The Comfort Loyalist",
    description: "You like places that feel reliable, familiar, and worth the effort without too many surprises.",
    topTraits: ["Reliable", "Comfortable", "Easy", "Familiar", "Low Risk"],
    vibePreferences: ["reliable", "comfortable", "easy", "familiar", "low risk"],
    matchTraits: ["reliable", "comfort", "low_risk", "loyal", "repeatable", "convenience", "safe"],
    recommendationStyle: "Prioritize highly reviewed places, nearby options, easy parking, familiar categories, and low-friction plans.",
    planningStyle: "reliable",
    comfortZone: "safe",
    socialStyle: "familiar",
    planFriction: ["inconvenience", "bad value", "unreliable info"],
    tieComfortZones: ["safe"],
    tiePlanningTraits: ["practical", "trust_needs"]
  },
  {
    id: "experience-collector",
    name: "The Experience Collector",
    description: "You love places that create stories, photos, memories, and moments worth talking about later.",
    topTraits: ["Memorable", "Visual", "Quality", "Inspired", "Story-Worthy"],
    vibePreferences: ["memorable", "visual", "quality", "inspired", "story-worthy"],
    matchTraits: ["experience_value", "premium", "photo_worthy", "memory_making", "quality", "inspired"],
    recommendationStyle: "Prioritize scenic locations, visual restaurants, events, pop-ups, premium experiences, and creator-reviewed places.",
    planningStyle: "moment-driven",
    comfortZone: "adventurous",
    socialStyle: "story-led",
    planFriction: ["forgettable places", "low quality"],
    tieComfortZones: ["adventurous", "very_adventurous"],
    tiePlanningTraits: ["confident", "inspired"]
  }
];

export const defaultOnboardingPreferences: ACEUserPreferences = {
  onboardingComplete: true,
  aceType: "The Open Explorer",
  aceTypeDescription: "You are open to discovering places and plans that fit your moment.",
  topTraits: ["Open", "Curious", "Flexible"],
  vibePreferences: ["local", "popular", "nearby"],
  planningStyle: "flexible",
  budgetPreference: "$$",
  comfortZone: "balanced",
  socialStyle: "flexible",
  planFriction: [],
  selectedBonusTags: []
};

const normalizeBonusTag = (tag: string) => bonusTagTraitMap[tag] ?? tag.toLowerCase().replace(/\s+/g, "_");

export const allOnboardingAnswers = onboardingQuestions.flatMap((question) => question.options);

const answerById = (answerId: string) => allOnboardingAnswers.find((answer) => answer.id === answerId);

const increment = (counts: Record<string, number>, trait: string, amount = 1) => {
  counts[trait] = (counts[trait] ?? 0) + amount;
};

const planningStyleFromTraits = (traits: string[]) => {
  if (traits.includes("planner") || traits.includes("structured")) return "structured";
  if (traits.includes("initiator") || traits.includes("discovery")) return "initiator";
  if (traits.includes("decisive") || traits.includes("organized")) return "decisive";
  if (traits.includes("low_effort") || traits.includes("decision_fatigue")) return "low-effort";
  return "flexible";
};

const socialStyleFromTraits = (traits: string[]) => {
  if (traits.includes("social") || traits.includes("group_friendly")) return "friends";
  if (traits.includes("solo")) return "solo";
  if (traits.includes("family_friendly")) return "family";
  return "flexible";
};

const frictionFromTraits = (traits: string[]) => {
  const friction: string[] = [];
  if (traits.includes("avoid_crowds") || traits.includes("sensory_comfort")) friction.push("crowds");
  if (traits.includes("budget_sensitive") || traits.includes("value_focused")) friction.push("overpriced places");
  if (traits.includes("mood_match") || traits.includes("fit_sensitive")) friction.push("wrong mood");
  if (traits.includes("service_sensitive") || traits.includes("trust_needs")) friction.push("weak trust signals");
  if (traits.includes("distance_sensitive") || traits.includes("convenience")) friction.push("inconvenience");
  if (traits.includes("info_needs") || traits.includes("planning_support")) friction.push("missing details");
  return Array.from(new Set(friction));
};

export function calculateACEType(answers: Record<string, string>, selectedBonusTags: string[], budget: ACEBudgetPreference) {
  const traitCounts: Record<string, number> = {};
  const selectedAnswers = Object.values(answers).map(answerById).filter((answer): answer is OnboardingAnswer => Boolean(answer));
  const selectedTraits = selectedAnswers.flatMap((answer) => answer.traits);
  const comfortZone = selectedAnswers.find((answer) => answer.comfortZone)?.comfortZone ?? "balanced";

  selectedAnswers.forEach((answer) => {
    answer.traits.forEach((trait) => increment(traitCounts, trait));
    if (answer.comfortZone) increment(traitCounts, answer.comfortZone);
  });

  selectedBonusTags.forEach((tag) => increment(traitCounts, normalizeBonusTag(tag)));

  if (budget === "$") increment(traitCounts, "budget_sensitive");
  if (budget === "$$$" || budget === "$$$$") increment(traitCounts, "premium");

  const ranked = onboardingAceTypes
    .map((type) => {
      const baseScore = type.matchTraits.reduce((sum, trait) => sum + (traitCounts[trait] ?? 0), 0);
      const comfortTie = type.tieComfortZones?.includes(comfortZone) ? 0.6 : 0;
      const planningTie = type.tiePlanningTraits?.some((trait) => selectedTraits.includes(trait)) ? 0.4 : 0;
      return { ...type, score: baseScore + comfortTie + planningTie };
    })
    .sort((a, b) => b.score - a.score);

  const result = ranked[0] ?? onboardingAceTypes[1];

  return {
    ...result,
    comfortZone,
    planningStyle: planningStyleFromTraits(selectedTraits),
    socialStyle: socialStyleFromTraits([...selectedTraits, ...selectedBonusTags.map(normalizeBonusTag)]),
    planFriction: frictionFromTraits(selectedTraits)
  };
}

export function preferencesForResult(result: ACETypeResult, selectedBonusTags: string[], budgetPreference: ACEBudgetPreference): ACEUserPreferences {
  return {
    onboardingComplete: true,
    aceType: result.name,
    aceTypeDescription: result.description,
    topTraits: result.topTraits,
    vibePreferences: result.vibePreferences,
    planningStyle: result.planningStyle,
    budgetPreference,
    comfortZone: result.comfortZone,
    socialStyle: result.socialStyle,
    planFriction: result.planFriction,
    selectedBonusTags
  };
}

export function aceTypeForPreferences(preferences: ACEUserPreferences): AceType {
  return {
    id: preferences.aceType.toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, "-"),
    name: preferences.aceType,
    description: preferences.aceTypeDescription,
    traits: preferences.topTraits,
    recommendationPriorities: preferences.vibePreferences.map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1))
  };
}

export function appPreferencesFromOnboarding(current: UserPreferences, preferences: ACEUserPreferences): UserPreferences {
  const budgetPreference: BudgetPreference = preferences.budgetPreference === "$$$$" ? "$$$" : preferences.budgetPreference;
  const noveltyByComfort: Record<ComfortZone, NoveltyLevel> = {
    safe: "safe",
    balanced: "slightly_new",
    adventurous: "surprise_me",
    very_adventurous: "push_comfort_zone"
  };

  return {
    ...current,
    budgetPreference,
    noveltyLevel: noveltyByComfort[preferences.comfortZone],
    vibeTags: Array.from(new Set([...preferences.vibePreferences, ...preferences.selectedBonusTags.map(normalizeBonusTag)])),
    socialStyles: Array.from(new Set([preferences.socialStyle, ...current.socialStyles])).filter(Boolean),
    trustNeeds: Array.from(new Set([...current.trustNeeds, ...preferences.planFriction])),
    effortPreference: preferences.planningStyle === "low-effort" || preferences.planFriction.includes("inconvenience") ? "low_effort" : current.effortPreference
  };
}

export function hasCompletedOnboarding() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

export function saveOnboardingPreferences(preferences: ACEUserPreferences) {
  window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
  window.localStorage.setItem(ONBOARDING_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function loadOnboardingPreferences() {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(ONBOARDING_PREFERENCES_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as ACEUserPreferences;
  } catch {
    return undefined;
  }
}
