export type ScreenId = 'writing' | 'works' | 'archive' | 'drafts' | 'settings';

export type RewriteMode = 'draft' | 'plot';

export interface Character {
  id: string;
  name: string;
  description: string;
}

export interface CharacterRelation {
  fromId: string;
  toId: string;
  relation: string;
}

export interface Episode {
  number: number;
  title: string;
  plot: string;
  draft: string;
  rewriteDirection: string;
  aiResult: string;
  finalText: string;
}

export interface Work {
  id: string;
  title: string;
  worldview: string;
  characters: Character[];
  relations: CharacterRelation[];
  totalEpisodes: number;
  episodes: Episode[];
  styleGuide: string;
  styleRequirements: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  claudeApiKey: string;
  claudeModel: string;
  rewriteMode: RewriteMode;
  defaultWorkByScreen: Record<ScreenId, string | null>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  claudeApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  claudeModel: 'claude-sonnet-4-20250514',
  rewriteMode: 'draft',
  defaultWorkByScreen: {
    writing: null,
    works: null,
    archive: null,
    drafts: null,
    settings: null,
  },
};

export function createEmptyEpisode(number: number): Episode {
  return {
    number,
    title: '',
    plot: '',
    draft: '',
    rewriteDirection: '',
    aiResult: '',
    finalText: '',
  };
}

export function createEpisodes(count: number): Episode[] {
  return Array.from({ length: count }, (_, i) => createEmptyEpisode(i + 1));
}
