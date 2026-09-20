import places from "@/data/up-places.json";

// Cache the response at the edge for an hour. The data is static,
// so there is no reason to recompute it on every request.
export const revalidate = 3600;

/**
 * GET /api/places
 *   ?id=lucknow        -> a single city with everything in it
 *   ?region=Awadh      -> only cities in that region
 *   ?q=kebab           -> search across city, monument and dish names
 *   ?fields=summary    -> drop monuments/food, return just the city cards
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const region = searchParams.get("region");
  const q = searchParams.get("q")?.trim().toLowerCase();
  const fields = searchParams.get("fields");

  if (id) {
    const city = places.find((p) => p.id === id);
    if (!city) {
      return Response.json(
        { error: `No city with id "${id}".` },
        { status: 404 }
      );
    }
    return Response.json(city);
  }

  let results = places;

  if (region) {
    results = results.filter(
      (p) => p.region.toLowerCase() === region.toLowerCase()
    );
  }

  if (q) {
    results = results.filter((p) => {
      const haystack = [
        p.name,
        p.tagline,
        p.about,
        ...p.monuments.map((m) => `${m.name} ${m.type}`),
        ...p.food.map((f) => `${f.dish} ${f.where}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (fields === "summary") {
    results = results.map(({ id, name, tagline, region, coords, bestTime }) => ({
      id,
      name,
      tagline,
      region,
      coords,
      bestTime,
    }));
  }

  return Response.json({ count: results.length, places: results });
}
