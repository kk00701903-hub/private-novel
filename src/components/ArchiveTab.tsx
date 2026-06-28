import { useEffect, useState } from 'react';
import { Archive, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { saveFinalMdLocally } from '@/lib/draftMd';
import { cn } from '@/lib/utils';

export default function ArchiveTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('archive', works, settings),
  );
  const [episodeNumber, setEpisodeNumber] = useState(1);

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === episodeNumber);
  const savedEpisodes = work?.episodes.filter((e) => e.finalText.trim()) ?? [];

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('archive', works, settings));
    }
  }, [workId, works, settings]);

  const handleExportMd = () => {
    if (!work || !episode?.finalText.trim()) {
      toast.error('저장된 최종본이 없습니다. AI 집필 탭에서 먼저 저장하세요.');
      return;
    }
    const filename = saveFinalMdLocally(work.title, episodeNumber, episode.finalText);
    toast.success(`${filename} 다운로드`);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Archive size={18} className="text-primary" />
          저장된 회차
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI 집필 탭에서 저장한 최종본이 여기에 표시됩니다. MD 파일로 다시 내려받을 수 있습니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <WorkSelector
          screen="archive"
          value={workId}
          onChange={(id) => {
            setWorkId(id);
            setDefaultWorkForScreen('archive', id);
          }}
        />
        <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
      </div>

      {work && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            저장된 회차 ({savedEpisodes.length}/{work.totalEpisodes})
          </p>
          <div className="flex flex-wrap gap-2">
            {work.episodes.map((ep) => (
              <button
                key={ep.number}
                type="button"
                onClick={() => setEpisodeNumber(ep.number)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                  ep.finalText.trim()
                    ? episodeNumber === ep.number
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-300 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100'
                    : episodeNumber === ep.number
                      ? 'border-border bg-secondary text-muted-foreground'
                      : 'border-border/50 text-muted-foreground/50',
                )}
              >
                {ep.number}회
              </button>
            ))}
          </div>
        </div>
      )}

      {episode?.finalText ? (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Label>{episodeNumber}회차 최종본</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleExportMd}>
              <Download size={14} className="mr-1.5" />
              MD 다운로드
            </Button>
          </div>
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-sm text-foreground">
            {episode.finalText}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">{episode.finalText.length}자</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          <FileText size={32} className="mx-auto mb-2 opacity-40" />
          {episodeNumber}회차에 저장된 내용이 없습니다.
          <br />
          AI 집필 탭에서 집필 후 저장하세요.
        </div>
      )}
    </div>
  );
}
