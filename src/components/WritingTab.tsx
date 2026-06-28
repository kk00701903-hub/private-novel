import { useEffect, useState, useCallback } from 'react';
import { Check, Loader2, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { rewriteEpisode } from '@/services/claudeService';
import { getEpisodeDisplayTitle } from '@/lib/episodeUtils';
import SectionCard from '@/components/layout/SectionCard';
import PageToolbar from '@/components/layout/PageToolbar';
import EditorTextarea from '@/components/layout/EditorTextarea';
import EpisodeRow from '@/components/layout/EpisodeRow';

export default function WritingTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const saveAiResult = useNovelStore((s) => s.saveAiResult);
  const archiveEpisode = useNovelStore((s) => s.archiveEpisode);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('writing', works, settings),
  );
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [editText, setEditText] = useState('');
  const [loadingEpisode, setLoadingEpisode] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === selectedEpisode);
  const mode = settings.rewriteMode;
  const modeLabel = mode === 'draft' ? '초안 + 각색 방향' : '플롯 + 이전 회차';

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('writing', works, settings));
    }
  }, [workId, works, settings]);

  useEffect(() => {
    const source = episode?.aiResult || episode?.finalText || '';
    setEditText(source);
  }, [workId, selectedEpisode, episode?.aiResult, episode?.finalText]);

  const handleAiWrite = useCallback(
    async (episodeNumber: number) => {
      if (!work || !workId) return;
      const ep = work.episodes.find((e) => e.number === episodeNumber);
      if (mode === 'draft' && !ep?.draft?.trim()) {
        toast.error(`${episodeNumber}회차: 초안 입력 탭에서 초안을 먼저 입력하세요.`);
        return;
      }
      if (mode === 'plot' && !ep?.plot?.trim()) {
        toast.error(`${episodeNumber}회차: 작품 관리에서 플롯을 먼저 입력하세요.`);
        return;
      }

      setLoadingEpisode(episodeNumber);
      setSelectedEpisode(episodeNumber);
      try {
        const text = await rewriteEpisode(
          work,
          episodeNumber,
          mode,
          settings.claudeApiKey,
          settings.claudeModel,
        );
        saveAiResult(workId, episodeNumber, text);
        setEditText(text);
        toast.success(`${episodeNumber}회차 AI 집필 완료. 수정 후 저장하세요.`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : '집필 중 오류');
      } finally {
        setLoadingEpisode(null);
      }
    },
    [work, workId, mode, settings.claudeApiKey, settings.claudeModel, saveAiResult],
  );

  const handleSave = useCallback(async () => {
    if (!work || !workId || !editText.trim()) {
      toast.error('저장할 내용이 없습니다.');
      return;
    }
    setSaving(true);
    try {
      archiveEpisode(workId, selectedEpisode, editText);
      toast.success(`${selectedEpisode}회차 저장 완료 · 저장 탭 및 MD 파일`);
    } finally {
      setSaving(false);
    }
  }, [work, workId, selectedEpisode, editText, archiveEpisode]);

  const selectedTitle = episode ? getEpisodeDisplayTitle(episode) : '';

  return (
    <div className="page-stack min-h-[calc(100dvh-var(--header-h)-var(--bottom-nav-h))] md:min-h-[calc(100dvh-var(--header-h))]">
      <SectionCard noPadding bodyClassName="p-4 sm:p-5">
        <PageToolbar>
          <WorkSelector
            screen="writing"
            value={workId}
            onChange={(id) => {
              setWorkId(id);
              setDefaultWorkForScreen('writing', id);
            }}
          />
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-caption font-medium text-primary">
            {modeLabel}
          </span>
        </PageToolbar>
      </SectionCard>

      {!work ? (
        <p className="text-body text-muted-foreground">작품을 선택하세요.</p>
      ) : (
        <>
          <SectionCard title="회차 목록" noPadding bodyClassName="p-0">
            <ul className="max-h-56 divide-y divide-border overflow-y-auto md:max-h-64">
              {work.episodes.map((ep) => {
                const isLoading = loadingEpisode === ep.number;
                const isSelected = selectedEpisode === ep.number;
                return (
                  <EpisodeRow
                    key={ep.number}
                    number={ep.number}
                    title={getEpisodeDisplayTitle(ep)}
                    selected={isSelected}
                    finalText={ep.finalText}
                    aiResult={ep.aiResult}
                    onSelect={() => setSelectedEpisode(ep.number)}
                    action={
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        disabled={isLoading || (loadingEpisode !== null && !isLoading)}
                        onClick={() => void handleAiWrite(ep.number)}
                        className="shrink-0 text-caption"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={14} className="mr-1" />
                            AI 집필
                          </>
                        )}
                      </Button>
                    }
                  />
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            variant="editor"
            className="flex min-h-0 flex-1 flex-col"
            noPadding
            bodyClassName="flex min-h-0 flex-1 flex-col p-4 sm:p-5"
          >
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
              <Label className="text-title font-semibold">
                {selectedEpisode}회차 · {selectedTitle}
              </Label>
              <span className="text-caption text-muted-foreground">{editText.length}자</span>
            </div>
            <EditorTextarea
              fill
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={`${selectedEpisode}회차 AI 집필 버튼을 누른 뒤 내용이 표시됩니다.`}
            />
            <div className="mt-4 flex shrink-0 flex-wrap items-center gap-3">
              <Button type="button" onClick={handleSave} disabled={saving || !editText.trim()}>
                {saving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                저장 (저장 탭 + MD 파일)
              </Button>
              {episode?.finalText && editText === episode.finalText && (
                <span className="flex items-center gap-1 text-caption text-success">
                  <Check size={14} />
                  저장 탭에 반영됨
                </span>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
