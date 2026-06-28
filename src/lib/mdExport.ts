import { sanitizeFilename } from '@/lib/draftMd';
import type { Work, Episode } from '@/types/novel';

function frontmatter(lines: string[]): string {
  return ['---', ...lines, '---', ''].join('\n');
}

function jsonField(key: string, value: string): string {
  if (!value.trim()) return '';
  return `${key}: ${JSON.stringify(value)}`;
}

export function workFilenamePrefix(work: Work): string {
  return sanitizeFilename(work.title);
}

export function episodeDraftFilename(work: Work, episodeNumber: number): string {
  return `${workFilenamePrefix(work)}_${episodeNumber}회차_초안.md`;
}

export function episodePlotFilename(work: Work, episodeNumber: number): string {
  return `${workFilenamePrefix(work)}_${episodeNumber}회차_플롯.md`;
}

export function episodeAiFilename(work: Work, episodeNumber: number): string {
  return `${workFilenamePrefix(work)}_${episodeNumber}회차_AI집필.md`;
}

export function episodeFinalFilename(work: Work, episodeNumber: number): string {
  return `${workFilenamePrefix(work)}_${episodeNumber}회차_최종본.md`;
}

export function workWorldviewFilename(work: Work): string {
  return `${workFilenamePrefix(work)}_세계관.md`;
}

export function workCharactersFilename(work: Work): string {
  return `${workFilenamePrefix(work)}_인물설정.md`;
}

export function workStyleFilename(work: Work): string {
  return `${workFilenamePrefix(work)}_문체설정.md`;
}

export function episodeDirectionFilename(work: Work, episodeNumber: number): string {
  return `${workFilenamePrefix(work)}_${episodeNumber}회차_각색방향.md`;
}

export function workBackupFilename(work: Work): string {
  return `${workFilenamePrefix(work)}_전체백업.md`;
}

export function serializeEpisodeDraftMd(work: Work, episode: Episode): string {
  const lines = [
    '---',
    `work: ${work.title}`,
    `episode: ${episode.number}`,
    'type: draft',
  ];
  if (episode.title.trim()) lines.push(`title: ${JSON.stringify(episode.title)}`);
  const dirLine = jsonField('direction', episode.rewriteDirection);
  if (dirLine) lines.push(dirLine);
  lines.push('---', '', episode.draft.trimEnd(), '');
  return lines.join('\n');
}

export function serializeEpisodeDirectionMd(work: Work, episode: Episode): string {
  return [
    frontmatter([
      `work: ${work.title}`,
      `episode: ${episode.number}`,
      'type: direction',
      ...(episode.title.trim() ? [`title: ${JSON.stringify(episode.title)}`] : []),
    ]),
    episode.rewriteDirection.trimEnd(),
    '',
  ].join('\n');
}

export function serializeEpisodePlotMd(work: Work, episode: Episode): string {
  return [
    frontmatter([
      `work: ${work.title}`,
      `episode: ${episode.number}`,
      'type: plot',
      ...(episode.title.trim() ? [`title: ${JSON.stringify(episode.title)}`] : []),
    ]),
    episode.plot.trimEnd(),
    '',
  ].join('\n');
}

export function serializeEpisodeAiMd(work: Work, episode: Episode): string {
  return [
    frontmatter([
      `work: ${work.title}`,
      `episode: ${episode.number}`,
      'type: ai-result',
      ...(episode.title.trim() ? [`title: ${JSON.stringify(episode.title)}`] : []),
      `savedAt: ${new Date().toISOString()}`,
    ]),
    episode.aiResult.trimEnd(),
    '',
  ].join('\n');
}

export function serializeEpisodeFinalMd(work: Work, episode: Episode): string {
  return [
    frontmatter([
      `work: ${work.title}`,
      `episode: ${episode.number}`,
      'type: final',
      ...(episode.title.trim() ? [`title: ${JSON.stringify(episode.title)}`] : []),
      `savedAt: ${new Date().toISOString()}`,
    ]),
    episode.finalText.trimEnd(),
    '',
  ].join('\n');
}

export function serializeWorldviewMd(work: Work): string {
  return [
    frontmatter([`work: ${work.title}`, 'type: worldview']),
    work.worldview.trimEnd(),
    '',
  ].join('\n');
}

