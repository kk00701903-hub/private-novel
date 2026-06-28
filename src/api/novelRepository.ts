import type { Work } from '@/types/novel';

export interface NovelRepository {
  loadWorks(): Promise<Work[]>;
  saveWorks(works: Work[]): Promise<void>;
  syncWork(work: Work): Promise<void>;
}

/** localStorage via Zustand persist — primary storage */
export class LocalNovelRepository implements NovelRepository {
  async loadWorks(): Promise<Work[]> {
    const raw = localStorage.getItem('novel-assistant-v1');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as { state?: { works?: Work[] } };
      return parsed.state?.works ?? [];
    } catch {
      return [];
    }
  }

  async saveWorks(works: Work[]): Promise<void> {
    const raw = localStorage.getItem('novel-assistant-v1');
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state = { ...parsed.state, works };
    localStorage.setItem('novel-assistant-v1', JSON.stringify(parsed));
  }

  async syncWork(_work: Work): Promise<void> {
    // Zustand persist handles sync automatically
  }
}

/** Supabase cloud sync — stub for future implementation */
export class SupabaseNovelRepository implements NovelRepository {
  async loadWorks(): Promise<Work[]> {
    // TODO: implement Supabase fetch when auth is ready
    console.warn('[SupabaseNovelRepository] loadWorks not implemented');
    return [];
  }

  async saveWorks(_works: Work[]): Promise<void> {
    // TODO: implement Supabase upsert
    console.warn('[SupabaseNovelRepository] saveWorks not implemented');
  }

  async syncWork(_work: Work): Promise<void> {
    // TODO: implement single work sync
    console.warn('[SupabaseNovelRepository] syncWork not implemented');
  }
}

export const novelRepository: NovelRepository = new LocalNovelRepository();
