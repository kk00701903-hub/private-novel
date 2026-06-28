import { saveMdLocally } from '@/lib/localMdStorage';
import {
  collectWorkMdFiles,
  episodeAiFilename,
  episodeDraftFilename,
  episodeFinalFilename,
  episodePlotFilename,
  serializeEpisodeAiMd,
  serializeEpisodeDraftMd,
  serializeEpisodeFinalMd,
  serializeEpisodePlotMd,
  serializeCharactersMd,
  serializeStyleMd,
  serializeWorldviewMd,
  workCharactersFilename,
  workStyleFilename,
  workWorldviewFilename,
} from '@/lib/mdExport';
import type { Episode, Work } from '@/types/novel';

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 1200;

function schedule(key: string, fn: () => void) {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      fn();
    }, DEBOUNCE_MS),
  );
}

function saveIfContent(filename: string, content: string, hasContent: boolean) {
  if (!hasContent) return;
  void saveMdLocally(filename, content);
}

export function syncEpisodeFieldMd(work: Work, episodeNumber: number, field: keyof Episode) {
  const ep = work.episodes.find((e) => e.number === episodeNumber);
  if (!ep) return;

  const key = `${work.id}-ep-${episodeNumber}-${field}`;
  schedule(key, () => {
    switch (field) {
      case 'draft':
      case 'rewriteDirection':
        saveIfContent(
          episodeDraftFilename(work, episodeNumber),
          serializeEpisodeDraftMd(work, ep),
          Boolean(ep.draft.trim() || ep.rewriteDirection.trim()),
        );
        break;
      case 'plot':
      case 'title':
        saveIfContent(
          episodePlotFilename(work, episodeNumber),
          serializeEpisodePlotMd(work, ep),
          Boolean(ep.plot.trim()),
        );
        break;
      case 'aiResult':
        saveIfContent(
          episodeAiFilename(work, episodeNumber),
          serializeEpisodeAiMd(work, ep),
          Boolean(ep.aiResult.trim()),
        );
        break;
      case 'finalText':
        saveIfContent(
          episodeFinalFilename(work, episodeNumber),
          serializeEpisodeFinalMd(work, ep),
          Boolean(ep.finalText.trim()),
        );
        break;
      default:
        break;
    }
  });
}

export function syncWorkMetaMd(work: Work, fields: Array<keyof Work>) {
  if (fields.some((f) => f === 'worldview')) {
    schedule(`${work.id}-worldview`, () => {
      saveIfContent(workWorldviewFilename(work), serializeWorldviewMd(work), Boolean(work.worldview.trim()));
    });
  }
  if (fields.some((f) => f === 'styleGuide' || f === 'styleRequirements')) {
    schedule(`${work.id}-style`, () => {
      saveIfContent(
        workStyleFilename(work),
        serializeStyleMd(work),
        Boolean(work.styleGuide.trim() || work.styleRequirements.trim()),
      );
    });
  }
  if (fields.some((f) => f === 'characters' || f === 'relations')) {
    schedule(`${work.id}-characters`, () => {
      saveIfContent(
        workCharactersFilename(work),
        serializeCharactersMd(work),
        work.characters.length > 0 || work.relations.length > 0,
      );
    });
  }
}

export async function exportWorkAllMd(work: Work): Promise<number> {
  const files = collectWorkMdFiles(work);
  for (const { filename, content } of files) {
    await saveMdLocally(filename, content);
  }
  return files.length;
}

export async function exportAllWorksMd(works: Work[]): Promise<number> {
  let count = 0;
  for (const work of works) {
    count += await exportWorkAllMd(work);
  }
  return count;
}

/** Immediate save (no debounce) for explicit user actions */
export function saveEpisodeFinalMdNow(work: Work, episodeNumber: number) {
  const ep = work.episodes.find((e) => e.number === episodeNumber);
  if (!ep?.finalText.trim()) return;
  void saveMdLocally(episodeFinalFilename(work, episodeNumber), serializeEpisodeFinalMd(work, ep));
}

export function saveEpisodeAiMdNow(work: Work, episodeNumber: number) {
  const ep = work.episodes.find((e) => e.number === episodeNumber);
  if (!ep?.aiResult.trim()) return;
  void saveMdLocally(episodeAiFilename(work, episodeNumber), serializeEpisodeAiMd(work, ep));
}
