import { useEffect, useState, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SectionCard from '@/components/layout/SectionCard';
import PageToolbar from '@/components/layout/PageToolbar';
import EditorTextarea from '@/components/layout/EditorTextarea';
import EpisodeRow from '@/components/layout/EpisodeRow';
import SaveActionGroup from '@/components/layout/SaveActionGroup';
import { parseDraftMd, readTextFile } from '@/lib/draftMd';
import { getEpisodeDisplayTitle } from '@/lib/episodeUtils';
import { saveEpisodeDirectionMd, saveEpisodeDraftMd } from '@/lib/mdSync';
import type { Episode } from '@/types/novel';

function draftEpisodeStatus(ep: Episode): 'saved' | 'draft' | 'empty' {
  const hasDraft = Boolean(ep.draft?.trim());
  const hasDirection = Boolean(ep.rewriteDirection?.trim());
  if (hasDraft && hasDirection) return 'saved';
  if (hasDraft || hasDirection) return 'draft';
  return 'empty';
}

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
  const setEpisodeField = useNovelStore((s) => s.setEpisodeField);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('drafts', works, settings),
  );
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === selectedEpisode);

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
  }, [workId, selectedEpisode, episode?.draft, episode?.rewriteDirection]);

  useDebouncedSave(workId, selectedEpisode, draft, direction);

  const handleWorkChange = useCallback(
    (id: string) => {
      setWorkId(id);
      setDefaultWorkForScreen('drafts', id);
    },
    [setDefaultWorkForScreen],
  );

  const saveDraftNow = useCallback(() => {
    if (!workId) return;
    setEpisodeField(workId, selectedEpisode, 'draft', draft);
    toast.success(`${selectedEpisode}회차 초안이 저장되었습니다.`);
  }, [workId, selectedEpisode, draft, setEpisodeField]);

  const saveDirectionNow = useCallback(() => {
    if (!workId) return;
    setEpisodeField(workId, selectedEpisode, 'rewriteDirection', direction);
    toast.success(`${selectedEpisode}회차 각색 방향이 저장되었습니다.`);
  }, [workId, selectedEpisode, direction, setEpisodeField]);

  const importMd = useCallback(
    async (file: File) => {
      if (!workId || !work) return;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'md' && ext !== 'markdown' && ext !== 'txt') {
        toast.error('.md 또는 .txt 파일만 불러올 수 있습니다.');
        return;
      }

      try {
        const content = await readTextFile(file);
        const parsed = parseDraftMd(content);

        const targetEpisode = parsed.episodeNumber ?? selectedEpisode;
        if (parsed.episodeNumber && parsed.episodeNumber !== selectedEpisode) {
          if (parsed.episodeNumber >= 1 && parsed.episodeNumber <= work.totalEpisodes) {
            setSelectedEpisode(parsed.episodeNumber);
          }
        }

        setDraft(parsed.draft);
        setDirection(parsed.rewriteDirection);
        setEpisodeField(workId, targetEpisode, 'draft', parsed.draft);
        setEpisodeField(workId, targetEpisode, 'rewriteDirection', parsed.rewriteDirection);

        toast.success(`${file.name}에서 ${targetEpisode}회차 초안을 불러왔습니다.`);
      } catch {
        toast.error('파일을 읽는 중 오류가 발생했습니다.');
      }
    },
    [workId, work, selectedEpisode, setEpisodeField],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void importMd(file);
    event.target.value = '';
  };

  const selectedTitle = episode ? getEpisodeDisplayTitle(episode) : '';

  return (
    <div className="flex flex-col gap-4">
      <SectionCard noPadding bodyClassName="shrink-0 p-4 sm:p-5">
        <PageToolbar>
          <WorkSelector screen="drafts" value={workId} onChange={handleWorkChange} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!workId}
          >
            <Upload size={14} className="mr-1.5" />
            MD 파일 불러오기
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={handleFileChange}
          />
        </PageToolbar>
      </SectionCard>

      {!work ? (
        <p className="text-body text-muted-foreground">작품을 선택하세요.</p>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <SectionCard
            title="회차 목록"
            className="flex w-full shrink-0 flex-col md:w-[min(280px,38%)] md:min-w-[220px]"
            noPadding
            bodyClassName="flex flex-col p-0"
          >
            <ul className="max-h-64 divide-y divide-border overflow-y-auto md:max-h-[min(70vh,32rem)]">
              {work.episodes.map((ep) => (
                <EpisodeRow
                  key={ep.number}
                  number={ep.number}
                  title={getEpisodeDisplayTitle(ep)}
                  selected={selectedEpisode === ep.number}
                  status={draftEpisodeStatus(ep)}
                  onSelect={() => setSelectedEpisode(ep.number)}
                />
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            variant="editor"
            className="flex min-w-0 flex-1 flex-col"
            noPadding
            bodyClassName="flex flex-col gap-6 p-4 sm:p-5"
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <Label className="text-title font-semibold">
                {selectedEpisode}회차 · {selectedTitle}
              </Label>
              <span className="text-caption text-muted-foreground">
                초안 {draft.length}자 · 각색 {direction.length}자
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="draft-input" className="text-body font-semibold">
                  초안
                </Label>
                <SaveActionGroup
                  onSave={saveDraftNow}
                  onSaveMd={() =>
                    saveEpisodeDraftMd(work, selectedEpisode, {
                      draft,
                      rewriteDirection: direction,
                    })
                  }
                />
              </div>
              <EditorTextarea
                id="draft-input"
                fill
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="회차 초안을 입력하세요. 자동 저장됩니다."
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="direction-input" className="text-body font-semibold">
                  각색 방향
                </Label>
                <SaveActionGroup
                  onSave={saveDirectionNow}
                  onSaveMd={() => saveEpisodeDirectionMd(work, selectedEpisode, direction)}
                />
              </div>
              <EditorTextarea
                id="direction-input"
                rows={6}
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="예: 긴장감을 높이고, 이든의 내면 독백을 강화하세요."
              />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
