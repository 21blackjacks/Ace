import type { Place } from "../types/domain";

type GoogleAttribution = {
  displayName?: string;
  uri?: string;
};

export type GoogleMapsPhotoResult = {
  photoUri: string;
  attributions: GoogleAttribution[];
};

const inFlightPhotoRequests = new Map<string, Promise<GoogleMapsPhotoResult | undefined>>();

function photoCacheKey(place: Place, maxWidthPx: number) {
  return `${place.id}:${maxWidthPx}`;
}

async function requestGoogleMapsPhoto(place: Place, maxWidthPx: number): Promise<GoogleMapsPhotoResult | undefined> {
  const params = new URLSearchParams({
    name: place.name,
    address: place.address ?? place.location.label,
    maxWidthPx: String(maxWidthPx)
  });
  if (place.googlePhotoName) params.set("photoName", place.googlePhotoName);

  if (typeof place.location.lat === "number" && typeof place.location.lng === "number") {
    params.set("lat", String(place.location.lat));
    params.set("lng", String(place.location.lng));
  }

  const response = await fetch(`/api/google-place-photo?${params.toString()}`);
  if (!response.ok) return undefined;

  const data = (await response.json()) as Partial<GoogleMapsPhotoResult>;
  if (!data.photoUri) return undefined;

  return {
    photoUri: data.photoUri,
    attributions: data.attributions?.length ? data.attributions : (place.googlePhotoAttributions ?? [])
  };
}

export function getGoogleMapsPlacePhoto(place: Place, maxWidthPx = 900) {
  const key = photoCacheKey(place, maxWidthPx);
  const cached = inFlightPhotoRequests.get(key);
  if (cached) return cached;

  const request = requestGoogleMapsPhoto(place, maxWidthPx)
    .catch(() => undefined)
    .finally(() => {
      inFlightPhotoRequests.delete(key);
    });
  inFlightPhotoRequests.set(key, request);
  return request;
}
