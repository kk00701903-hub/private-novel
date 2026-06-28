import type { RewriteMode, Work } from '@/types/novel';

const NEXT_EP_PREVIEW_LEN = 500;

function formatCharacters(work: Work): string {
  if (work.characters.length === 0) return '(인물 설정 없음)';
  return work.characters.map((c) => `- ${c.name}: ${c.description}`).join('\n');
}

function formatRelations(work: Work): string {
  if (work.relations.length === 0) return '(인물 관계 없음)';
  const nameMap = new Map(work.characters.map((c) => [c.id, c.name]));
  return work.relations
    .map((r) => `- ${nameMap.get(r.fromId) ?? r.fromId} → ${nameMap.get(r.toId) ?? r.toId}: ${r.relation}`)
    .join('\n');
}

function getPreviousEpisodesText(work: Work, episodeNumber: number): string {
  const prev = work.episodes
    .filter((ep) => ep.number < episodeNumber && ep.finalText.trim())
    .sort((a, b) => a.number - b.number);
  if (prev.length === 0) return '(이전 회차 최종본 없음)';
  return prev.map((ep) => `## ${ep.number}회차\n${ep.finalText}`).join('\n\n');
}

function getNextEpisodePreview(work: Work, episodeNumber: number): string {
  const next = work.episodes.find((ep) => ep.number === episodeNumber + 1);
  if (!next) return '(다음 회차 없음)';
  const source = next.finalText.trim() || next.draft.trim();
  if (!source) return '(다음 회차 내용 없음)';
  return source.slice(0, NEXT_EP_PREVIEW_LEN) + (source.length > NEXT_EP_PREVIEW_LEN ? '…' : '');
}

const BASE_RULES = `규칙:
- 반드시 이전 회차 내용과 모순되지 않게 작성하세요.
- 세계관·인물·관계도를 지속 참조하세요.
- 웹소설 문체(styleGuide)를 준수하세요.
- 각색 시 다음 회차 시작과 자연스럽게 연결되도록 하세요.
- 완성도 높은 웹소설 문장으로 출력하세요.`;

export function buildRewritePrompt(work: Work, episodeNumber: number, mode: RewriteMode) {
  const episode = work.episodes.find((ep) => ep.number === episodeNumber);
  if (!episode) throw new Error('회차를 찾을 수 없습니다.');

  const context = {
    title: work.title,
    worldview: work.worldview || '(세계관 없음)',
    characters: formatCharacters(work),
    relations: formatRelations(work),
    styleGuide: work.styleGuide || '(문체 예시 없음)',
    styleRequirements: work.styleRequirements || '(요구사항 없음)',
    previousEpisodes: getPreviousEpisodesText(work, episodeNumber),
    nextEpisodePreview: getNextEpisodePreview(work, episodeNumber),
    currentPlot: episode.plot || '(플롯 없음)',
    currentDraft: episode.draft || '(초안 없음)',
    rewriteDirection: episode.rewriteDirection || '(각색 방향 없음)',
    episodeNumber,
  };

  if (mode === 'draft') {
    const system = `당신은 웹소설 전문 편집자입니다.
초안과 각색 방향을 바탕으로 회차 원고를 재작성합니다.

${BASE_RULES}

[작품] ${context.title}
[세계관]
${context.worldview}

[인물 설정]
${context.characters}

[인물 관계]
${context.relations}

[문체 예시]
${context.styleGuide}

[구체적 요구사항]
${context.styleRequirements}

[이전 회차 최종본]
${context.previousEpisodes}

[다음 회차 시작부 참고]
${context.nextEpisodePreview}`;

    const user = `${context.episodeNumber}회차 초안을 각색 방향에 따라 재작성해 주세요.

[초안]
${context.currentDraft}

[각색 방향]
${context.rewriteDirection}`;

    return { system, user };
  }

  const system = `당신은 웹소설 전문 작가입니다.
플롯과 이전 회차를 바탕으로 회차 원고를 집필합니다.

${BASE_RULES}

[작품] ${context.title}
[세계관]
${context.worldview}

[인물 설정]
${context.characters}

[인물 관계]
${context.relations}

[문체 예시]
${context.styleGuide}

[구체적 요구사항]
${context.styleRequirements}

[이전 회차 최종본]
${context.previousEpisodes}`;

  const user = `${context.episodeNumber}회차 플롯에 따라 원고를 집필해 주세요.

[이번 회차 플롯]
${context.currentPlot}`;

  return { system, user };
}

export function buildConsistencyPrompt(work: Work): { system: string; user: string } {
  const allEpisodes = work.episodes
    .filter((ep) => ep.finalText.trim() || ep.plot.trim())
    .sort((a, b) => a.number - b.number);

  const episodesText =
    allEpisodes.length === 0
      ? '(저장된 회차 없음)'
      : allEpisodes
          .map(
            (ep) =>
              `## ${ep.number}회차\n플롯: ${ep.plot || '(없음)'}\n최종본: ${ep.finalText || '(없음)'}`,
          )
          .join('\n\n');

  const system = `당신은 웹소설 설정 편집자입니다.
작품의 세계관, 인물, 플롯, 회차별 내용을 검토하여 모순과 불일치를 찾아주세요.

다음 형식으로 한국어로 답변하세요:
1. 발견된 문제 목록 (회차 번호 포함)
2. 각 문제의 설명
3. 수정 제안`;

  const user = `[작품] ${work.title}

[세계관]
${work.worldview || '(없음)'}

[인물]
${formatCharacters(work)}

[관계]
${formatRelations(work)}

[회차별 내용]
${episodesText}

전체를 검토하고 설정 모순, 인물 행동 불일치, 플롯 이탈을 찾아주세요.`;

  return { system, user };
}
