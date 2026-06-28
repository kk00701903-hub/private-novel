const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

export interface ParsedDraftMd {
  draft: string;
  rewriteDirection: string;
  episodeNumber?: number;
  workTitle?: string;
}

export function serializeDraftMd(options: {
  workTitle: string;
  episodeNumber: number;
  draft: string;
  rewriteDirection: string;
}): string {
  const { workTitle, episodeNumber, draft, rewriteDirection } = options;
  const lines = [
    '---',
    `work: ${workTitle}`,
    `episode: ${episodeNumber}`,
    'type: draft',
  ];
  if (rewriteDirection.trim()) {
    lines.push(`direction: ${JSON.stringify(rewriteDirection)}`);
  }
  lines.push('---', '', draft.trimEnd(), '');
  return lines.join('\n');
}

export function serializeFinalMd(options: {
  workTitle: string;
  episodeNumber: number;
  finalText: string;
}): string {
  const { workTitle, episodeNumber, finalText } = options;
  return [
    '---',
    `work: ${workTitle}`,
    `episode: ${episodeNumber}`,
    'type: final',
    `savedAt: ${new Date().toISOString()}`,
    '---',
    '',
    finalText.trimEnd(),
    '',
  ].join('\n');
}

export function saveFinalMdLocally(workTitle: string, episodeNumber: number, finalText: string) {
  const md = serializeFinalMd({ workTitle, episodeNumber, finalText });
  const filename = `${sanitizeFilename(workTitle)}_${episodeNumber}회차_최종본.md`;
  downloadTextFile(filename, md);
  return filename;
}

export function parseDraftMd(content: string): ParsedDraftMd {
  const trimmed = content.replace(/^\uFEFF/, '').trim();
  const match = trimmed.match(FRONTMATTER_RE);

  if (!match) {
    return { draft: trimmed, rewriteDirection: '' };
  }

  const meta = parseFrontmatter(match[1]);
  const body = match[2].trim();

  const episodeRaw = meta.episode ?? meta.episodeNumber;
  const episodeNumber = episodeRaw ? Number(episodeRaw) : undefined;

  let rewriteDirection = meta.direction ?? meta.rewriteDirection ?? '';
  if (rewriteDirection.startsWith('"') || rewriteDirection.startsWith("'")) {
    try {
      rewriteDirection = JSON.parse(rewriteDirection);
    } catch {
      /* keep raw */
    }
  }

  return {
    draft: body,
    rewriteDirection,
    episodeNumber: Number.isFinite(episodeNumber) ? episodeNumber : undefined,
    workTitle: meta.work ?? meta.title,
  };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').slice(0, 80) || 'draft';
}

export function downloadTextFile(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}
