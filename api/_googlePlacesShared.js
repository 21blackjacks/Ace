export function readGoogleMapsApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
}

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function queryValue(req, name) {
  const queryValueFromRequest = req.query?.[name];
  if (Array.isArray(queryValueFromRequest)) return queryValueFromRequest[0];
  if (typeof queryValueFromRequest === "string") return queryValueFromRequest;

  const requestUrl = new URL(req.url ?? "", `https://${req.headers.host ?? "localhost"}`);
  return requestUrl.searchParams.get(name) ?? undefined;
}

function numericQueryValue(req, name) {
  const value = Number(queryValue(req, name));
  return Number.isFinite(value) ? value : undefined;
}

export async function googlePlacesSearch({ apiKey, query, locationLabel, lat, lng, pageSize }) {
  const key = apiKey?.trim();
  if (!key) return { statusCode: 200, body: { places: [], source: "missing_key" } };
  if (!query) return { statusCode: 400, body: { places: [] } };

  const boundedPageSize = Math.min(16, Math.max(1, Number(pageSize) || 10));
  const queryNeedsLocation = locationLabel && !query.toLowerCase().includes(locationLabel.toLowerCase());
  const textQuery = queryNeedsLocation ? `${query} near ${locationLabel}` : query;
  const searchBody = {
    textQuery,
    pageSize: boundedPageSize
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

  if (!response.ok) return { statusCode: response.status, body: { places: [] } };

  const data = await response.json();
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

  return { statusCode: 200, body: { places, source: "google_places" } };
}

export async function googlePlacePhoto({ apiKey, photoName, placeName, address, lat, lng, maxWidthPx }) {
  const key = apiKey?.trim();
  if (!key) return { statusCode: 200, body: {} };
  if (!photoName && !placeName) return { statusCode: 400, body: { error: "Missing place name" } };

  let photo;
  let resolvedPhotoName = photoName;

  if (!resolvedPhotoName) {
    const searchBody = {
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

    if (!searchResponse.ok) return { statusCode: searchResponse.status, body: {} };

    const searchData = await searchResponse.json();
    photo = searchData.places?.[0]?.photos?.[0];
    resolvedPhotoName = photo?.name;
  }

  if (!resolvedPhotoName) return { statusCode: 200, body: {} };

  const boundedMaxWidthPx = Math.min(1600, Math.max(100, Number(maxWidthPx) || 900));
  const mediaName = resolvedPhotoName.endsWith("/media") ? resolvedPhotoName : `${resolvedPhotoName}/media`;
  const mediaResponse = await fetch(`https://places.googleapis.com/v1/${mediaName}?maxWidthPx=${boundedMaxWidthPx}&skipHttpRedirect=true`, {
    headers: {
      "X-Goog-Api-Key": key
    }
  });

  if (!mediaResponse.ok) return { statusCode: mediaResponse.status, body: {} };

  const mediaData = await mediaResponse.json();
  return {
    statusCode: 200,
    body: {
      photoUri: mediaData.photoUri,
      attributions: photo?.authorAttributions ?? []
    }
  };
}

export function placesInputFromRequest(req) {
  return {
    apiKey: readGoogleMapsApiKey(),
    query: queryValue(req, "query")?.trim(),
    locationLabel: queryValue(req, "locationLabel")?.trim(),
    lat: numericQueryValue(req, "lat"),
    lng: numericQueryValue(req, "lng"),
    pageSize: numericQueryValue(req, "pageSize")
  };
}

export function photoInputFromRequest(req) {
  return {
    apiKey: readGoogleMapsApiKey(),
    photoName: queryValue(req, "photoName")?.trim(),
    placeName: queryValue(req, "name")?.trim(),
    address: queryValue(req, "address")?.trim(),
    lat: numericQueryValue(req, "lat"),
    lng: numericQueryValue(req, "lng"),
    maxWidthPx: numericQueryValue(req, "maxWidthPx")
  };
}
