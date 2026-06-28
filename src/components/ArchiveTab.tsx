import { useEffect, useState } from 'react';
import { Archive, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/layout/SectionCard';
import PageToolbar from '@/components/layout/PageToolbar';
import EmptyState from '@/components/layout/EmptyState';
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
    <div className="page-stack mx-auto max-w-3xl">
      <SectionCard
        title="저장된 회차"
        description="AI 집필 탭에서 저장한 최종본이 여기에 표시됩니다. MD 파일로 다시 내려받을 수 있습니다."
        action={<Archive size={18} className="text-primary" />}
      />

      <SectionCard noPadding bodyClassName="p-4 sm:p-5">
        <PageToolbar>
          <WorkSelector
            screen="archive"
            value={workId}
            onChange={(id) => {
              setWorkId(id);
              setDefaultWorkForScreen('archive', id);
            }}
          />
          <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
        </PageToolbar>
      </SectionCard>

      {work && (
        <SectionCard title={`저장된 회차 (${savedEpisodes.length}/${work.totalEpisodes})`}>
          <div className="flex flex-wrap gap-2">
            {work.episodes.map((ep) => {
              const hasContent = ep.finalText.trim().length > 0;
              const isSelected = episodeNumber === ep.number;
              return (
                <button
                  key={ep.number}
                  type="button"
                  onClick={() => setEpisodeNumber(ep.number)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-caption transition-colors',
                    hasContent
                      ? isSelected
                        ? 'border-success bg-success/10 text-success'
                        : 'border-success/30 bg-success/5 text-success hover:bg-success/10'
                      : isSelected
                        ? 'border-border bg-muted text-muted-foreground'
                        : 'border-border/50 text-muted-foreground/50',
                  )}
                >
                  {ep.number}회
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {episode?.finalText ? (
        <SectionCard
          title={`${episodeNumber}회차 최종본`}
          action={
            <Button type="button" variant="outline" size="sm" onClick={handleExportMd}>
              <Download size={14} className="mr-1.5" />
              MD 다운로드
            </Button>
          }
        >
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-editor p-4 text-body leading-prose text-foreground">
            {episode.finalText}
          </pre>
          <p className="mt-2 text-caption text-muted-foreground">{episode.finalText.length}자</p>
        </SectionCard>
      ) : (
        <EmptyState
          icon={<FileText size={32} />}
          title={`${episodeNumber}회차에 저장된 내용이 없습니다.`}
          description="AI 집필 탭에서 집필 후 저장하세요."
        />
      )}
    </div>
  );
}
