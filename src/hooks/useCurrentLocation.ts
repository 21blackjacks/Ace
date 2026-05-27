import { useCallback, useState } from "react";
import { useAppStore } from "../store/appStore";
import { locationLabelForCoordinates } from "../utils/location";

type RequestLocationOptions = {
  silent?: boolean;
};

export function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false);
  const setCurrentLocation = useAppStore((state) => state.setCurrentLocation);
  const showToast = useAppStore((state) => state.showToast);

  const requestLocation = useCallback(
    ({ silent = false }: RequestLocationOptions = {}) => {
      if (!("geolocation" in navigator)) {
        showToast("Location is not available in this browser");
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCurrentLocation({
            label: locationLabelForCoordinates(latitude, longitude),
            city: "Near you",
            country: "US",
            lat: latitude,
            lng: longitude,
            mode: "near_me"
          });
          setIsLocating(false);
          if (!silent) {
            const accuracyLabel = accuracy ? ` within about ${Math.round(accuracy)}m` : "";
            showToast(`Using your current location${accuracyLabel}`);
          }
        },
        () => {
          setIsLocating(false);
          if (!silent) showToast("Location permission was not granted");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5 * 60 * 1000,
          timeout: 10000
        }
      );
    },
    [setCurrentLocation, showToast]
  );

  return { isLocating, requestLocation };
}
