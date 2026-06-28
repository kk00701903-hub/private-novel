import { useEffect, useState, useCallback } from 'react';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function useDebouncedSave(
  workId: string | null,
  episodeNumber: number,
  draft: string,
  direction: string,
) {
  const setEpisodeField = useNovelStore((s) => s.setEpisodeField);

  useEffect(() => {
    if (!workId) return;
    const t = window.setTimeout(() => {
      setEpisodeField(workId, episodeNumber, 'draft', draft);
      setEpisodeField(workId, episodeNumber, 'rewriteDirection', direction);
    }, 400);
    return () => window.clearTimeout(t);
  }, [workId, episodeNumber, draft, direction, setEpisodeField]);
}

export default function DraftsTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('drafts', works, settings),
  );
  const [episodeNumber, setEpisodeNumber] = useState(1);

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === episodeNumber);

  const [draft, setDraft] = useState(episode?.draft ?? '');
  const [direction, setDirection] = useState(episode?.rewriteDirection ?? '');

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('drafts', works, settings));
    }
  }, [workId, works, settings]);

  useEffect(() => {
    setDraft(episode?.draft ?? '');
    setDirection(episode?.rewriteDirection ?? '');
  }, [workId, episodeNumber, episode?.draft, episode?.rewriteDirection]);

  useDebouncedSave(workId, episodeNumber, draft, direction);

  const handleWorkChange = useCallback(
    (id: string) => {
      setWorkId(id);
      setDefaultWorkForScreen('drafts', id);
    },
    [setDefaultWorkForScreen],
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <WorkSelector screen="drafts" value={workId} onChange={handleWorkChange} />
        <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Label htmlFor="draft-input">초안 ({episodeNumber}회차)</Label>
        <Textarea
          id="draft-input"
          rows={14}
          className="mt-2 font-mono text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="회차 초안을 입력하세요. 자동 저장됩니다."
        />
        <p className="mt-2 text-xs text-muted-foreground">{draft.length}자 · 자동 저장</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Label htmlFor="direction-input">각색 방향</Label>
        <Textarea
          id="direction-input"
          rows={6}
          className="mt-2 text-sm"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="예: 긴장감을 높이고, 이든의 내면 독백을 강화하세요."
        />
      </div>
    </div>
  );
}
