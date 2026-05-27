import type { AceType, UserPreferences } from "../types/domain";

export type QuizOption = {
  id: string;
  label: string;
  signals: string[];
  aceTypeWeights: Record<string, number>;
  preferencePatch: Partial<UserPreferences>;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "free-afternoon",
    prompt: "Your free afternoon suddenly opens up. What are you doing?",
    options: [
      {
        id: "quiet-coffee",
        label: "Finding a quiet coffee shop and staying longer than planned",
        signals: ["Cozy", "Quiet", "Solo-friendly"],
        aceTypeWeights: { "cozy-curator": 3, "soft-planner": 1 },
        preferencePatch: { vibeTags: ["cozy", "quiet", "coffee"], socialStyles: ["solo"] }
      },
      {
        id: "texting-friends",
        label: "Texting friends to see who is free",
        signals: ["Social", "Group-friendly"],
        aceTypeWeights: { "social-adventurer": 3, "social-spark": 2 },
        preferencePatch: { vibeTags: ["social", "fun"], socialStyles: ["friends", "groups"] }
      },
      {
        id: "new-nearby",
        label: "Looking for something new nearby",
        signals: ["Novelty-seeking", "Nearby"],
        aceTypeWeights: { "spontaneous-localist": 3, "curious-wanderer": 2 },
        preferencePatch: { vibeTags: ["local", "hidden gem"], noveltyLevel: "surprise_me" }
      },
      {
        id: "familiar-good",
        label: "Going somewhere familiar because you know it will be good",
        signals: ["Trust", "Reliability"],
        aceTypeWeights: { "comfort-loyalist": 3, "soft-planner": 2 },
        preferencePatch: { trustNeeds: ["reviews", "predictable quality"], noveltyLevel: "safe" }
      },
      {
        id: "walk-stumble",
        label: "Taking a walk and seeing what you stumble into",
        signals: ["Spontaneous", "Low-planning"],
        aceTypeWeights: { "curious-wanderer": 3, "spontaneous-localist": 2 },
        preferencePatch: { vibeTags: ["walkable", "local"], effortPreference: "low_effort" }
      }
    ]
  },
  {
    id: "walk-into",
    prompt: "Pick the place you would walk into first.",
    options: [
      {
        id: "bookstore-cafe",
        label: "A glowing bookstore cafe with rainy windows",
        signals: ["Cozy", "Calm"],
        aceTypeWeights: { "cozy-curator": 3, "comfort-loyalist": 1 },
        preferencePatch: { vibeTags: ["cozy", "books", "coffee"], effortPreference: "low_effort" }
      },
      {
        id: "busy-patio",
        label: "A busy patio with music and people laughing",
        signals: ["Social", "Lively"],
        aceTypeWeights: { "social-spark": 3, "social-adventurer": 2 },
        preferencePatch: { vibeTags: ["social", "music", "outdoors"], socialStyles: ["friends", "groups"] }
      },
      {
        id: "tiny-local",
        label: "A tiny local spot with no sign but great reviews",
        signals: ["Hidden gem", "Local trust"],
        aceTypeWeights: { "curious-wanderer": 3, "experience-collector": 2 },
        preferencePatch: { vibeTags: ["hidden gem", "local"], trustNeeds: ["reviews", "real visitor proof"] }
      },
      {
        id: "polished-restaurant",
        label: "A polished restaurant with warm lighting",
        signals: ["Romantic", "Premium"],
        aceTypeWeights: { "soft-planner": 2, "experience-collector": 2 },
        preferencePatch: { vibeTags: ["cozy", "great food", "premium"], budgetPreference: "$$$" }
      },
      {
        id: "colorful-market",
        label: "A colorful market or pop-up event",
        signals: ["Creative", "Exploratory"],
        aceTypeWeights: { "spontaneous-localist": 2, "experience-collector": 3 },
        preferencePatch: { vibeTags: ["creative", "local", "memorable"], noveltyLevel: "push_comfort_zone" }
      }
    ]
  },
  {
    id: "group-chat",
    prompt: "Your group chat says, \"What should we do tonight?\" You become:",
    options: [
      {
        id: "three-options",
        label: "The person who sends three carefully chosen options",
        signals: ["Planner"],
        aceTypeWeights: { "soft-planner": 3, "social-spark": 1 },
        preferencePatch: { trustNeeds: ["clear practical info", "backup options"] }
      },
      {
        id: "down-anything",
        label: "The person who says \"I'm down for anything\" but secretly has opinions",
        signals: ["Flexible", "Preference-driven"],
        aceTypeWeights: { "social-adventurer": 2, "spontaneous-localist": 2 },
        preferencePatch: { effortPreference: "balanced" }
      },
      {
        id: "close-easy",
        label: "The person who wants something close and easy",
        signals: ["Convenience", "Low effort"],
        aceTypeWeights: { "comfort-loyalist": 2, "spontaneous-localist": 2 },
        preferencePatch: { distanceComfortMiles: 5, effortPreference: "low_effort" }
      },
      {
        id: "push-different",
        label: "The person who pushes for something different",
        signals: ["Novelty", "Adventure"],
        aceTypeWeights: { "curious-wanderer": 3, "experience-collector": 2 },
        preferencePatch: { noveltyLevel: "push_comfort_zone", vibeTags: ["hidden gem", "memorable"] }
      },
      {
        id: "wait-decide",
        label: "The person who waits until someone else decides",
        signals: ["Decision fatigue", "Needs confidence"],
        aceTypeWeights: { "soft-planner": 2, "comfort-loyalist": 2 },
        preferencePatch: { trustNeeds: ["clear practical info", "real visitor proof"] }
      }
    ]
  },
  {
    id: "worth-it",
    prompt: "What makes a place feel worth it to you?",
    options: [
      {
        id: "budget-hassle",
        label: "It fits my budget and does not feel like a hassle",
        signals: ["Practical value"],
        aceTypeWeights: { "comfort-loyalist": 3, "soft-planner": 2 },
        preferencePatch: { budgetPreference: "$$", effortPreference: "low_effort" }
      },
      {
        id: "atmosphere-right",
        label: "The atmosphere feels right",
        signals: ["Emotional fit"],
        aceTypeWeights: { "cozy-curator": 3, "experience-collector": 1 },
        preferencePatch: { vibeTags: ["cozy", "scenic", "warm"] }
      },
      {
        id: "good-story",
        label: "It gives me a good story or memory",
        signals: ["Experience value"],
        aceTypeWeights: { "experience-collector": 3, "curious-wanderer": 2 },
        preferencePatch: { vibeTags: ["memorable", "local"], noveltyLevel: "surprise_me" }
      },
      {
        id: "trusted-liked",
        label: "Other people I trust liked it",
        signals: ["Trust signals"],
        aceTypeWeights: { "comfort-loyalist": 3, "soft-planner": 1 },
        preferencePatch: { trustNeeds: ["reviews", "real visitor proof"] }
      },
      {
        id: "different-usual",
        label: "It feels different from what I usually do",
        signals: ["Novelty"],
        aceTypeWeights: { "curious-wanderer": 2, "experience-collector": 3 },
        preferencePatch: { noveltyLevel: "push_comfort_zone", vibeTags: ["hidden gem", "creative"] }
      }
    ]
  },
  {
    id: "tiny-disaster",
    prompt: "Which tiny disaster ruins the outing fastest?",
    options: [
      {
        id: "too-expensive",
        label: "It is too expensive for what it is",
        signals: ["Budget sensitivity"],
        aceTypeWeights: { "comfort-loyalist": 3, "soft-planner": 1 },
        preferencePatch: { budgetPreference: "$$", trustNeeds: ["good value"] }
      },
      {
        id: "too-loud",
        label: "It is too loud or crowded",
        signals: ["Sensory comfort"],
        aceTypeWeights: { "cozy-curator": 3, "comfort-loyalist": 1 },
        preferencePatch: { vibeTags: ["cozy", "quiet"], socialStyles: ["solo", "date"] }
      },
      {
        id: "photos-better",
        label: "The photos looked better than the actual place",
        signals: ["Photo accuracy", "Trust"],
        aceTypeWeights: { "comfort-loyalist": 2, "experience-collector": 2 },
        preferencePatch: { trustNeeds: ["real visitor proof", "recent reviews"] }
      },
      {
        id: "parking-annoying",
        label: "Parking or getting there is annoying",
        signals: ["Convenience"],
        aceTypeWeights: { "soft-planner": 2, "comfort-loyalist": 2 },
        preferencePatch: { effortPreference: "low_effort", distanceComfortMiles: 5 }
      },
      {
        id: "group-different",
        label: "Everyone in the group wants something different",
        signals: ["Group compatibility"],
        aceTypeWeights: { "social-spark": 2, "social-adventurer": 3 },
        preferencePatch: { socialStyles: ["friends", "groups"], vibeTags: ["flexible", "social", "food"] }
      }
    ]
  },
  {
    id: "comfort-zone",
    prompt: "Choose your ideal outside-the-comfort-zone level.",
    options: [
      {
        id: "same-vibe-new-place",
        label: "Same vibe, new place",
        signals: ["Mild novelty"],
        aceTypeWeights: { "spontaneous-localist": 2, "comfort-loyalist": 2 },
        preferencePatch: { noveltyLevel: "slightly_new" }
      },
      {
        id: "new-neighborhood",
        label: "New neighborhood, familiar type of activity",
        signals: ["Geographic exploration"],
        aceTypeWeights: { "curious-wanderer": 2, "spontaneous-localist": 2 },
        preferencePatch: { noveltyLevel: "slightly_new", distanceComfortMiles: 10 }
      },
      {
        id: "weird-local",
        label: "Weird little place with strong local energy",
        signals: ["Hidden gem seeker"],
        aceTypeWeights: { "curious-wanderer": 3, "experience-collector": 3 },
        preferencePatch: { noveltyLevel: "push_comfort_zone", vibeTags: ["weird", "hidden gem", "local"] }
      },
      {
        id: "surprise-trust",
        label: "Surprise me, but do not betray me",
        signals: ["Adventurous", "Trust-aware"],
        aceTypeWeights: { "social-adventurer": 2, "experience-collector": 2 },
        preferencePatch: { noveltyLevel: "surprise_me", trustNeeds: ["real visitor proof", "reviews"] }
      },
      {
        id: "safest-good",
        label: "I want the safest good option",
        signals: ["Reliability first"],
        aceTypeWeights: { "comfort-loyalist": 3, "soft-planner": 2 },
        preferencePatch: { noveltyLevel: "safe", trustNeeds: ["predictable quality", "reviews"] }
      }
    ]
  }
];

