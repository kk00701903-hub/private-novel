import { WORLDVIEW, PLOTS, PREV_EPISODES } from './novelData';
import type { Work } from '@/types/novel';
import { createEpisodes } from '@/types/novel';

export function createSeedWork(): Work {
  const now = new Date().toISOString();
  const episodes = createEpisodes(10);

  episodes[0] = {
    ...episodes[0],
    title: '이든의 각성',
    finalText: PREV_EPISODES[1] ?? '',
  };
  episodes[1] = {
    ...episodes[1],
    title: '왕궁 잠입',
    plot: PLOTS[2] ?? '',
    finalText: PREV_EPISODES[2] ?? '',
  };
  episodes[2] = {
    ...episodes[2],
    title: '고대 언어',
    plot: PLOTS[3] ?? '',
  };

  return {
    id: crypto.randomUUID(),
    title: '어둠이 깃든 왕국',
    worldview: WORLDVIEW,
    characters: [
      {
        id: crypto.randomUUID(),
        name: '이든',
        description: '평민 출신의 숨겨진 마법사. 왕국의 비밀을 파헤치는 주인공.',
      },
      {
        id: crypto.randomUUID(),
        name: '카엘',
        description: '왕궁 기사단장. 예리하고 의심이 많다.',
      },
      {
        id: crypto.randomUUID(),
        name: '리나',
        description: '마법 언어학자. 밤의 손과 연관이 암시된다.',
      },
    ],
    relations: [],
    totalEpisodes: 10,
    episodes,
    styleGuide:
      '문체는 긴박하고 몰입감 있게, 내면 묘사를 중시한다.\n\n짧은 문장과 긴 문장을 교차하며 리듬을 만든다.\n\n"대사"는 따옴표로, 내면 독백은 이탤릭 없이 자연스럽게.',
    styleRequirements: '웹소설 연재 형식. 회차당 2000~4000자 분량.',
    createdAt: now,
    updatedAt: now,
  };
}
