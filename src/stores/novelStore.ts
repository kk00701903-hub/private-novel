import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedWork } from '@/data/seedWork';
import type {
  AppSettings,
  Character,
  CharacterRelation,
  Episode,
  RewriteMode,
  ScreenId,
  Work,
} from '@/types/novel';
import { DEFAULT_SETTINGS, createEmptyEpisode, createEpisodes } from '@/types/novel';

interface NovelState {
  works: Work[];
  settings: AppSettings;
  createWork: (title?: string) => string;
  updateWork: (workId: string, patch: Partial<Omit<Work, 'id' | 'createdAt'>>) => void;
  deleteWork: (workId: string) => void;
  getWork: (workId: string) => Work | undefined;
  setEpisodeField: (
    workId: string,
    episodeNumber: number,
    field: keyof Episode,
    value: string,
  ) => void;
  setTotalEpisodes: (workId: string, count: number) => void;
  saveAiResult: (workId: string, episodeNumber: number, aiResult: string) => void;
  archiveEpisode: (workId: string, episodeNumber: number, finalText: string) => void;
  addCharacter: (workId: string, character: Omit<Character, 'id'>) => void;
  updateCharacter: (workId: string, characterId: string, patch: Partial<Character>) => void;
  removeCharacter: (workId: string, characterId: string) => void;
  addRelation: (workId: string, relation: CharacterRelation) => void;
  removeRelation: (workId: string, fromId: string, toId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setDefaultWorkForScreen: (screen: ScreenId, workId: string | null) => void;
  setRewriteMode: (mode: RewriteMode) => void;
}

function touchWork(work: Work): Work {
  return { ...work, updatedAt: new Date().toISOString() };
}

function updateEpisodeInWork(
  work: Work,
  episodeNumber: number,
  updater: (ep: Episode) => Episode,
): Work {
  return touchWork({
    ...work,
    episodes: work.episodes.map((ep) => (ep.number === episodeNumber ? updater(ep) : ep)),
  });
}

export const useNovelStore = create<NovelState>()(
  persist(
    (set, get) => ({
      works: [] as Work[],
      settings: DEFAULT_SETTINGS,

      createWork: (title = '새 작품') => {
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        const work: Work = {
          id,
          title,
          worldview: '',
          characters: [],
          relations: [],
          totalEpisodes: 10,
          episodes: createEpisodes(10),
          styleGuide: '',
          styleRequirements: '',
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ works: [...s.works, work] }));
        return id;
      },

      updateWork: (workId, patch) => {
        set((s) => ({
          works: s.works.map((w) => (w.id === workId ? touchWork({ ...w, ...patch }) : w)),
        }));
      },

      deleteWork: (workId) => {
        set((s) => ({
          works: s.works.filter((w) => w.id !== workId),
          settings: {
            ...s.settings,
            defaultWorkByScreen: Object.fromEntries(
              Object.entries(s.settings.defaultWorkByScreen).map(([k, v]) => [
                k,
                v === workId ? null : v,
              ]),
            ) as AppSettings['defaultWorkByScreen'],
          },
        }));
      },

      getWork: (workId) => get().works.find((w) => w.id === workId),

      setEpisodeField: (workId, episodeNumber, field, value) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId ? updateEpisodeInWork(w, episodeNumber, (ep) => ({ ...ep, [field]: value })) : w,
          ),
        }));
      },

      setTotalEpisodes: (workId, count) => {
        const safeCount = Math.max(1, Math.min(999, count));
        set((s) => ({
          works: s.works.map((w) => {
            if (w.id !== workId) return w;
            const existing = new Map(w.episodes.map((ep) => [ep.number, ep]));
            const episodes = Array.from({ length: safeCount }, (_, i) => {
              const num = i + 1;
              return existing.get(num) ?? createEmptyEpisode(num);
            });
            return touchWork({ ...w, totalEpisodes: safeCount, episodes });
          }),
        }));
      },

      saveAiResult: (workId, episodeNumber, aiResult) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId ? updateEpisodeInWork(w, episodeNumber, (ep) => ({ ...ep, aiResult })) : w,
          ),
        }));
      },

      archiveEpisode: (workId, episodeNumber, finalText) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? updateEpisodeInWork(w, episodeNumber, (ep) => ({ ...ep, finalText, aiResult: ep.aiResult || finalText }))
              : w,
          ),
        }));
      },

      addCharacter: (workId, character) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touchWork({
                  ...w,
                  characters: [...w.characters, { ...character, id: crypto.randomUUID() }],
                })
              : w,
          ),
        }));
      },

      updateCharacter: (workId, characterId, patch) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touchWork({
                  ...w,
                  characters: w.characters.map((c) => (c.id === characterId ? { ...c, ...patch } : c)),
                })
              : w,
          ),
        }));
      },

      removeCharacter: (workId, characterId) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touchWork({
                  ...w,
                  characters: w.characters.filter((c) => c.id !== characterId),
                  relations: w.relations.filter((r) => r.fromId !== characterId && r.toId !== characterId),
                })
              : w,
          ),
        }));
      },

      addRelation: (workId, relation) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId ? touchWork({ ...w, relations: [...w.relations, relation] }) : w,
          ),
        }));
      },

      removeRelation: (workId, fromId, toId) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touchWork({
                  ...w,
                  relations: w.relations.filter((r) => !(r.fromId === fromId && r.toId === toId)),
                })
              : w,
          ),
        }));
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      setDefaultWorkForScreen: (screen, workId) => {
        set((s) => ({
          settings: {
            ...s.settings,
            defaultWorkByScreen: { ...s.settings.defaultWorkByScreen, [screen]: workId },
          },
        }));
      },

      setRewriteMode: (mode) => {
        set((s) => ({ settings: { ...s.settings, rewriteMode: mode } }));
      },
    }),
    {
      name: 'novel-assistant-v1',
      onRehydrateStorage: () => (state) => {
        if (state && state.works.length === 0) {
          state.works = [createSeedWork()];
          const seedId = state.works[0].id;
          state.settings.defaultWorkByScreen = {
            writing: seedId,
            works: seedId,
            archive: seedId,
            drafts: seedId,
            settings: seedId,
          };
        }
      },
    },
  ),
);

export function resolveWorkId(screen: ScreenId, works: Work[], settings: AppSettings): string | null {
  const preferred = settings.defaultWorkByScreen[screen];
  if (preferred && works.some((w) => w.id === preferred)) return preferred;
  return works[0]?.id ?? null;
}
