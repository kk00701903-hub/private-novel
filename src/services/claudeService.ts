import Anthropic from '@anthropic-ai/sdk';
import type { RewriteMode, Work } from '@/types/novel';
import { buildConsistencyPrompt, buildRewritePrompt } from './promptBuilder';

function isValidKey(apiKey: string): boolean {
  const k = apiKey.trim();
  return Boolean(k && k !== 'your_anthropic_api_key_here');
}

function mockResponse(mode: RewriteMode, work: Work, episodeNumber: number): string {
  const ep = work.episodes.find((e) => e.number === episodeNumber);
  if (mode === 'draft' && ep?.draft) {
    return `[Mock AI 결과 - API Key 미입력]\n\n${ep.draft}\n\n---\n※ 실제 서비스에서는 Claude가 세계관, 플롯, 이전 회차, 각색 방향을 반영하여 재작성합니다.`;
  }
  if (mode === 'plot' && ep?.plot) {
    return `[Mock AI 결과 - API Key 미입력]\n\n플롯 기반 집필:\n${ep.plot}\n\n---\n※ 실제 서비스에서는 Claude가 이전 회차와 플롯을 반영하여 원고를 작성합니다.`;
  }
  return '[Mock AI 결과 - API Key 미입력]\n\n집필할 내용(초안 또는 플롯)을 먼저 입력해 주세요.';
}

async function callClaude(
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const block = response.content.find((b) => b.type === 'text');
  return block?.type === 'text' ? block.text : '응답을 받지 못했습니다.';
}

export async function rewriteEpisode(
  work: Work,
  episodeNumber: number,
  mode: RewriteMode,
  apiKey: string,
  model: string,
): Promise<string> {
  if (!isValidKey(apiKey)) return mockResponse(mode, work, episodeNumber);
  const { system, user } = buildRewritePrompt(work, episodeNumber, mode);
  return callClaude(apiKey, model, system, user);
}

export async function checkConsistency(
  work: Work,
  apiKey: string,
  model: string,
): Promise<string> {
  if (!isValidKey(apiKey)) {
    return `[Mock 일관성 검토 - API Key 미입력]\n\n작품 "${work.title}"의 ${work.episodes.filter((e) => e.finalText).length}개 회차를 검토합니다.\n※ API Key 입력 후 실제 Claude 검토가 실행됩니다.`;
  }
  const { system, user } = buildConsistencyPrompt(work);
  return callClaude(apiKey, model, system, user);
}
