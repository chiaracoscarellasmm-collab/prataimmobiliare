const YOUTUBE_ID_PATTERN =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Riconosce i formati comuni (watch, youtu.be, embed, shorts). `null` per
 * qualunque valore assente, vuoto o non riconducibile a un video YouTube —
 * il chiamante usa questo per decidere se mostrare la sezione video o niente.
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}
