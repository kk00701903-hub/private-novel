import { saveMdLocally } from '@/lib/localMdStorage';
import {
  collectWorkMdFiles,
  episodeAiFilename,
  episodeDirectionFilename,
  episodeDraftFilename,
  episodeFinalFilename,
  episodePlotFilename,
  serializeEpisodeAiMd,
  serializeEpisodeDirectionMd,
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

export type MdSaveResult = { success: boolean; filename?: string; message?: string };

async function writeMd(
  filename: string,
  content: string,
  emptyMessage: string,
  hasContent: boolean,
): Promise<MdSaveResult> {
  if (!hasContent) return { success: false, message: emptyMessage };
  await saveMdLocally(filename, content);
  return { success: true, filename };
}

function getEpisode(work: Work, episodeNumber: number): Episode | undefined {
  return work.episodes.find((e) => e.number === episodeNumber);
}

function episodeWithOverrides(
  ep: Episode,
  overrides?: Partial<Pick<Episode, 'draft' | 'rewriteDirection' | 'plot' | 'aiResult' | 'finalText'>>,
): Episode {
  return overrides ? { ...ep, ...overrides } : ep;
}

export async function saveWorldviewMd(work: Work): Promise<MdSaveResult> {
  return writeMd(
    workWorldviewFilename(work),
    serializeWorldviewMd(work),
    '세계관 내용을 입력하세요.',
    Boolean(work.worldview.trim()),
  );
}

export async function saveCharactersMd(work: Work): Promise<MdSaveResult> {
  return writeMd(
    workCharactersFilename(work),
    serializeCharactersMd(work),
    '인물 또는 관계를 추가하세요.',
    work.characters.length > 0 || work.relations.length > 0,
  );
}

export async function saveStyleMd(work: Work): Promise<MdSaveResult> {
  return writeMd(
    workStyleFilename(work),
    serializeStyleMd(work),
    '문체 예시 또는 요구사항을 입력하세요.',
    Boolean(work.styleGuide.trim() || work.styleRequirements.trim()),
  );
}

export async function saveEpisodePlotMd(work: Work, episodeNumber: number): Promise<MdSaveResult> {
  const ep = getEpisode(work, episodeNumber);
  if (!ep) return { success: false, message: '회차를 찾을 수 없습니다.' };
  return writeMd(
    episodePlotFilename(work, episodeNumber),
    serializeEpisodePlotMd(work, ep),
    '플롯을 입력하세요.',
    Boolean(ep.plot.trim()),
  );
}

export async function saveEpisodeDraftMd(
  work: Work,
  episodeNumber: number,
  overrides?: { draft?: string; rewriteDirection?: string },
): Promise<MdSaveResult> {
  const ep = getEpisode(work, episodeNumber);
  if (!ep) return { success: false, message: '회차를 찾을 수 없습니다.' };
  const merged = episodeWithOverrides(ep, overrides);
  return writeMd(
    episodeDraftFilename(work, episodeNumber),
    serializeEpisodeDraftMd(work, merged),
    '초안을 입력하세요.',
    Boolean(merged.draft.trim()),
  );
}

export async function saveEpisodeDirectionMd(
  work: Work,
  episodeNumber: number,
  direction?: string,
): Promise<MdSaveResult> {
  const ep = getEpisode(work, episodeNumber);
  if (!ep) return { success: false, message: '회차를 찾을 수 없습니다.' };
  const merged = episodeWithOverrides(ep, direction !== undefined ? { rewriteDirection: direction } : undefined);
  return writeMd(
    episodeDirectionFilename(work, episodeNumber),
    serializeEpisodeDirectionMd(work, merged),
    '각색 방향을 입력하세요.',
    Boolean(merged.rewriteDirection.trim()),
  );
}

export async function saveEpisodeAiMd(
  work: Work,
  episodeNumber: number,
  text?: string,
): Promise<MdSaveResult> {
  const ep = getEpisode(work, episodeNumber);
  if (!ep) return { success: false, message: '회차를 찾을 수 없습니다.' };
  const merged = episodeWithOverrides(ep, text !== undefined ? { aiResult: text } : undefined);
  return writeMd(
    episodeAiFilename(work, episodeNumber),
    serializeEpisodeAiMd(work, merged),
    'AI 집필 내용이 없습니다.',
    Boolean(merged.aiResult.trim()),
  );
}

export async function saveEpisodeFinalMd(
  work: Work,
  episodeNumber: number,
  text?: string,
): Promise<MdSaveResult> {
  const ep = getEpisode(work, episodeNumber);
  if (!ep) return { success: false, message: '회차를 찾을 수 없습니다.' };
  const merged = episodeWithOverrides(ep, text !== undefined ? { finalText: text } : undefined);
  return writeMd(
    episodeFinalFilename(work, episodeNumber),
    serializeEpisodeFinalMd(work, merged),
    '최종본 내용이 없습니다.',
    Boolean(merged.finalText.trim()),
  );
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
