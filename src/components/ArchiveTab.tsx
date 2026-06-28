import { useEffect, useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ArchiveTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const archiveEpisode = useNovelStore((s) => s.archiveEpisode);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('archive', works, settings),
  );
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [editText, setEditText] = useState('');

  const work = works.find((w) => w.id === workId);
  const episode = work?.episodes.find((e) => e.number === episodeNumber);

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('archive', works, settings));
    }
  }, [workId, works, settings]);

  useEffect(() => {
    const source = episode?.aiResult || episode?.finalText || '';
    setEditText(source);
  }, [workId, episodeNumber, episode?.aiResult, episode?.finalText]);

  const handleSave = () => {
    if (!workId || !editText.trim()) {
      toast.error('저장할 내용이 없습니다.');
      return;
    }
    archiveEpisode(workId, episodeNumber, editText);
    toast.success(`${episodeNumber}회차 최종본이 저장되었습니다.`);
  };

  const aiOriginal = episode?.aiResult ?? '';
  const hasDiff = aiOriginal && editText !== aiOriginal;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Save size={18} className="text-primary" />
          결과 저장
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI 집필 탭에서 생성된 결과를 확인·편집한 뒤 최종본으로 저장합니다.
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

      {episode?.aiResult && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
          <FileText size={14} className="mb-1 inline text-primary" />
          {' '}메인 탭 AI 결과가 있습니다. 아래에서 편집 후 저장하세요.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <Label>편집 · 최종본 ({episodeNumber}회차)</Label>
        <Textarea
          rows={16}
          className="mt-2 font-mono text-sm"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="AI 결과가 없으면 직접 입력할 수 있습니다."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            최종본으로 저장
          </Button>
          <span className="text-xs text-muted-foreground">{editText.length}자</span>
        </div>
      </div>

      {hasDiff && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">AI 원본 (참고)</h3>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
            {aiOriginal}
          </pre>
        </div>
      )}
    </div>
  );
}
