import type { LocationContext, Place } from "../types/domain";

const EARTH_RADIUS_MILES = 3958.8;

export type Coordinates = {
  lat?: number;
  lng?: number;
};

export function hasCoordinates(location?: Coordinates): location is Required<Coordinates> {
  return typeof location?.lat === "number" && typeof location?.lng === "number";
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function milesBetween(from: Coordinates, to: Coordinates) {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return undefined;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

export function roundedMiles(miles: number) {
  return Number(miles.toFixed(miles < 10 ? 1 : 0));
}

export function estimateTravelMinutes(miles: number) {
  if (miles < 0.6) return Math.max(5, Math.round(miles * 18 + 3));
  if (miles < 2) return Math.round(miles * 10 + 5);
  return Math.round(miles * 4 + 8);
}

export function distanceBetweenPlaces(from?: Place, to?: Place) {
  const miles = milesBetween(from?.location ?? {}, to?.location ?? {});
  return typeof miles === "number" ? roundedMiles(miles) : undefined;
}

export function recalculatePlacesForLocation(places: Place[], userLocation: LocationContext) {
  return places.map((place) => {
    const miles = milesBetween(userLocation, place.location);
    if (typeof miles !== "number") return place;

    return {
      ...place,
      distanceMiles: roundedMiles(miles),
      travelMinutes: estimateTravelMinutes(miles)
    };
  });
}

export function locationLabelForCoordinates(latitude: number, longitude: number) {
  const shortLat = latitude.toFixed(3);
  const shortLng = longitude.toFixed(3);
  return `Current location (${shortLat}, ${shortLng})`;
}

export function coordinatesForKnownCity(label: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("savannah")) return { lat: 32.0809, lng: -81.0912 };
  if (normalized.includes("atlanta")) return { lat: 33.749, lng: -84.388 };
  if (normalized.includes("new york") || normalized.includes("nyc")) return { lat: 40.7128, lng: -74.006 };
  return undefined;
}