export function serializeCharactersMd(work: Work): string {
  const lines = [
    frontmatter([`work: ${work.title}`, 'type: characters']),
    '# 인물',
    '',
  ];

  for (const c of work.characters) {
    lines.push(`## ${c.name || '(이름 없음)'}`, '', c.description.trimEnd(), '');
  }

  if (work.relations.length > 0) {
    lines.push('# 관계', '');
    for (const r of work.relations) {
      const from = work.characters.find((c) => c.id === r.fromId)?.name ?? '?';
      const to = work.characters.find((c) => c.id === r.toId)?.name ?? '?';
      lines.push(`- ${from} → ${to}: ${r.relation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function serializeStyleMd(work: Work): string {
  return [
    frontmatter([`work: ${work.title}`, 'type: style']),
    '# 문체 예시',
    '',
    work.styleGuide.trimEnd(),
    '',
    '# 구체적 요구사항',
    '',
    work.styleRequirements.trimEnd(),
    '',
  ].join('\n');
}

export function serializeWorkBackupMd(work: Work): string {
  const lines = [
    frontmatter([
      `work: ${work.title}`,
      'type: work-backup',
      `totalEpisodes: ${work.totalEpisodes}`,
      `exportedAt: ${new Date().toISOString()}`,
    ]),
    '# 세계관',
    '',
    work.worldview.trimEnd(),
    '',
    '# 문체 예시',
    '',
    work.styleGuide.trimEnd(),
    '',
    '# 구체적 요구사항',
    '',
    work.styleRequirements.trimEnd(),
    '',
    '# 인물',
    '',
  ];

  for (const c of work.characters) {
    lines.push(`## ${c.name || '(이름 없음)'}`, '', c.description.trimEnd(), '');
  }

  if (work.relations.length > 0) {
    lines.push('# 인물 관계', '');
    for (const r of work.relations) {
      const from = work.characters.find((c) => c.id === r.fromId)?.name ?? '?';
      const to = work.characters.find((c) => c.id === r.toId)?.name ?? '?';
      lines.push(`- ${from} → ${to}: ${r.relation}`);
    }
    lines.push('');
  }

  for (const ep of work.episodes) {
    const title = ep.title.trim() ? ` · ${ep.title}` : '';
    lines.push(`# ${ep.number}회차${title}`, '');

    if (ep.plot.trim()) {
      lines.push('## 플롯', '', ep.plot.trimEnd(), '');
    }
    if (ep.draft.trim()) {
      lines.push('## 초안', '', ep.draft.trimEnd(), '');
    }
    if (ep.rewriteDirection.trim()) {
      lines.push('## 각색 방향', '', ep.rewriteDirection.trimEnd(), '');
    }
    if (ep.aiResult.trim()) {
      lines.push('## AI 집필', '', ep.aiResult.trimEnd(), '');
    }
    if (ep.finalText.trim()) {
      lines.push('## 최종본', '', ep.finalText.trimEnd(), '');
    }
  }

  return lines.join('\n');
}

export function collectWorkMdFiles(work: Work): { filename: string; content: string }[] {
  const files: { filename: string; content: string }[] = [];

  if (work.worldview.trim()) {
    files.push({ filename: workWorldviewFilename(work), content: serializeWorldviewMd(work) });
  }
  if (work.characters.length > 0 || work.relations.length > 0) {
    files.push({ filename: workCharactersFilename(work), content: serializeCharactersMd(work) });
  }
  if (work.styleGuide.trim() || work.styleRequirements.trim()) {
    files.push({ filename: workStyleFilename(work), content: serializeStyleMd(work) });
  }

  for (const ep of work.episodes) {
    if (ep.plot.trim()) {
      files.push({ filename: episodePlotFilename(work, ep.number), content: serializeEpisodePlotMd(work, ep) });
    }
    if (ep.draft.trim() || ep.rewriteDirection.trim()) {
      files.push({ filename: episodeDraftFilename(work, ep.number), content: serializeEpisodeDraftMd(work, ep) });
    }
    if (ep.aiResult.trim()) {
      files.push({ filename: episodeAiFilename(work, ep.number), content: serializeEpisodeAiMd(work, ep) });
    }
    if (ep.finalText.trim()) {
      files.push({ filename: episodeFinalFilename(work, ep.number), content: serializeEpisodeFinalMd(work, ep) });
    }
  }

  files.push({ filename: workBackupFilename(work), content: serializeWorkBackupMd(work) });
  return files;
}
