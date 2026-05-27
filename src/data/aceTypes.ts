import type { AceType } from "../types/domain";

export const aceTypes: AceType[] = [
  {
    id: "cozy-curator",
    name: "The Cozy Curator",
    description: "You notice atmosphere first and love places that feel thoughtful, warm, and unrushed.",
    traits: ["Cozy", "Intentional", "Calm", "Taste-driven"],
    recommendationPriorities: ["Comfortable seating", "Atmosphere", "Low-friction plans", "Good coffee or food"]
  },
  {
    id: "spontaneous-localist",
    name: "The Spontaneous Localist",
    description: "You like nearby places with local energy and just enough surprise to make the day feel alive.",
    traits: ["Local", "Flexible", "Low-planning", "Curious"],
    recommendationPriorities: ["Near you", "Local favorites", "Open now", "Easy transitions"]
  },
  {
    id: "social-spark",
    name: "The Social Spark",
    description: "You look for places that make conversation easy and give a group something to rally around.",
    traits: ["Social", "Lively", "Group-friendly", "Energetic"],
    recommendationPriorities: ["Group fit", "Active experiences", "Food and drinks", "Fun atmosphere"]
  },
  {
    id: "soft-planner",
    name: "The Soft Planner",
    description: "You like having options ready without turning the outing into a spreadsheet.",
    traits: ["Prepared", "Flexible", "Practical", "Tasteful"],
    recommendationPriorities: ["Reliable picks", "Clear timing", "Good value", "Backup options"]
  },
  {
    id: "curious-wanderer",
    name: "The Curious Wanderer",
    description: "You are happiest when a plan leaves room for discovery, side streets, and strong local flavor.",
    traits: ["Exploratory", "Local", "Story-seeking", "Visual"],
    recommendationPriorities: ["Hidden gems", "Walkable areas", "Creative spots", "Memorable stories"]
  },
  {
    id: "comfort-loyalist",
    name: "The Comfort Loyalist",
    description: "You want the safest good option: familiar enough to trust, fresh enough to feel worthwhile.",
    traits: ["Reliable", "Comfort-first", "Trust-aware", "Practical"],
    recommendationPriorities: ["Strong reviews", "Predictable quality", "Parking", "Low hassle"]
  },
  {
    id: "experience-collector",
    name: "The Experience Collector",
    description: "You care about the story you get to keep afterward as much as the place itself.",
    traits: ["Memorable", "Visual", "Novel", "Story-driven"],
    recommendationPriorities: ["Unique settings", "Photo-worthy moments", "Local proof", "Distinctive activities"]
  },
  {
    id: "social-adventurer",
    name: "The Social Adventurer",
    description: "You crave fun, local flavor, and new experiences with your people.",
    traits: ["Social", "Active", "Local", "Value-aware"],
    recommendationPriorities: ["Group-friendly places", "Local energy", "Active experiences", "Good value"]
  }
];

export const defaultAceType = aceTypes.find((type) => type.id === "social-adventurer") ?? aceTypes[0];
