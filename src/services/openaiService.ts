import OpenAI from 'openai';
import { WORLDVIEW, PLOTS, PREV_EPISODES } from '../data/novelData';

export async function refineNovel(
  currentDraft: string,
  episodeNumber: number,
  apiKey: string,
): Promise<string> {
  if (!apiKey.trim() || apiKey.trim() === 'your_openai_api_key_here') {
    return `[AI 윤문 결과 - API Key 미입력으로 Mock 응답]\n\n${currentDraft}\n\n---\n※ 실제 서비스에서는 gpt-4o 모델이 세계관, 플롯, 이전 회차 문체를 반영하여 윤문합니다.`;
  }

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const worldview = WORLDVIEW;
  const plot = PLOTS[episodeNumber] ?? `${episodeNumber}회차 플롯 정보가 없습니다.`;
  const prevEp = PREV_EPISODES[episodeNumber - 1] ?? '이전 회차 정보가 없습니다.';

  const systemPrompt = `당신은 웹소설 전문 편집자입니다.
아래에 제공된 세계관, 이번 회차 플롯, 이전 회차 문체를 엄격히 반영하여 사용자의 초안을 윤문 및 확장해 주세요.

[세계관]
${worldview}

[이번 회차 플롯]
${plot}

[이전 회차 문체 참고]
${prevEp}

규칙:
- 세계관의 설정과 인물 관계를 일관되게 유지하세요.
- 이전 회차의 문체(톤, 리듬, 내면 묘사 방식)를 이어받으세요.
- 플롯의 흐름을 놓치지 말고, 장면을 생동감 있게 확장하세요.
- 완성도 높은 웹소설 문장으로 다듬어 출력하세요.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음 초안을 윤문 및 확장해 주세요:\n\n${currentDraft}` },
    ],
    max_tokens: 2000,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content ?? '응답을 받지 못했습니다.';
}
