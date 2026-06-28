import { useEffect, useState, useCallback, useRef } from 'react';
import { Download, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/layout/SectionCard';
import PageToolbar from '@/components/layout/PageToolbar';
import EditorTextarea from '@/components/layout/EditorTextarea';
import {
  downloadTextFile,
  parseDraftMd,
  readTextFile,
  sanitizeFilename,
  serializeDraftMd,
} from '@/lib/draftMd';

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
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const saveNow = useCallback(() => {
    if (!workId) return;
    setEpisodeField(workId, episodeNumber, 'draft', draft);
    setEpisodeField(workId, episodeNumber, 'rewriteDirection', direction);
    toast.success(`${episodeNumber}회차 초안이 저장되었습니다.`);
  }, [workId, episodeNumber, draft, direction, setEpisodeField]);

  const exportMd = useCallback(() => {
    if (!work) return;
    const md = serializeDraftMd({
      workTitle: work.title,
      episodeNumber,
      draft,
      rewriteDirection: direction,
    });
    const filename = `${sanitizeFilename(work.title)}_${episodeNumber}회차_초안.md`;
    downloadTextFile(filename, md);
    saveNow();
    toast.success(`${filename} 파일로 저장했습니다.`);
  }, [work, episodeNumber, draft, direction, saveNow]);

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

        if (parsed.episodeNumber && parsed.episodeNumber !== episodeNumber) {
          if (parsed.episodeNumber >= 1 && parsed.episodeNumber <= work.totalEpisodes) {
            setEpisodeNumber(parsed.episodeNumber);
          }
        }

        const targetEpisode = parsed.episodeNumber ?? episodeNumber;
        setDraft(parsed.draft);
        setDirection(parsed.rewriteDirection);
        setEpisodeField(workId, targetEpisode, 'draft', parsed.draft);
        setEpisodeField(workId, targetEpisode, 'rewriteDirection', parsed.rewriteDirection);

        toast.success(`${file.name}에서 ${targetEpisode}회차 초안을 불러왔습니다.`);
      } catch {
        toast.error('파일을 읽는 중 오류가 발생했습니다.');
      }
    },
    [workId, work, episodeNumber, setEpisodeField],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void importMd(file);
    event.target.value = '';
  };

  return (
    <div className="page-stack mx-auto max-w-3xl">
      <SectionCard noPadding bodyClassName="p-4 sm:p-5">
        <PageToolbar>
          <WorkSelector screen="drafts" value={workId} onChange={handleWorkChange} />
          <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
        </PageToolbar>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={saveNow} disabled={!workId}>
            <Save size={14} className="mr-1.5" />
            지금 저장
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportMd} disabled={!work}>
            <Download size={14} className="mr-1.5" />
            MD 파일로 저장
          </Button>
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
        </div>
      </SectionCard>

      <SectionCard title={`초안 (${episodeNumber}회차)`}>
        <EditorTextarea
          id="draft-input"
          rows={14}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="회차 초안을 입력하세요. 자동 저장됩니다."
        />
        <p className="mt-2 text-caption text-muted-foreground">
          {draft.length}자 · 자동 저장 · MD 내보내기/가져오기 지원
        </p>
      </SectionCard>

      <SectionCard title="각색 방향">
        <EditorTextarea
          id="direction-input"
          rows={6}
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="예: 긴장감을 높이고, 이든의 내면 독백을 강화하세요."
        />
        <p className="mt-2 text-caption text-muted-foreground">
          MD 파일 frontmatter의 direction 필드로 함께 저장·불러옵니다.
        </p>
      </SectionCard>
    </div>
  );
}
