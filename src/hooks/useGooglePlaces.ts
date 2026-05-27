import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import type { Place } from "../types/domain";
import { fetchGooglePlaces } from "../utils/googlePlaces";

type LivePlacesState = {
  key: string;
  places: Place[];
  status: "ready" | "unavailable";
};

const livePlacesCache = new Map<string, Place[]>();
const livePlacesRequests = new Map<string, Promise<Place[]>>();

export function useGooglePlaces(query: string, pageSize = 10) {
  const user = useAppStore((state) => state.user);
  const upsertPlaces = useAppStore((state) => state.upsertPlaces);
  const [state, setState] = useState<LivePlacesState>();

  const requestKey = useMemo(
    () => [query, pageSize, user.currentLocation.label, user.currentLocation.lat, user.currentLocation.lng].join("|"),
    [pageSize, query, user.currentLocation.label, user.currentLocation.lat, user.currentLocation.lng]
  );

  useEffect(() => {
    const cached = livePlacesCache.get(requestKey);
    if (cached) return;

    let active = true;

    const request =
      livePlacesRequests.get(requestKey) ??
      fetchGooglePlaces({ query, user, pageSize })
        .then((places) => {
          livePlacesCache.set(requestKey, places);
          return places;
        })
        .finally(() => {
          livePlacesRequests.delete(requestKey);
        });

    livePlacesRequests.set(requestKey, request);

    request.then((places) => {
      if (!active) return;
      if (places.length) upsertPlaces(places);
      setState({
        key: requestKey,
        places,
        status: places.length ? "ready" : "unavailable"
      });
    });

    return () => {
      active = false;
    };
  }, [pageSize, query, requestKey, upsertPlaces, user]);

  const isCurrent = state?.key === requestKey;
  const cachedPlaces = livePlacesCache.get(requestKey);
  const places = isCurrent ? state.places : (cachedPlaces ?? []);
  const isLoading = !isCurrent && !cachedPlaces;

  return {
    places,
    status: cachedPlaces ? "ready" : isCurrent ? state.status : "unavailable",
    isLoading,
    isLive: Boolean(places.length)
  };
}
