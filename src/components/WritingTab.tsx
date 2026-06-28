import { useEffect, useState, useCallback } from 'react';
import { Check, Loader2, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { rewriteEpisode } from '@/services/claudeService';
import { saveFinalMdLocally } from '@/lib/draftMd';
import { cn } from '@/lib/utils';

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
      const filename = saveFinalMdLocally(work.title, selectedEpisode, editText);
      toast.success(`${selectedEpisode}회차 저장 완료 · 저장 탭 및 ${filename}`);
    } finally {
      setSaving(false);
    }
  }, [work, workId, selectedEpisode, editText, archiveEpisode]);

  const episodeStatus = (n: number) => {
    const ep = work?.episodes.find((e) => e.number === n);
    if (ep?.finalText.trim()) return 'saved';
    if (ep?.aiResult.trim()) return 'draft';
    return 'empty';
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <WorkSelector
            screen="writing"
            value={workId}
            onChange={(id) => {
              setWorkId(id);
              setDefaultWorkForScreen('writing', id);
            }}
          />
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            {modeLabel}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          회차별 AI 집필 → 내용 수정 → 저장 시 저장 탭에 반영되고 MD 파일이 다운로드됩니다.
        </p>
      </div>

      {!work ? (
        <p className="text-muted-foreground">작품을 선택하세요.</p>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">회차 목록</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {work.episodes.map((ep) => {
                const status = episodeStatus(ep.number);
                const isLoading = loadingEpisode === ep.number;
                const isSelected = selectedEpisode === ep.number;
                return (
                  <div
                    key={ep.number}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border p-3 transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedEpisode(ep.number)}
                      className="text-left text-sm font-semibold"
                    >
                      {ep.number}회차
                      {status === 'saved' && (
                        <span className="ml-1 text-[10px] font-normal text-emerald-400">저장됨</span>
                      )}
                      {status === 'draft' && (
                        <span className="ml-1 text-[10px] font-normal text-amber-400">집필됨</span>
                      )}
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      disabled={isLoading || loadingEpisode !== null}
                      onClick={() => void handleAiWrite(ep.number)}
                      className="w-full text-xs"
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
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Label>{selectedEpisode}회차 · 집필 내용 편집</Label>
              <span className="text-xs text-muted-foreground">{editText.length}자</span>
            </div>
            <Textarea
              rows={18}
              className="font-mono text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={`${selectedEpisode}회차 AI 집필 버튼을 누른 뒤 내용이 표시됩니다.`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={handleSave} disabled={saving || !editText.trim()}>
                {saving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                저장 (저장 탭 + MD 파일)
              </Button>
              {episode?.finalText && editText === episode.finalText && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check size={14} />
                  저장 탭에 반영됨
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
