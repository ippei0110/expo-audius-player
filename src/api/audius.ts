export type Track = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  streamUrl: string; // ←ここがアプリ内再生の核
};

const BASE = "https://api.audius.co/v1";
const streamUrl = (trackId: string) => `${BASE}/tracks/${trackId}/stream`;

const pickArtwork = (t: any) =>
  t?.artwork?.["150x150"] || t?.artwork?.["480x480"] || t?.artwork?.["1000x1000"];

const toTrack = (t: any): Track => ({
  id: String(t.id),
  title: t.title ?? "Unknown",
  artist: t.user?.name ?? t.user?.handle ?? "Unknown",
  artworkUrl: pickArtwork(t),
  streamUrl: streamUrl(String(t.id)),
});

export async function getTrendingUnderground(limit = 25): Promise<Track[]> {
  const res = await fetch(`${BASE}/tracks/trending/underground?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch trending tracks");
  const json = await res.json();
  return (json?.data ?? []).map(toTrack);
}

export async function searchTracks(query: string, limit = 25): Promise<Track[]> {
  const q = encodeURIComponent(query);
  const res = await fetch(`${BASE}/tracks/search?query=${q}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to search tracks");
  const json = await res.json();
  return (json?.data ?? []).map(toTrack);
}
