import { googlePlacePhoto, photoInputFromRequest, sendJson } from "./_googlePlacesShared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, {});
    return;
  }

  try {
    const result = await googlePlacePhoto(photoInputFromRequest(req));
    sendJson(res, result.statusCode, result.body);
  } catch {
    sendJson(res, 200, {});
  }
}
