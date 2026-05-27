import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type GoogleAttribution = {
  displayName?: string;
  uri?: string;
};

type GooglePhoto = {
  name?: string;
  authorAttributions?: GoogleAttribution[];
};

type GoogleTextSearchResponse = {
  places?: {
    id?: string;
    displayName?: {
      text?: string;
    };
    formattedAddress?: string;
    shortFormattedAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    primaryTypeDisplayName?: {
      text?: string;
    };
    types?: string[];
    priceLevel?: string;
    rating?: number;
    userRatingCount?: number;
    currentOpeningHours?: {
      openNow?: boolean;
      weekdayDescriptions?: string[];
    };
    regularOpeningHours?: {
      weekdayDescriptions?: string[];
    };
    photos?: GooglePhoto[];
    googleMapsUri?: string;
  }[];
};

type GooglePhotoMediaResponse = {
  photoUri?: string;
};

type JsonResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

function jsonResponse(res: JsonResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function googlePlacePhotosPlugin(apiKey?: string): Plugin {
  return {
    name: "ace-google-place-photos",
    configureServer(server) {
      server.middlewares.use("/api/google-place-photo", async (req, res) => {
        try {
          const key = apiKey?.trim();
          if (!key) {
            jsonResponse(res, 200, {});
            return;
          }

          const rawUrl = "url" in req && typeof req.url === "string" ? req.url : "";
          const requestUrl = new URL(rawUrl, "http://localhost");
          const providedPhotoName = requestUrl.searchParams.get("photoName")?.trim();
          const placeName = requestUrl.searchParams.get("name")?.trim();
          const address = requestUrl.searchParams.get("address")?.trim();
          const lat = Number(requestUrl.searchParams.get("lat"));
          const lng = Number(requestUrl.searchParams.get("lng"));
          const maxWidthPx = Math.min(1600, Math.max(100, Number(requestUrl.searchParams.get("maxWidthPx")) || 900));

          if (!providedPhotoName && !placeName) {
            jsonResponse(res, 400, { error: "Missing place name" });
            return;
          }

          let photo: GooglePhoto | undefined;
          let photoName = providedPhotoName;

          if (!photoName) {
            const searchBody: Record<string, unknown> = {
              textQuery: [placeName, address].filter(Boolean).join(", "),
              pageSize: 1
            };

            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              searchBody.locationBias = {
                circle: {
                  center: {
                    latitude: lat,
                    longitude: lng
                  },
                  radius: 700
                }
              };
            }

            const searchResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": key,
                "X-Goog-FieldMask": "places.photos"
              },
              body: JSON.stringify(searchBody)
            });

            if (!searchResponse.ok) {
              jsonResponse(res, searchResponse.status, {});
              return;
            }

            const searchData = (await searchResponse.json()) as GoogleTextSearchResponse;
            photo = searchData.places?.[0]?.photos?.[0];
            photoName = photo?.name;
          }

          if (!photoName) {
            jsonResponse(res, 200, {});
            return;
          }

          const mediaName = photoName.endsWith("/media") ? photoName : `${photoName}/media`;
          const mediaResponse = await fetch(`https://places.googleapis.com/v1/${mediaName}?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`, {
            headers: {
              "X-Goog-Api-Key": key
            }
          });

          if (!mediaResponse.ok) {
            jsonResponse(res, mediaResponse.status, {});
            return;
          }

          const mediaData = (await mediaResponse.json()) as GooglePhotoMediaResponse;
          jsonResponse(res, 200, {
            photoUri: mediaData.photoUri,
            attributions: photo?.authorAttributions ?? []
          });
        } catch {
          jsonResponse(res, 200, {});
        }
      });

      server.middlewares.use("/api/google-places", async (req, res) => {
        try {
          const key = apiKey?.trim();
          if (!key) {
            jsonResponse(res, 200, { places: [], source: "missing_key" });
            return;
          }

          const rawUrl = "url" in req && typeof req.url === "string" ? req.url : "";
          const requestUrl = new URL(rawUrl, "http://localhost");
          const query = requestUrl.searchParams.get("query")?.trim();
          const locationLabel = requestUrl.searchParams.get("locationLabel")?.trim();
          const lat = Number(requestUrl.searchParams.get("lat"));
          const lng = Number(requestUrl.searchParams.get("lng"));
          const pageSize = Math.min(16, Math.max(1, Number(requestUrl.searchParams.get("pageSize")) || 10));

          if (!query) {
            jsonResponse(res, 400, { places: [] });
            return;
          }

          const queryNeedsLocation = locationLabel && !query.toLowerCase().includes(locationLabel.toLowerCase());
          const textQuery = queryNeedsLocation ? `${query} near ${locationLabel}` : query;
          const searchBody: Record<string, unknown> = {
            textQuery,
            pageSize
          };

          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            searchBody.locationBias = {
              circle: {
                center: {
                  latitude: lat,
                  longitude: lng
                },
                radius: 12000
              }
            };
          }

          const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": key,
              "X-Goog-FieldMask": [
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.shortFormattedAddress",
                "places.location",
                "places.primaryTypeDisplayName",
                "places.types",
                "places.priceLevel",
                "places.rating",
                "places.userRatingCount",
                "places.currentOpeningHours",
                "places.regularOpeningHours",
                "places.photos",
                "places.googleMapsUri"
              ].join(",")
            },
            body: JSON.stringify(searchBody)
          });

          if (!response.ok) {
            jsonResponse(res, response.status, { places: [] });
            return;
          }

          const data = (await response.json()) as GoogleTextSearchResponse;
          const places = (data.places ?? []).map((place) => ({
            id: place.id,
            name: place.displayName?.text,
            formattedAddress: place.formattedAddress,
            shortFormattedAddress: place.shortFormattedAddress,
            lat: place.location?.latitude,
            lng: place.location?.longitude,
            primaryType: place.primaryTypeDisplayName?.text,
            types: place.types ?? [],
            priceLevel: place.priceLevel,
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            openNow: place.currentOpeningHours?.openNow,
            currentWeekdayDescriptions: place.currentOpeningHours?.weekdayDescriptions ?? [],
            regularWeekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions ?? [],
            photoName: place.photos?.[0]?.name,
            photoAttributions: place.photos?.[0]?.authorAttributions ?? [],
            googleMapsUri: place.googleMapsUri
          }));

          jsonResponse(res, 200, { places, source: "google_places" });
        } catch {
          jsonResponse(res, 200, { places: [] });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const googleMapsApiKey = env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY;

  return {
    plugins: [react(), googlePlacePhotosPlugin(googleMapsApiKey)],
    server: {
      host: "127.0.0.1",
      port: 5173
    }
  };
});
