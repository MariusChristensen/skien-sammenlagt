// Shared UI helper: background color for hole cell by diff/score
export function getHoleBgColor(diff, score) {
  if (score === 1) return "bg-yellow-300"; // Ace
  if (typeof diff !== "number") return "";
  if (diff < 0) return "bg-green-200"; // Under par
  if (diff === 1) return "bg-red-100"; // Bogey
  if (diff === 2) return "bg-red-300"; // Double bogey
  if (diff >= 3) return "bg-red-500"; // Triple+
  return "bg-white"; // Par/default
}

// Extract per-hole par values from results. Handles both Tracks.Holes and flat Tracks with Par per hole
export function extractParValuesFromResults(results) {
  const competition = results && results.Competition;
  const tracks = competition && competition.Tracks;

  // Try explicit holes structure
  if (Array.isArray(tracks) && tracks.length > 0) {
    if (Array.isArray(tracks[0]?.Holes) && tracks[0].Holes.length > 0) {
      const parValues = tracks[0].Holes.map((h) => {
        const p = parseInt(h?.Par, 10);
        return Number.isFinite(p) ? p : 3;
      });
      const totalPar = parValues.reduce((s, p) => s + p, 0);
      return { parValues, totalPar };
    }

    // Some APIs return one Track per hole with a Par value
    if (
      tracks.length >= 18 &&
      tracks.every((t) => t && typeof t.Par !== "undefined")
    ) {
      const parValues = tracks.slice(0, 18).map((t) => {
        const p = parseInt(t.Par, 10);
        return Number.isFinite(p) ? p : 3;
      });
      const totalPar = parValues.reduce((s, p) => s + p, 0);
      return { parValues, totalPar };
    }
  }

  // Fallback to 18 par-3 holes
  const parValues = Array(18).fill(3);
  const totalPar = 54;
  return { parValues, totalPar };
}

// Simple in-memory JSON cache by URL
const __jsonCache = new Map();

export async function fetchJsonCached(url, options = {}) {
  if (__jsonCache.has(url)) {
    return __jsonCache.get(url);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  __jsonCache.set(url, data);
  return data;
}
