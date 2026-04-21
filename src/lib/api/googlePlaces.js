const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? "";

/**
 * Fetch nearby contractors via Google Places Nearby Search.
 * Requires VITE_GOOGLE_PLACES_API_KEY and a backend proxy to avoid CORS.
 * Returns null when the key is missing or the request fails.
 */
export async function fetchNearbyContractors(lat, lng, trade) {
  if (!API_KEY) return null;

  const keyword = encodeURIComponent(`${trade} contractor`);
  // Route through /api/places in production to avoid exposing the key client-side.
  const url = `/api/places/nearbysearch?location=${lat},${lng}&radius=24000&keyword=${keyword}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results) return null;

    return data.results.slice(0, 8).map(p => ({
      id: p.place_id,
      name: p.name,
      trade,
      vicinity: p.vicinity,
      phone: "",
      googleRating: p.rating ?? null,
      googleReviews: p.user_ratings_total ?? 0,
      bbbRating: null,
      bbbAccredited: false,
      licensed: null,
      insured: null,
      source: "google",
    }));
  } catch {
    return null;
  }
}

export function bbbSearchUrl(name, lat, lng) {
  const loc = lat && lng ? `${lat},${lng}` : "";
  return `https://www.bbb.org/search?find_text=${encodeURIComponent(name)}&find_loc=${loc}`;
}

export function googleMapsUrl(name, trade) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${trade}`)}`;
}

export function yelpSearchUrl(name, lat, lng) {
  const loc = lat && lng ? `${lat},${lng}` : "near+me";
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}&find_loc=${loc}`;
}