const mergePreferenceArrays = (current: string[] | undefined, incoming: string[] | undefined) =>
  Array.from(new Set([...(current ?? []), ...(incoming ?? [])]));

export function scoreQuizAnswers(answerIds: string[], aceTypes: AceType[], basePreferences: UserPreferences) {
  const weights = Object.fromEntries(aceTypes.map((type) => [type.id, 0]));
  const preferences: UserPreferences = {
    ...basePreferences,
    vibeTags: [...basePreferences.vibeTags],
    socialStyles: [...basePreferences.socialStyles],
    trustNeeds: [...basePreferences.trustNeeds]
  };

  quizQuestions.forEach((question) => {
    const answer = question.options.find((option) => answerIds.includes(option.id));
    if (!answer) return;

    Object.entries(answer.aceTypeWeights).forEach(([aceTypeId, value]) => {
      weights[aceTypeId] = (weights[aceTypeId] ?? 0) + value;
    });

    preferences.vibeTags = mergePreferenceArrays(preferences.vibeTags, answer.preferencePatch.vibeTags);
    preferences.socialStyles = mergePreferenceArrays(preferences.socialStyles, answer.preferencePatch.socialStyles);
    preferences.trustNeeds = mergePreferenceArrays(preferences.trustNeeds, answer.preferencePatch.trustNeeds);

    if (answer.preferencePatch.budgetPreference) preferences.budgetPreference = answer.preferencePatch.budgetPreference;
    if (answer.preferencePatch.distanceComfortMiles) preferences.distanceComfortMiles = answer.preferencePatch.distanceComfortMiles;
    if (answer.preferencePatch.noveltyLevel) preferences.noveltyLevel = answer.preferencePatch.noveltyLevel;
    if (answer.preferencePatch.effortPreference) preferences.effortPreference = answer.preferencePatch.effortPreference;
  });

  const aceType = [...aceTypes].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))[0];

  return {
    aceType,
    preferences
  };
}
