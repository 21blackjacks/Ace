import type { Plan } from "../types/domain";

export const defaultPlans: Plan[] = [
  {
    id: "savannah-saturday-plan",
    name: "Savannah Saturday Plan",
    dateLabel: "Sat, May 17",
    startTime: "1:00 PM",
    locationLabel: "Savannah, GA",
    peopleContext: "friends",
    sourceType: "board",
    sourceId: "girls-night",
    stops: [
      { id: "stop-paris", placeId: "paris-market", time: "1:00 PM", durationMinutes: 45, distanceFromPreviousMiles: 0 },
      { id: "stop-stars", placeId: "stars-and-strikes", time: "2:15 PM", durationMinutes: 90, distanceFromPreviousMiles: 1.1 },
      { id: "stop-abercorn", placeId: "abercorn-street-shops", time: "4:15 PM", durationMinutes: 60, distanceFromPreviousMiles: 1.2 },
      { id: "stop-common", placeId: "common-thread", time: "6:00 PM", durationMinutes: 90, distanceFromPreviousMiles: 0.8 },
      { id: "stop-alida", placeId: "rooftop-alida", time: "8:00 PM", durationMinutes: 60, distanceFromPreviousMiles: 1.3 }
    ],
    backupStops: [
      { id: "backup-e-shaver", placeId: "e-shaver-booksellers", time: "1:00 PM", durationMinutes: 45, distanceFromPreviousMiles: 0 },
      { id: "backup-starland", placeId: "starland-yard", time: "2:30 PM", durationMinutes: 75, distanceFromPreviousMiles: 1.4 },
      { id: "backup-plant", placeId: "plant-riverside", time: "6:00 PM", durationMinutes: 90, distanceFromPreviousMiles: 1.1 }
    ],
    estimatedCostMin: 60,
    estimatedCostMax: 90,
    estimatedDurationMinutes: 330,
    explanation:
      "This plan starts with a relaxed local stop, adds an active group-friendly activity, keeps the route close, and ends with dinner plus a scenic rooftop finish.",
    status: "upcoming"
  },
  {
    id: "girls-night-draft",
    name: "Girls Night Draft",
    dateLabel: "Draft",
    startTime: "7:00 PM",
    locationLabel: "Savannah, GA",
    peopleContext: "friends",
    sourceType: "board",
    sourceId: "girls-night",
    stops: [
      { id: "stop-common-draft", placeId: "common-thread", time: "7:00 PM", durationMinutes: 90, distanceFromPreviousMiles: 0 },
      { id: "stop-vault-draft", placeId: "vault-arcade", time: "8:45 PM", durationMinutes: 75, distanceFromPreviousMiles: 1 },
      { id: "stop-mirabelle-draft", placeId: "mirabelle-wine-bar", time: "10:15 PM", durationMinutes: 60, distanceFromPreviousMiles: 0.7 }
    ],
    backupStops: [
      { id: "backup-rooftop-draft", placeId: "rooftop-alida", time: "8:45 PM", durationMinutes: 60, distanceFromPreviousMiles: 0.9 },
      { id: "backup-plant-draft", placeId: "plant-riverside", time: "10:00 PM", durationMinutes: 75, distanceFromPreviousMiles: 0.8 }
    ],
    estimatedCostMin: 70,
    estimatedCostMax: 140,
    estimatedDurationMinutes: 225,
    explanation: "A dinner-first night that turns into games or drinks without asking the group to make too many decisions.",
    status: "draft"
  },
  {
    id: "rainy-day-backup-plan",
    name: "Rainy Day Backup Plan",
    dateLabel: "Any rainy afternoon",
    startTime: "12:30 PM",
    locationLabel: "Savannah, GA",
    peopleContext: "visitors",
    sourceType: "search",
    sourceId: "rainy-day",
    stops: [
      { id: "stop-e-shaver-rain", placeId: "e-shaver-booksellers", time: "12:30 PM", durationMinutes: 45, distanceFromPreviousMiles: 0 },
      { id: "stop-paris-rain", placeId: "paris-market", time: "1:30 PM", durationMinutes: 45, distanceFromPreviousMiles: 0.4 },
      { id: "stop-graveface-rain", placeId: "graveface-museum", time: "3:00 PM", durationMinutes: 75, distanceFromPreviousMiles: 0.8 },
      { id: "stop-sav-theatre-rain", placeId: "savannah-theatre", time: "5:00 PM", durationMinutes: 120, distanceFromPreviousMiles: 0.7 }
    ],
    backupStops: [
      { id: "backup-foxy-rain", placeId: "foxy-loxy-cafe", time: "1:30 PM", durationMinutes: 60, distanceFromPreviousMiles: 1.1 },
      { id: "backup-common-rain", placeId: "common-thread", time: "5:30 PM", durationMinutes: 90, distanceFromPreviousMiles: 1.3 }
    ],
    estimatedCostMin: 55,
    estimatedCostMax: 105,
    estimatedDurationMinutes: 360,
    explanation: "This keeps the day mostly indoors while still feeling local, flexible, and visitor-worthy.",
    status: "draft"
  }
];
