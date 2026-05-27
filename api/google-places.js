import { googlePlacesSearch, placesInputFromRequest, sendJson } from "./_googlePlacesShared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { places: [] });
    return;
  }

  try {
    const result = await googlePlacesSearch(placesInputFromRequest(req));
    sendJson(res, result.statusCode, result.body);
  } catch {
    sendJson(res, 200, { places: [] });
  }
}
