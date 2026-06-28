import { useEffect, useState } from 'react';
import { Check, Copy, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import { rewriteEpisode } from '@/services/claudeService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function WritingTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const saveAiResult = useNovelStore((s) => s.saveAiResult);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('writing', works, settings),
  );
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === episodeNumber);
  const mode = settings.rewriteMode;
  const modeLabel = mode === 'draft' ? '초안 + 각색 방향' : '플롯 + 이전 회차';

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('writing', works, settings));
    }
  }, [workId, works, settings]);

  useEffect(() => {
    setResult(episode?.aiResult ?? '');
  }, [workId, episodeNumber, episode?.aiResult]);

  const handleWrite = async () => {
    if (!work) return;
    if (mode === 'draft' && !episode?.draft?.trim()) {
      toast.error('초안 입력 탭에서 초안을 먼저 입력하세요.');
      return;
    }
    if (mode === 'plot' && !episode?.plot?.trim()) {
      toast.error('작품 관리에서 해당 회차 플롯을 먼저 입력하세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const text = await rewriteEpisode(
        work,
        episodeNumber,
        mode,
        settings.claudeApiKey,
        settings.claudeModel,
      );
      setResult(text);
      if (workId) saveAiResult(workId, episodeNumber, text);
      toast.success('AI 집필이 완료되었습니다. 결과 저장 탭에서 최종본을 저장하세요.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '집필 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const prevCount = work?.episodes.filter((e) => e.number < episodeNumber && e.finalText.trim()).length ?? 0;

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
          <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            {modeLabel}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          설정 탭에서 집필 모드를 변경할 수 있습니다. Claude API Key가 없으면 Mock 응답으로 동작합니다.
        </p>
      </div>

      <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            참조 컨텍스트 요약
            {contextOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <ul className="space-y-1">
            <li>세계관: {work?.worldview ? `${work.worldview.slice(0, 80)}…` : '(없음)'}</li>
            <li>인물: {work?.characters.length ?? 0}명</li>
            <li>이전 회차 최종본: {prevCount}개 참조</li>
            {mode === 'draft' && (
              <>
                <li>초안: {episode?.draft ? `${episode.draft.length}자` : '(없음)'}</li>
                <li>각색 방향: {episode?.rewriteDirection ? '있음' : '(없음)'}</li>
              </>
            )}
            {mode === 'plot' && <li>플롯: {episode?.plot ? '있음' : '(없음)'}</li>}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid min-h-[420px] grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">입력 요약</h2>
          {mode === 'draft' ? (
            <>
              <div className="flex-1 overflow-auto rounded-lg bg-background p-3 text-sm">
                <p className="mb-2 font-medium text-muted-foreground">초안</p>
                <pre className="whitespace-pre-wrap font-mono text-xs">{episode?.draft || '(초안 입력 탭에서 작성)'}</pre>
              </div>
              <div className="rounded-lg bg-background p-3 text-sm">
                <p className="mb-1 font-medium text-muted-foreground">각색 방향</p>
                <p className="text-xs">{episode?.rewriteDirection || '(없음)'}</p>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto rounded-lg bg-background p-3 text-sm">
              <p className="mb-2 font-medium text-muted-foreground">플롯</p>
              <pre className="whitespace-pre-wrap text-xs">{episode?.plot || '(작품 관리에서 작성)'}</pre>
            </div>
          )}
          <Button type="button" onClick={handleWrite} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                AI 집필 중…
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                AI 집필 시작
              </>
            )}
          </Button>
        </section>

        <section className="flex min-h-[320px] flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">AI 결과</h2>
            <Button type="button" variant="ghost" size="sm" onClick={handleCopy} disabled={!result}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
          <div className="flex-1 overflow-auto rounded-lg bg-background p-3">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm">{result || 'AI 집필 결과가 여기 표시됩니다.'}</pre>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{result.length}자 · 결과 저장 탭에서 최종본 확정</p>
        </section>
      </div>
    </div>
  );
}
