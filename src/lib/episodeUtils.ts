import type { Episode } from '@/types/novel';

export function getEpisodeDisplayTitle(ep: Episode): string {
  if (ep.title?.trim()) return ep.title.trim();
  const firstLine =
    ep.plot
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean)
      ?.replace(/^#+\s*/, '') ?? '';
  if (firstLine) return firstLine.length > 48 ? `${firstLine.slice(0, 48)}…` : firstLine;
  return '제목 없음';
}
